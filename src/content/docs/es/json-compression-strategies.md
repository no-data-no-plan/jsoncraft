---
title: "Estrategias de compresión JSON — gzip, MessagePack, CBOR y cuándo gana cada uno"
description: "JSON es texto y se comprime genial. Pero a veces quieres un formato binario. Cuándo basta gzip y cuándo se ganan el sueldo MessagePack o CBOR."
category: performance
relatedToolIds: ["formatter"]
publishedAt: 2026-04-17
lang: es
tags: ["compression", "msgpack", "cbor", "gzip"]
excerpt: "JSON más gzip ya gana en el cable. Los formatos binarios solo se adelantan cuando velocidad de parse, suelo de tamaño o fidelidad de tipos importan más que la ubicuidad."
---

JSON tiene una debilidad real de rendimiento: es texto. Cada entero es una cadena de dígitos, cada clave se escribe en cada objeto, cada booleano son cuatro o cinco bytes. Para un payload grande esto es derrochador, y por eso todo stack HTTP mainstream aplica gzip por defecto y cada pocos años aparece un nuevo formato binario propuesto como "JSON pero más rápido."

Esta guía recorre las tres alternativas prácticas — **gzip sobre JSON**, **MessagePack** y **CBOR** — y cuándo cada una es realmente la respuesta correcta. Spoiler: la mayor parte del tiempo sigue siendo JSON con gzip.

## Los candidatos

| Formato | Tipo | Tamaño típico vs JSON crudo | Velocidad parse (V8) | ¿Schema? | Ubicuidad |
| --- | --- | --- | --- | --- | --- |
| JSON (crudo) | Texto | 100% | **Más rápido** (nativo) | No | Universal |
| JSON + gzip | Texto + comprimido | 20-30% | Descomprimir + parsear | No | Universal en la web |
| MessagePack | Binario | 60-75% (sin comprimir) | Más lento que JSON.parse | No | Bueno, depende del lenguaje |
| CBOR (RFC 8949) | Binario | 60-75% (sin comprimir) | Comparable a MsgPack | No | Estándar IETF, menos tooling |
| Protocol Buffers | Binario + schema | 30-60% | Rápido (code-gen) | **Sí** | Ecosistema gRPC |
| Apache Avro | Binario + schema | 30-50% | Rápido | **Sí** | Pipelines big-data |

Dos cosas saltan a la vista. **En el cable, JSON + gzip es la opción más pequeña sin schema** — el texto comprime mejor que los formatos binarios ligeramente empaquetados. Y **`JSON.parse` es el parser puro más rápido en V8** para la mayoría de payloads reales, porque es C++ nativo y los formatos binarios necesitan un paso extra de decodificación.

## gzip casi siempre basta

Un payload JSON típico tiene redundancia enorme: claves repetidas en cada objeto, identificadores camelCase largos, dígitos ASCII para números. gzip (DEFLATE) se lo come de desayuno. Espera 70-80% de reducción de tamaño en cualquier documento JSON mayor de ~1 KB, y 80-90% en respuestas de API con objetos repetidos.

```
$ wc -c api_response.json
1948221 api_response.json           # 1,95 MB

$ gzip -c api_response.json | wc -c
 287904                             # 288 KB — reducción del 85%
```

Todo stack HTTP moderno — nginx, Cloudflare, todo load balancer cloud, todo runtime de serverless — lo hace de forma transparente cuando el cliente manda `Accept-Encoding: gzip`. Casi seguro ya estás pagando este precio una vez, en el edge.

El caso interesante es cuando tienes JSON *en reposo* — en disco, en S3, en un topic de Kafka. Ahí eliges. gzip sigue siendo un excelente default; `zstd` comprime algo mejor y descomprime 2-5x más rápido a ratios similares, y es el default moderno correcto si controlas ambos extremos.

## MessagePack

MessagePack es un formato binario diseñado para ser "como JSON, pero más pequeño y rápido." Mapea 1:1 al sistema de tipos de JSON — maps, arrays, strings, números, booleanos, null — más algunas extensiones como datos binarios y timestamps.

Un payload MessagePack es el 60-75% del tamaño JSON crudo sin comprimir. Las claves siguen escribiéndose (no hay schema), así que el ahorro viene de codificar números en binario, menos bytes estructurales (sin comillas, sin comas) y empaquetado ajustado de enteros.

```js
import { encode, decode } from '@msgpack/msgpack';

const payload = { users: [{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }] };
const bytes = encode(payload);        // Uint8Array, 32 bytes
const back  = decode(bytes);           // objeto equivalente
```

**Cuándo gana MsgPack:**

- Datos binarios junto a estructura tipo JSON. Codificar un `Uint8Array` en JSON implica base64, que infla un 33%. En MsgPack es tipo de primera clase.
- Almacenamiento donde no puedes aplicar gzip (algunas radios IoT, algunos stacks embebidos).
- Tráfico entre servicios donde controlas ambos extremos y quieres ahorrar el coste CPU de gzip.

**Cuándo no:**

- Sobre HTTP, después de gzip, MsgPack suele ser más grande que JSON-sobre-gzip.
- `JSON.parse` en V8 es más rápido que decode de MsgPack para payloads pequeños, porque el parser JSON de V8 está extraordinariamente optimizado.
- Debuggability: JSON se lee en cualquier herramienta, en cualquier sitio. MsgPack necesita un decoder.

## CBOR

CBOR (Concise Binary Object Representation, RFC 8949) es el equivalente estandarizado por IETF a MessagePack. El formato de cable es similar en tamaño y coste de parse. La diferencia real es que CBOR es un estándar con spec formal, usado en IoT (CoAP), WebAuthn y el formato de firma COSE.

Si tu restricción es "necesitamos representación binaria de objeto y un RFC que citar," CBOR es el hermano vestido más formalmente de MessagePack. Para propósitos puros de ingeniería, elige el que tenga mejor soporte de librería en tu stack.

## Schema-driven: Protobuf y Avro

Protocol Buffers y Avro están en categoría distinta. Exigen un schema en ambos extremos, y lo usan para codificar solo los *datos*, no los nombres de campo ni la estructura. Un mensaje Protobuf para `{id: 1, name: "Ana"}` con `id` como field 1 y `name` como field 2 es aproximadamente:

```
08 01 12 03 41 6e 61
```

Eso son siete bytes para lo que JSON escribe en 22. Protobuf es la respuesta correcta cuando:

- Controlas ambos extremos y puedes coordinar cambios de schema.
- La velocidad de parse importa más que la ubicuidad — los decoders Protobuf usan código generado, que es más rápido que parsear JSON en la mayoría de lenguajes.
- Quieres garantías de compatibilidad backward y forward a nivel de cable.

El coste es operacional: cada mensaje tiene un artefacto schema que debes shippar, versionar y evolucionar. Para servicios internos es un trato justo; para APIs públicas es casi siempre equivocado. Stripe, GitHub y toda API pública digna de mención usan JSON.

## Benchmark sobre tu propio payload

Nunca elijas un formato según el benchmark de otro. JSON vs MsgPack vs CBOR depende de la forma de tus datos — muchos mensajes pequeños vs uno grande, con mucho numérico vs mucho string, muy anidado vs plano.

Un benchmark rápido en Node:

```js
import { performance } from 'node:perf_hooks';
import { encode, decode } from '@msgpack/msgpack';
import { gzipSync } from 'node:zlib';

const payload = JSON.parse(await readFile('sample.json', 'utf8'));
const jsonStr = JSON.stringify(payload);

// tamaños
console.log('json       ', jsonStr.length);
console.log('json+gzip  ', gzipSync(jsonStr).length);
console.log('msgpack    ', encode(payload).length);
console.log('msgpack+gz ', gzipSync(encode(payload)).length);

// velocidad de parse (mediana de N)
const N = 1000;
let t = performance.now();
for (let i = 0; i < N; i++) JSON.parse(jsonStr);
console.log('JSON.parse   ', (performance.now() - t) / N, 'ms/op');

const mpBytes = encode(payload);
t = performance.now();
for (let i = 0; i < N; i++) decode(mpBytes);
console.log('mp.decode    ', (performance.now() - t) / N, 'ms/op');
```

Ejecútalo con tres tamaños de tus datos reales. Los resultados te sorprenderán en una de dos direcciones: o gzip lo maneja todo y los formatos binarios añaden complejidad sin beneficio, o tus datos tienen una propiedad específica (muchos blobs binarios, muchos enteros) que hace al binario un ganador claro.

## Un árbol de decisión

1. **¿El tráfico es HTTP y público?** JSON. gzip/br ya los aplica el edge. Cualquier otra cosa te cuesta debuggability por un pequeño porcentaje.
2. **¿El tráfico es interno entre dos servicios que controlas, y la CPU es cuello de botella?** Considera Protobuf o MsgPack. Benchmark primero.
3. **¿Almacenas en reposo?** JSON + zstd. Rápido, pequeño, sin schema.
4. **¿Almacenas en reposo Y el schema es estable Y necesitas leer selectivamente (estilo columnar)?** Apache Parquet con Arrow. Juego totalmente distinto.
5. **¿El payload es mayormente datos binarios con algo de metadata?** MsgPack o CBOR, porque base64 en JSON duele.

## Una nota sobre velocidad de parser

La intuición de "los formatos binarios son más rápidos de parsear" suele estar equivocada en JavaScript. El `JSON.parse` de V8 es una de las rutinas más optimizadas del motor — tiene una máquina de estados acelerada con SIMD y fast paths especializados para formas comunes. Un parser MsgPack escrito a mano en JS le perderá en cualquier payload pequeño-medio. Donde el binario gana es cuando el parseo domina *y* el decoder es código generado en un lenguaje rápido (Go, Rust, C++).

Antes de optimizar para velocidad de parse en V8, confirma con un profile que es realmente el cuello de botella. La mayoría de problemas de "JSON es demasiado lento" son en realidad "hacemos JSON.parse sobre lo mismo 300 veces por request."

## Lectura relacionada

- [Parsers JSON streaming](/es/docs/json-streaming-large-files/) — si tu payload es lo bastante grande para necesitar compresión, también puede serlo para necesitar streaming.
- [JSON vs YAML vs TOML](/es/docs/json-vs-yaml-vs-toml-decision/) — la compresión no cambia qué formato de texto es correcto para configuración.
- [Pitfalls de seguridad en JSON](/es/docs/json-security-pitfalls/) — una bomba JSON gzippeada (pequeña en el cable, enorme al descomprimir) es un ataque real. Capa `Content-Length` antes de descomprimir.
