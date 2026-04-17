---
title: "Parsers JSON streaming — Cómo manejar arrays de un millón de registros"
description: "No puedes JSON.parse un archivo de 5 GB. Los parsers JSON streaming procesan arrays de uno en uno. Así funcionan oboe.js, stream-json e ijson en la práctica."
category: performance
relatedToolIds: ["viewer", "json-to-csv"]
publishedAt: 2026-04-17
lang: es
tags: ["streaming", "performance", "large-files"]
excerpt: "JSON.parse necesita materializar el documento entero en memoria. Los parsers streaming emiten eventos según avanzan. Esa diferencia es la única forma de manejar archivos de varios gigas."
faq:
  - q: "¿Puedo hacer JSON.parse a un archivo de 5 GB?"
    a: "No — no con seguridad. `JSON.parse` materializa el documento entero en memoria, y un blob JSON de 5 GB infla a ~20+ GB de heap V8 por overhead de objeto. El `--max-old-space-size` por defecto de Node mata el proceso mucho antes de terminar. Por encima de 100 MB necesitas un parser streaming (`stream-json`, `oboe.js`, `ijson`, `jq --stream`) que procesa el input como stream de bytes y emite eventos según hay estructura disponible, manteniendo como mucho un registro en memoria a la vez. Por debajo de 10 MB, el parser normal va bien y es más simple."
  - q: "¿Qué librería de Node.js es la mejor para streaming JSON?"
    a: "`stream-json` es la elección de facto para pipelines de producción en Node. Enchufa con la API nativa de Streams, así que lo pipeas como cualquier transform: `fs.createReadStream(file).pipe(parser()).pipe(streamArray()).on('data', ...)`. Trae filtros como `Pick` para enfocarte en un subárbol específico y streamers como `StreamArray` y `StreamValues` para formas comunes. Para renderizado progresivo en navegador, usa `oboe.js`, que emite valores en cuanto matchean un selector tipo JSONPath. Ambos mantienen la memoria plana sin importar el tamaño del input."
  - q: "¿Cuándo es streaming peor que batching?"
    a: "Streaming gana en memoria pero pierde en ergonomía y acceso aleatorio. Para archivos de menos de 10 MB, el overhead de setup — pipes, event handlers, lógica de recuperación de output parcial — no compensa; `JSON.parse(text)` es una línea. Streaming también renuncia a validación de documento completo (no puedes validar con JSON Schema un documento que nunca materializas), acceso aleatorio (saltar al registro 900.000 requiere streamear los 899.999 primeros) y recuperación limpia de errores (si el input se trunca a mitad de stream, ya te comprometiste a side effects previos). Escribe output a una ubicación staging y haz swap atómico para mitigar el riesgo de fallo parcial."
  - q: "¿Por qué es NDJSON más fácil de streamear que un array JSON?"
    a: "NDJSON (newline-delimited JSON) pone un valor JSON completo por línea, sin array envolvente. Toda tool capaz de streaming — `jq`, `stream-json`, `ijson`, incluso `awk`/`head`/`tail` — lo maneja nativamente porque dividir por newlines es trivial y cada línea parsea independientemente. Los exports de BigQuery, los sinks de Kafka Connect y la mayoría de agregadores de logs emiten NDJSON por eso. El tradeoff es que NDJSON no es 'JSON válido' — sin array externo — pero nunca pretendió serlo. Si controlas el productor y esperas output grande, emite NDJSON."
  - q: "¿Soporta streaming el módulo json estándar de Python?"
    a: "No. `json.load()` y `json.loads()` materializan el documento completo. Usa `ijson` como respuesta estándar de streaming: `for user in ijson.items(f, 'users.item'):` yield-ea objetos completos de uno en uno desde el path que especificas. `ijson.parse(file)` te da el token stream crudo para control fino. Instala `ijson[yajl]` en producción para obtener el backend yajl basado en C, sustancialmente más rápido que el fallback puro Python. `encoding/json` de Go trae un iterator `Decoder.Token()` de serie, sin dependencia externa."
---

Un export JSON de 5 GB de tu base de datos de analytics aterriza en S3. Tienes que transformarlo, filtrarlo y mandar el resultado a CSV para un stakeholder. `JSON.parse` no va a funcionar — quiere construir el árbol de objetos entero en memoria, que en Node son 20+ GB de heap, que significa OOM. La misma historia se repite en agregación de logs, migraciones, restauración de backups y cualquier cosa que lidie con "JSON pero grande."

Los parsers JSON streaming son la respuesta. Procesan el input como stream de bytes y emiten eventos según la estructura se va teniendo disponible, sin mantener nunca el documento entero en memoria. Esta guía cubre cómo funcionan, las tres librerías canónicas y los tradeoffs frente al parser normal.

## Cómo funcionan los parsers streaming

Todo parser JSON streaming es una máquina de estados que recorre el stream de bytes y emite eventos: "empezó un objeto", "la clave es `id`", "el valor es el string `abc123`", "terminó un objeto". El caller registra handlers para los eventos que le importan e ignora el resto. El parser nunca materializa el árbol entero — como mucho mantiene en una pila los containers actualmente abiertos.

Es el mismo patrón que SAX para XML, y las librerías a menudo se presentan como "SAX-style para JSON."

Esto es cómo se ve el stream de eventos para un documento pequeño:

```js
// input
// {"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Ben"}]}

// eventos (conceptual)
startObject
key("users")
startArray
  startObject
    key("id"); value(1)
    key("name"); value("Ana")
  endObject
  startObject
    key("id"); value(2)
    key("name"); value("Ben")
  endObject
endArray
endObject
```

En la práctica, la mayoría de librerías traen una capa de conveniencia que te deja decir "emite cada elemento de `users[]` como objeto completo" — la librería acumula los bytes de un user, lo emite y sigue.

## Las librerías canónicas

| Librería | Lenguaje | Estilo | Ideal para |
| --- | --- | --- | --- |
| `stream-json` | Node.js | Streams + pipes de Node | Pipelines de producción en Node |
| `oboe.js` | Navegador + Node | Callbacks basados en selector | Renderizado incremental de respuestas HTTP |
| `ijson` | Python | Iterator / generator | Scripts, ETL |
| `encoding/json` con `Decoder.Token()` | Go | Token iterator | Librería estándar, cero deps |
| `jq --stream` | Shell | Eventos `[path, value]` | One-offs rápidos |

Todos manejan input de varios GB con heap pequeño. La elección se reduce a lenguaje y ergonomía.

## stream-json en Node

`stream-json` integra con la API de Streams de Node, lo que significa que lo pipeas como cualquier transform:

```js
import fs from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { pick } from 'stream-json/filters/Pick.js';

fs.createReadStream('huge.json')
  .pipe(parser())
  .pipe(pick({ filter: 'users' }))       // enfócate en el array "users"
  .pipe(streamArray())                    // emite cada elemento por separado
  .on('data', ({ key, value }) => {
    // value es un user completamente materializado
    if (value.age >= 18) {
      writeCsvRow(value);
    }
  })
  .on('end', () => console.log('done'));
```

La memoria se mantiene plana — solo un user a la vez vive en JS. Cambias acceso aleatorio (no puedes saltar al user 500.000 barato) por memoria acotada.

## oboe.js para el navegador

oboe.js se construyó para el caso en que una respuesta HTTP es grande y quieres renderizar resultados progresivamente en vez de esperar al body entero. Su API usa selectores tipo JSONPath:

```js
import oboe from 'oboe';

oboe('/api/users')
  .node('users.*', user => {
    // dispara por cada user en cuanto se recibe completo
    appendToTable(user);
  })
  .done(full => console.log(`got ${full.users.length} users`));
```

oboe bufferea al mínimo: cuando tiene un valor completo que matchea el selector, lo emite y lo descarta. Así funcionaba el search de primer resultado del viejo Google Maps — los resultados aparecían antes de que el body terminase de bajar.

## ijson para Python

El módulo `json` de Python no es streaming. `ijson` es la respuesta estándar:

```python
import ijson

with open('huge.json', 'rb') as f:
    for user in ijson.items(f, 'users.item'):
        # user es un dict completo, de uno en uno
        if user['age'] >= 18:
            write_csv_row(user)
```

`ijson.items(file, path)` yield-ea objetos completos en el path dado. `ijson.parse(file)` te da el token stream crudo si necesitas control fino. Trae backends para `yajl` (C, el más rápido) y puro Python; instala `ijson[yajl]` para producción.

## jq en modo streaming

Si estás en un prompt de shell, `jq --stream` es la forma más fácil de procesar un archivo grande sin instalar nada extra:

```bash
# emite cada user como NDJSON, filtrando adultos
jq -c --stream '
  select(.[0][0] == "users" and (.[0] | length) == 2)
  | .[1]
' huge.json | jq -c 'select(.age >= 18)'
```

El modo `--stream` es un poco adquirido — emite eventos `[path, value]` y espera que reensambles — pero para one-offs suele ser más rápido escribirlo que instalar nada.

## Los tradeoffs

Streaming te da uso plano de memoria y output progresivo. Renuncias a:

- **Acceso aleatorio.** Solo ves lo que ya ha pasado. Saltar al elemento 900.000 significa streamear los 899.999 primeros.
- **Validación del documento completo.** No puedes correr un validador JSON Schema sobre un documento que nunca materializas. Puedes validar cada elemento individualmente, que suele ser lo que quieres de todos modos.
- **Recuperación de errores.** Si el input se trunca al byte 4,2 GB, ya te comprometiste a los side effects de los primeros 4,2 GB. Diseña tu pipeline de forma que el output parcial sea seguro — escribe a una tabla staging, luego swap.
- **Ergonomía.** `JSON.parse(text)` es una línea; el setup streaming son diez. Para archivos pequeños, no vale la pena.

## Cuándo tirar de streaming

Reglas prácticas, independientemente del lenguaje:

- **Input bajo 10 MB:** usa el parser normal. La complejidad no se justifica.
- **Input 10-100 MB:** el parser normal sigue funcionando pero vigila la memoria pico. En Node, un JSON de 100 MB puede llegar a 400 MB de heap durante el parse.
- **Input de más de 100 MB o sin cota:** streaming. Sin excepciones.
- **Input es un único objeto enorme, no un array:** streaming solo ayuda si puedes saltar partes. Un único objeto de 2 GB sin array a la vista es solo grande, y necesitas un modelo de datos distinto.

## NDJSON y el formato amigable al streaming

Si controlas el productor, considera emitir **NDJSON** (newline-delimited JSON) en vez de un array gigante. Cada línea es un valor JSON independiente. Toda tool capaz de streaming — jq, stream-json, ijson, incluso `awk`/`head`/`tail` — lo maneja nativamente.

```json
{"id": 1, "name": "Ana"}
{"id": 2, "name": "Ben"}
{"id": 3, "name": "Cyr"}
```

Este es el formato que emiten BigQuery, los sinks de Kafka Connect y la mayoría de agregadores de logs. También es trivial procesarlo con [JSON a CSV](/es/json-to-csv/) línea a línea. El precio es que no es "JSON válido" — sin array envolvente — pero nunca se pretendió que lo fuera.

## Inspección interactiva

Cuando tienes un archivo de muestra en el rango 1-50 MB, el [Visor JSON](/es/viewer/) lo carga en navegador y te deja navegar el árbol de forma lazy. Por encima, usa un parser streaming para extraer una muestra e inspeccionar la muestra. Abrir un JSON de 2 GB en cualquier GUI es pedir lágrimas.

## Lectura relacionada

- [Estrategias de compresión JSON](/es/docs/json-compression-strategies/) — gzip solo recorta un JSON multi-GB a un tercio de su tamaño, lo cual puede bastar para que te quedes con un parser no-streaming.
- [JSONPath vs JMESPath vs jq](/es/docs/jsonpath-vs-jmespath-vs-jq/) — el modo streaming de jq es la puerta de entrada más fácil al streaming si ya te defiendes con la sintaxis básica.
