---
title: "JSON Pointer y JSON Patch — RFC 6901 y RFC 6902 explicados"
description: "JSON Pointer es una sintaxis de path estandarizada. JSON Patch es un formato de diff estandarizado. Ambos son diminutos, universalmente soportados, y te ahorran reinventarlos."
category: fundamentals
relatedToolIds: ["jsonpath", "diff"]
publishedAt: 2026-04-17
lang: es
tags: ["json-pointer", "json-patch", "rfc-6901", "rfc-6902"]
excerpt: "Dos RFCs pequeñas que la mayoría de equipos reinventan sin saber que existen. JSON Pointer direcciona un nodo. JSON Patch describe una serie atómica de cambios. Úsalos."
faq:
  - q: "¿Cuál es la diferencia entre JSON Pointer y JSONPath?"
    a: "JSON Pointer (RFC 6901) direcciona exactamente un nodo en un documento usando tokens separados por barras — `/users/0/name` resuelve a un único valor. No tiene wildcards, ni filtros, y una sola spec canónica con la que toda implementación coincide. JSONPath direcciona un conjunto de cero o más nodos y soporta wildcards (`*`, `..`), filtros (`?(@.price<10)`) y slices. Usa Pointer cuando necesites 'el nodo' — `$ref` de schema, operaciones de patch, paths de error del validador. Usa JSONPath cuando necesites 'todo nodo que matchee' un patrón a través del documento."
  - q: "¿Cómo escapo barras en un JSON Pointer?"
    a: "Dos caracteres necesitan escape dentro de los tokens del pointer: `/` se vuelve `~1` y `~` se vuelve `~0`. El orden importa — escapa `~` primero, luego `/` — pero virtualmente toda librería lo gestiona por ti. Así que una clave llamada literalmente `a/b~c` se referencia como `/a~1b~0c`. No aplican otras reglas de escape: espacios, unicode y caracteres especiales pasan verbatim. Este esquema de escape de dos reglas es deliberadamente mínimo para que la sintaxis del pointer se mantenga inequívoca entre la implementación RFC 6901 de cada lenguaje."
  - q: "¿Es atómico JSON Patch?"
    a: "Sí. Un JSON Patch es todo-o-nada por especificación: si cualquier operación del array falla — un `test` que no coincide, un `add` a un path padre ausente, un `remove` sobre path inexistente — el patch entero se aborta y el documento queda sin cambios. Esta atomicidad es lo que hace a JSON Patch apto para HTTP `PATCH`: el cliente o ve el cambio completo o nada, sin limpieza de escritura parcial. Combinado con una operación `test` comprobando un campo de version más un header `If-Match` con ETag, obtienes control de concurrencia optimista gratis."
  - q: "¿Cuándo uso JSON Merge Patch en vez de JSON Patch?"
    a: "Usa JSON Merge Patch (RFC 7396) para el caso común 'actualiza estos campos' — es dramáticamente más simple de escribir. Un merge patch es en sí un objeto JSON: aplicar `{\"name\": \"Updated\", \"tags\": null}` pone `name` y borra `tags`. Las limitaciones: no puedes distinguir 'borra este campo' de 'ponlo a null' porque null siempre significa borrar, y no puedes expresar operaciones de array como 'añade un elemento'. Si necesitas cualquiera, usa JSON Patch (RFC 6902). Los content types difieren — `application/merge-patch+json` vs `application/json-patch+json` — y le dicen al servidor qué formato esperar."
  - q: "¿Cómo genero un JSON Patch a partir de dos documentos?"
    a: "No escribas patches a mano. El patrón estándar es: fetch del estado actual, edita una copia local, diff antiguo vs nuevo para producir un patch mínimo, manda el patch. Librerías para el paso 3: `fast-json-patch` en JavaScript (`jsonpatch.compare(a, b)`), `jsonpatch` en Python, `evanphx/json-patch` en Go. Antepón una operación `test` sobre un campo de version y añade al final un `replace` que lo incremente, y tienes un patch compare-and-swap seguro. Usa la herramienta JSON Diff de JSONCraft para visualizar el cambio antes de enviar — ayuda a cazar borrados accidentales."
---

JSON Pointer (RFC 6901) y JSON Patch (RFC 6902) son dos de las especificaciones más pequeñas, más universalmente implementadas y más frecuentemente reinventadas del ecosistema JSON. Ambas son de menos de cinco páginas. Ambas resuelven problemas que la mayoría de equipos resuelven mal con código ad-hoc.

**JSON Pointer** es una sintaxis estandarizada para direccionar un único nodo en un documento JSON. **JSON Patch** es un formato estandarizado para describir una serie de cambios atómicos a un documento. Están relacionados: JSON Patch usa JSON Pointer para nombrar las ubicaciones que modifica.

## JSON Pointer: direccionar un nodo

Un JSON Pointer es un string con tokens separados por barras, cada uno de los cuales es una clave de objeto o un índice de array. La raíz del documento es el string vacío. Los tokens se combinan con barras delante.

```
// documento
{
  "users": [
    { "id": 1, "name": "Ana" },
    { "id": 2, "name": "Ben" }
  ],
  "total": 2
}

// pointer            // resuelve a
""                    // el documento entero
"/total"              // 2
"/users"              // el array
"/users/0"            // { "id": 1, "name": "Ana" }
"/users/0/name"       // "Ana"
"/users/1/id"         // 2
```

Dos caracteres necesitan escape dentro de los tokens: `/` se vuelve `~1` y `~` se vuelve `~0`. Así que una clave llamada literalmente `a/b~c` se referencia como `/a~1b~0c`. Esa es toda la regla de escape.

### Por qué importa

JSON Pointer es el sustrato de mucho tooling JSON que ya usas:

- **`$ref` de JSON Schema** usa JSON Pointer tras el `#`. `{ "$ref": "#/definitions/address" }` es un JSON Pointer dentro del mismo documento.
- **JSON Patch** usa JSON Pointer para nombrar el target de cada operación.
- **Tools basadas en JSONPath** a menudo emiten JSON Pointer como su forma de dirección subyacente porque es inequívoca (a diferencia de JSONPath, con deriva de dialecto).
- **Mensajes de error de Ajv y la mayoría de validadores** reportan el path fallido como JSON Pointer.

### JSON Pointer vs JSONPath

Se parecen pero son fundamentalmente distintos:

| | JSON Pointer | JSONPath |
| --- | --- | --- |
| Direcciona | Exactamente un nodo | Un conjunto de nodos (cero o más) |
| Tiene wildcards | No | Sí (`*`, `..`) |
| Tiene filtros | No | Sí (`?(@.price<10)`) |
| Tiene una spec canónica | **Sí** (RFC 6901) | Solo desde 2024 (RFC 9535) |
| Implementaciones coinciden | Siempre | A menudo, no siempre |

Pointer es preciso y simple. JSONPath es flexible y potente pero laxo. Usa Pointer cuando necesitas "el nodo", usa JSONPath cuando necesitas "todo nodo que matchee".

## JSON Patch: cambios atómicos

JSON Patch es un formato para describir cambios a un documento JSON. Un patch es un array de objetos de operación. Cada operación tiene un `op`, un `path` (un JSON Pointer), y posiblemente un `value` o un `from`.

```json
[
  { "op": "replace", "path": "/total", "value": 3 },
  { "op": "add",     "path": "/users/-", "value": { "id": 3, "name": "Cyr" } },
  { "op": "remove",  "path": "/users/0" },
  { "op": "move",    "from": "/temp",  "path": "/permanent" },
  { "op": "copy",    "from": "/template", "path": "/users/0/settings" },
  { "op": "test",    "path": "/total", "value": 3 }
]
```

Las seis operaciones al completo:

| op | Campos requeridos | Comportamiento |
| --- | --- | --- |
| `add` | `path`, `value` | Inserta value en path. Para arrays, path puede acabar en `-` para añadir al final |
| `remove` | `path` | Borra el nodo en path |
| `replace` | `path`, `value` | Reemplaza el nodo en path con un valor nuevo |
| `move` | `from`, `path` | Quita de `from`, añade en `path` |
| `copy` | `from`, `path` | Copia nodo de `from` a `path` |
| `test` | `path`, `value` | Afirma que nodo en path equivale a value; si no, aborta el patch entero |

La op `test` es lo que convierte JSON Patch en más que un script de mutación. Te permite escribir patches compare-and-swap que fallan limpiamente si el documento cambió entre lectura y escritura.

### Atomicidad

Un JSON Patch es **todo-o-nada**. Si cualquier operación del array falla (un `test` que no coincide, un `add` a un padre ausente, un `remove` sobre path inexistente), el patch entero se aborta y el documento queda sin cambios. Esta es la propiedad clave que lo hace útil para HTTP `PATCH` — puedes mandar un patch y o se aplicó del todo o no cambió nada, sin que el cliente tenga que deshacer escrituras parciales.

### Semántica HTTP

El método `PATCH` de IETF es deliberadamente agnóstico de formato, pero RFC 5789 menciona explícitamente JSON Patch como el enfoque canónico JSON-sobre-HTTP. Un intercambio típico:

```
PATCH /api/documents/42 HTTP/1.1
Content-Type: application/json-patch+json
If-Match: "etag-abc-123"

[
  { "op": "test",    "path": "/version", "value": 7 },
  { "op": "replace", "path": "/title",   "value": "Updated" },
  { "op": "replace", "path": "/version", "value": 8 }
]
```

La operación `test` combinada con un ETag te da control de concurrencia optimista: dos clientes editando el mismo documento no pueden pisarse silenciosamente.

## JSON Merge Patch: el primo simple

RFC 7396 define **JSON Merge Patch**, un formato distinto y más simple para el caso común de "actualiza estos campos." Un merge patch es en sí un objeto JSON. Aplicar `{"name": "Updated", "tags": null}` a un documento significa:

- Pon `name` a `"Updated"`.
- Borra `tags` (porque el valor de merge es `null`).
- Deja todo lo demás intacto.

Merge Patch es más simple de escribir pero tiene dos limitaciones: no puedes distinguir "borra este campo" de "ponlo a null" (null significa borrar), y no puede expresar operaciones de array como "añade un elemento". Si necesitas cualquiera, usa JSON Patch.

Content types: `application/json-patch+json` para RFC 6902, `application/merge-patch+json` para RFC 7396. Elegir el correcto es una señal al servidor de qué formato esperar.

## Generar patches desde diffs

Rara vez escribes un patch a mano. El patrón común es:

1. Obtener el estado actual.
2. Editar una copia local.
3. Computar un patch haciendo diff antiguo vs nuevo.
4. Mandar el patch.

Librerías que hacen el paso 3: `fast-json-patch` en JS, `jsonpatch` en Python, `evanphx/json-patch` en Go. Producen un patch mínimo que describe la diferencia.

Al debuguear, la [herramienta JSON Diff](/es/diff/) visualiza exactamente qué cambió entre dos documentos — útil para comprobar que el patch que vas a mandar coincide con lo que pretendes. Pega el antes y el después, lee el diff, y deja que tu librería genere el JSON Patch.

## Un ejemplo práctico: edición colaborativa

Supón que dos usuarios editan el mismo documento concurrentemente. Sin merging, uno gana y sobrescribe al otro. Con JSON Patch más ETags, el servidor rechaza la segunda escritura (porque el `test` sobre version falla), y el cliente puede re-fetch, rebase y reintentar. Es el mismo patrón que git usa para merging, aplicado a un solo documento JSON.

```js
// el cliente computa un patch desde sus ediciones locales
const patch = jsonpatch.compare(originalDoc, editedDoc);

// antepón un check de version
patch.unshift({ op: 'test', path: '/version', value: originalDoc.version });
patch.push({ op: 'replace', path: '/version', value: originalDoc.version + 1 });

// envía
await fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json-patch+json', 'If-Match': etag },
  body: JSON.stringify(patch),
});
// 412 Precondition Failed → alguien patcheó antes, re-fetch y reintenta
```

## Cuándo tirar de qué

| Quieres... | Usa |
| --- | --- |
| Direccionar un nodo en un documento | JSON Pointer |
| Describir una referencia de schema | JSON Pointer (dentro de `$ref`) |
| Mandar un conjunto compacto y atómico de cambios a una API | JSON Patch |
| Mandar una actualización simple de campos | JSON Merge Patch |
| Consultar muchos nodos con condiciones | JSONPath |
| Escribir una transformación compleja | jq |

## Lectura relacionada

- [JSONPath vs JMESPath vs jq](/es/docs/jsonpath-vs-jmespath-vs-jq/) para cuando necesitas un conjunto de nodos en vez de uno.
- [Fundamentos de JSON Schema](/es/docs/json-schema-essentials/) — `$ref` usa JSON Pointer, y los paths de error de schema son JSON Pointers.
- [Pitfalls de seguridad en JSON](/es/docs/json-security-pitfalls/) — un JSON Patch con `path` de `/__proto__/isAdmin` es un intento de pollution disfrazado. Filtra los paths del patch por claves peligrosas, igual que haces con input parseado.
