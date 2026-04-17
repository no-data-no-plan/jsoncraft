---
title: "JSONPath vs JMESPath vs jq — Cuándo usar cada uno"
description: "Tres lenguajes de consulta para JSON, tres sweet spots distintos. Comparación práctica de JSONPath, JMESPath y jq con queries reales y cuándo tirar de cada uno."
category: ecosystem
relatedToolIds: ["jsonpath", "viewer"]
publishedAt: 2026-04-17
lang: es
tags: ["jsonpath", "jmespath", "jq", "query"]
excerpt: "JSONPath para selección. JMESPath para AWS. jq para transformación. Misma familia de problemas, tres respuestas distintas."
faq:
  - q: "¿Está por fin estandarizado JSONPath?"
    a: "Sí, RFC 9535 se publicó en 2024 y estandarizó JSONPath tras 17 años de fragmentación de dialectos. Antes del RFC, expresiones como `$..book[0]` y los filter expressions se comportaban distinto entre implementaciones. El RFC zanja la mayoría de esos desacuerdos y define testing de conformidad. En la práctica, espera un periodo de transición — las librerías todavía están migrando a full compliance RFC 9535, y engines JSONPath antiguos en código de producción pueden seguir usando semántica dialecto-Goessner. Consulta los docs de tu librería para ver qué spec implementa antes de portar queries entre stacks."
  - q: "¿Cuándo es jq excesivo frente a JSONPath o JMESPath?"
    a: "jq es un lenguaje de programación funcional completo con variables, funciones, recursión y módulos. Si tu query solo selecciona valores por path — por ejemplo, dentro de una tool de Kubernetes que espera JSONPath, o un campo de error-path de una librería — una dependencia jq añade peso de build y curva de aprendizaje que no necesitas. JMESPath es el sweet spot cuando necesitas selección más reshaping ligero en un string de query portable. Tira de jq cuando necesites transformación real, condicionales, joins, agrupaciones o streaming sobre inputs grandes."
  - q: "¿Qué lenguaje de query uso dentro del AWS CLI?"
    a: "JMESPath. Se diseñó en AWS específicamente para consultar respuestas de API, y cada flag `--query` del AWS CLI y cada parámetro `query` en los paginadores del AWS SDK acepta JMESPath. Su gramática ABNF formal y su suite de tests extensiva hacen que toda implementación conforme se comporte igual, lo cual importa cuando escribes queries que viajan entre scripts bash, CloudFormation y código Lambda. JSONPath y jq funcionan fuera del tooling AWS pero no ofrecen ventaja dentro."
  - q: "¿Puedo transformar la estructura de salida con JSONPath?"
    a: "No. JSONPath es puramente selector — devuelve un conjunto de nodos del input, y no puede renombrar campos, construir objetos nuevos ni computar valores. Si necesitas rehacer la salida — convertir `{InstanceId: 'i-abc', State: {Name: 'running'}}` en `{Id: 'i-abc', State: 'running'}` — usa JMESPath, que tiene multi-select hashes exactamente para eso, o jq, cuya construcción de objetos `{Id: .InstanceId, State: .State.Name}` es uno de sus patrones centrales. Usa JSONPath cuando la respuesta ya existe dentro del input."
  - q: "¿Funciona jq en el navegador?"
    a: "Sí, vía `jq-wasm` o `jq-web`, que compilan la implementación C canónica a WebAssembly. Ambos corren enteramente en cliente y manejan el mismo lenguaje de query que el binario `jq`. El tradeoff es el bundle size — el build wasm añade cientos de KB a tu página, así que rara vez vale la pena shipparlo a usuarios cuando una librería JSONPath o JMESPath más pequeña haría el trabajo. Tira de jq-wasm cuando construyas una herramienta de dev donde la potencia completa de jq importa más que los bytes, como un playground de queries interactivo."
---

Tienes un blob grande de JSON y quieres un trozo — o una versión transformada de varios trozos. Hay tres lenguajes de consulta para JSON ampliamente desplegados en 2026: **JSONPath**, **JMESPath** y **jq**. A primera vista se parecen y resuelven problemas solapados, pero sus sweet spots son genuinamente distintos.

Esta guía recorre qué es cada uno, de dónde viene y cuándo tirar de él.

## La familia de un vistazo

| Propiedad | JSONPath | JMESPath | jq |
| --- | --- | --- | --- |
| Primera publicación | 2007 (Stefan Goessner) | 2013 (AWS) | 2012 (Stephen Dolan) |
| Estandarizado | RFC 9535 (2024) | Spec formal con gramática | Informal, impl de facto canónica |
| Uso principal | Selección / extracción de paths | Selección + reshaping ligero | Selección + transformación + scripting |
| Funciones builtin | Pocas (varía por impl) | ~30 funciones tipadas | 100+ funciones, lambdas, variables |
| ¿Turing-completo? | No | No | **Sí** |
| Runtime típico | Librería in-process | Librería in-process | Binario standalone (`jq`) o librería |
| Implementaciones | Muchas, divergentes | AWS SDK, jmespath.js, jmespath.py | Binario `jq` C canónico, gojq, jq-web |

## JSONPath: el selector simple

JSONPath es el "XPath para JSON" que Stefan Goessner esbozó en un post de blog de 2007. Durante 17 años no tuvo spec formal, lo que resultó en fragmentación de dialectos — `$..book[0]` funciona distinto entre implementaciones, y features como filter expressions son inconsistentes. **RFC 9535**, publicado en 2024, por fin estandarizó el lenguaje y zanjó la mayoría de esos desacuerdos.

Una expresión JSONPath selecciona un conjunto de nodos de un documento JSON. Es solo lectura y puramente selector — no hay paso de mapping ni transformación.

```
$                          # raíz
$.store.book[0]            # primer libro
$.store.book[*].title      # todo título de libro
$..author                  # cualquier author en cualquier parte
$.store.book[?(@.price<10)] # filter expression
$.store.book[0,2]          # índices específicos
$.store.book[:3]           # slice
```

Puedes probarlas en vivo en el [Tester JSONPath](/es/jsonpath/) contra cualquier payload.

**Usa JSONPath cuando:**

- Solo necesitas sacar valores por path.
- Trabajas dentro de una librería que ya lo usa (paths de `errors` de JSON Schema, muchos exploradores GUI).
- Necesitas algo lo bastante simple como para que un no-ingeniero pueda adivinarlo.

**Evita JSONPath cuando** necesitas transformar la estructura de salida. No puede renombrar campos, rehacer objetos ni computar. Si la respuesta tiene alguna forma que el input no tenía, quieres JMESPath o jq.

## JMESPath: el lenguaje de consulta del AWS CLI

JMESPath se diseñó en AWS para consultar respuestas de la API de AWS. Si alguna vez escribiste `aws ec2 describe-instances --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name}"`, has escrito JMESPath. Tiene una gramática ABNF formal y una suite de tests extensiva, lo que significa que toda implementación conforme se comporta igual.

La feature destacada respecto a JSONPath es el **reshaping de salida**: JMESPath puede construir objetos y arrays con estructura nueva a partir de los nodos matcheados.

```
# input
{
  "Reservations": [
    { "Instances": [{ "InstanceId": "i-abc", "State": { "Name": "running" }, "Tags": [...] }] }
  ]
}

# query
Reservations[].Instances[].{Id: InstanceId, State: State.Name}

# output
[{ "Id": "i-abc", "State": "running" }]
```

JMESPath tiene unas 30 funciones builtin (`length`, `sort_by`, `group_by`, `starts_with`, `contains`, `map`, etc.), expresiones pipe y un sistema de tipos coherente. Las funciones están tipadas — pasar un string a `sort_by` es un error de parse, no una sorpresa en runtime.

**Usa JMESPath cuando:**

- Estás dentro del ecosistema AWS — es el lenguaje nativo de consulta.
- Necesitas selección más reshaping ligero en un string de query portable.
- Quieres que toda implementación se comporte igual.

**Evita JMESPath cuando** necesitas programación real: recursión, variables locales, condicionales complejos o funciones custom. JMESPath deliberadamente no va ahí.

## jq: el lenguaje funcional para JSON

jq no es realmente un lenguaje de consulta. Es un pequeño lenguaje de programación funcional cuyos valores resultan ser JSON. Tiene variables, funciones que puedes definir, condicionales, recursión, módulos y soporte de streaming. La implementación canónica es un único binario C que cualquier dev Unix puede `brew install jq` o `apt install jq`.

```bash
# selección + reshape (como JMESPath arriba)
jq '.Reservations[].Instances[] | { Id: .InstanceId, State: .State.Name }' input.json

# agrupación con función nombrada
jq '.logs | group_by(.service) | map({ service: .[0].service, count: length })' input.json

# función custom + variable
jq 'def by_user($u): .users[] | select(.id == $u); by_user("u_42") | .name' input.json

# streaming de un array grande
jq -c --stream '. | select(.[0][0] == "records") | .[1]' huge.json
```

Lo que jq puede hacer y los otros no:

- **Encadenar transformaciones arbitrarias.** Toda expresión jq es un filter; las encadenas con `|` como pipes de shell.
- **Definir y reusar funciones.** `def inc: . + 1; [1,2,3] | map(inc)`.
- **Variables, `as`, destructuring.** `. as $root | .items[] | $root.meta + {item: .}`.
- **Modo streaming.** Para archivos que no caben en memoria, `--stream` emite eventos `[path, value]` que puedes filtrar sin materializar el árbol entero.
- **Modos de salida.** `-c` para NDJSON compacto, `-r` para strings raw (úsalo cuando pipeas a otras tools Unix).

**Usa jq cuando:**

- Estás en un pipeline de shell o un script de CI.
- Necesitas transformar, no solo seleccionar.
- La consulta necesita condiciones, joins, agrupaciones o reshape que un selector de una línea no expresa.

**Evita jq cuando** estás dentro de una aplicación no-shell y añadir un motor jq pesa más que importar una librería JSONPath. La mayoría de lenguajes tienen hoy una implementación nativa de jq (gojq, pyjq, jq-web para navegadores), pero el peso de la dependencia es real.

## Lado a lado: "títulos de libros por debajo de $10"

```
# input
{ "store": { "book": [
  { "title": "A", "price": 8.0 },
  { "title": "B", "price": 15.0 },
  { "title": "C", "price": 5.5 }
]}}
```

| Tool | Query | Output |
| --- | --- | --- |
| JSONPath | `$.store.book[?(@.price<10)].title` | `["A", "C"]` |
| JMESPath | `store.book[?price < \`10\`].title` | `["A", "C"]` |
| jq | `.store.book[] \| select(.price < 10) \| .title` | `"A"\n"C"` |

Para pura selección, los tres funcionan. Las diferencias importan cuando la query crece. Añadir "y saca el título en mayúsculas con el precio como string" es una extensión de un carácter en jq (`| { title: .title | ascii_upcase, price: "$\(.price)" }`), torpe pero factible en JMESPath, e imposible en JSONPath.

## Elegir uno en la práctica

- En un **archivo de config** (Helm, Kustomize, una spec de cliente de API) probablemente estás escribiendo JSONPath porque es lo que la tool espera. Bien.
- En un **comando del AWS CLI** o una llamada al AWS SDK estás escribiendo JMESPath. Bien.
- En un **prompt de shell o en un script CI** quieres jq.
- Dentro de **código de aplicación**, elige el que tenga la mejor librería para tu lenguaje. En JS/TS, `jsonpath-plus` para JSONPath, `jmespath.js` para JMESPath, `jq-wasm` para jq — cada uno tiene tradeoffs de bundle size y features.

Usa el [Tester JSONPath](/es/jsonpath/) y el [Visor JSON](/es/viewer/) para prototipar tus selectores antes de cablearlos en código. Acertar la expresión de forma interactiva son cinco minutos; debuguear un selector erróneo en producción es una tarde.

## Lectura relacionada

- [JSON Pointer y JSON Patch](/es/docs/json-pointer-and-patch/) — si solo necesitas direccionar un único nodo (no un conjunto), RFC 6901 es más preciso y universalmente implementado.
- [Parsers JSON streaming](/es/docs/json-streaming-large-files/) — cuando el input es demasiado grande para el modo por defecto de jq, `--stream` también aparece ahí.
