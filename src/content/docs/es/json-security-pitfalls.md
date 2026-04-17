---
title: "Pitfalls de seguridad en JSON — Prototype pollution, DoS y ataques de parsing"
description: "Todo input JSON está controlado por el atacante hasta que se demuestre lo contrario. Prototype pollution, parser DoS, nesting profundo — los ataques que llegan de verdad."
category: security
relatedToolIds: ["formatter", "json-schema-validator"]
publishedAt: 2026-04-17
lang: es
tags: ["security", "prototype-pollution", "json-dos"]
excerpt: "JSON.parse no te va a proteger de un payload de mil millones de bytes, un objeto anidado a 10.000 niveles o una clave llamada literalmente __proto__. Esto es lo que sí."
faq:
  - q: "¿Qué es prototype pollution en JSON?"
    a: "Prototype pollution es una clase de vulnerabilidad donde input controlado por el atacante muta `Object.prototype` vía un merge recursivo, clone u option-parser. `JSON.parse` en sí es seguro — produce un objeto plano con `__proto__` como propia propiedad normal, no como el link interno de prototype. El bug está en el código que recorre el objeto parseado y asigna a objetos reales sin filtrar la clave. Librerías como `lodash.merge`, `minimist`, `object-path` y `dot-prop` han shippado CVEs aquí. Defensas: rechaza claves `__proto__`/`constructor`/`prototype`, usa `Object.create(null)`, o valida con JSON Schema y `additionalProperties: false`."
  - q: "¿Puede JSON.parse causar un denial of service?"
    a: "Sí, de tres formas. Volumen puro: un body de 500 MB intenta materializarse como un objeto JavaScript de 2-4 GB y revienta el proceso por OOM. Anidamiento profundo: `{\"a\":{\"a\":{\"a\":...}}}` a 10.000 niveles parsea bien pero fuerza a serializadores, validadores y loggers downstream a recursión que revienta la pila. El hashing por colisiones de clave solía importar pero los engines modernos aleatorizan seeds. Los fixes son ortogonales: límites de tamaño de request en la capa HTTP, un schema con `maxLength`/`maxItems`/`maxProperties` acotados, y un parser con cap de profundidad como `secure-json-parse` o `@hapi/bourne` para input no confiable."
  - q: "¿Hasta qué profundidad puede anidar JSON con seguridad?"
    a: "No hay un límite duro en la spec de JSON, pero los sistemas prácticos se rompen bastante antes de 10.000 niveles. `JSON.parse` en V8 es iterativo y sobrevive a input muy profundo, pero `JSON.stringify` recursa y revienta la pila. También lo hacen la mayoría de validadores de schema, loggers y serializadores. Un cap defendible en producción es 32-64 niveles para input no confiable — suficiente para cualquier config anidada realista, superficial para que el código downstream basado en recursión se mantenga seguro. Librerías como `secure-json-parse` aceptan opción de profundidad configurable. Poner un cap es una defensa barata y de alto valor frente a DoS."
  - q: "¿Qué es un ataque estilo billion-laughs en JSON?"
    a: "El billion-laughs clásico es un ataque de expansión de entidades XML. JSON no tiene referencias nativas, así que el formato base es seguro, pero JSON Schema es vulnerable vía `$ref`. Un schema que se refiere a sí mismo con combinadores complejos — `oneOf` conteniendo dos `$ref`s al mismo definition — puede hacer trabajo exponencial en el validador. Ajv maneja este caso específico, pero otros validadores han shippado CVEs. Si aceptas schemas suministrados por usuarios (tools de dev, features de import de OpenAPI), trátalos como código ejecutable: sandboxea, pon límite de tiempo, y evita resolución remota de `$ref` en request time."
  - q: "¿Cómo se rompen los enteros grandes en JSON?"
    a: "Los números JSON son doubles IEEE 754 en todo parser mainstream (JavaScript, `json` de Python, `encoding/json` de Go). Un entero de 64 bits pierde precisión por encima de 2^53 — 9.007.199.254.740.993 se vuelve silenciosamente 9.007.199.254.740.992. Esto ha causado bugs financieros reales cuando bancos serializaban IDs de transacción `uint64` como números JSON. Fix: serializa enteros grandes como strings. Go tiene la struct tag `,string`; JSON Schema tiene `{\"type\": \"string\", \"pattern\": \"^[0-9]+$\"}` para el lado receptor. Si controlas ambos lados, prefiere strings para cualquier cosa por encima de 32 bits."
---

Un parser que acepta cualquier JSON sintácticamente válido no ha validado nada. Solo ha confirmado que los corchetes balancean y las comillas cierran. Todo ataque real contra un endpoint JSON explota algo *después* del parser: una clave llamada literalmente `__proto__`, un array de 100.000 elementos que dispara comportamiento `O(n²)` en un merge ingenuo, un string de 50 megas en un campo donde esperabas un email.

Esta guía cubre las clases de ataque que realmente golpean endpoints JSON en 2026, y las defensas específicas que los paran.

## Prototype pollution

Los objetos de JavaScript heredan de `Object.prototype`. Cualquier propiedad que pongas en el prototype — `Object.prototype.isAdmin = true` — aparece en todo objeto que no la sombree. Prototype pollution es la clase de vulnerabilidad donde input controlado por el atacante muta `Object.prototype` a través de una función recursiva de merge, clone o option-parsing.

La forma vulnerable:

```js
// input controlado por atacante
const payload = JSON.parse('{"__proto__": { "isAdmin": true }}');

// merge en application state (ingenuo)
function merge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = merge(target[key] ?? {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const user = merge({}, payload);
// Ahora todo objeto en el proceso tiene isAdmin: true
console.log({}.isAdmin); // true
```

`JSON.parse` en sí es seguro — produce un objeto plano con `__proto__` como propia propiedad normal, no como el link interno de prototype. La vulnerabilidad está en el código que *recorre* el objeto parseado y asigna a objetos reales sin filtrar la clave.

Librerías que han shippado CVEs aquí: `lodash.merge`, `minimist`, `object-path`, `dot-prop`, `json-ptr`, y muchos helpers "deep merge" locales. La clase la catalogó primero Olivier Arteau en 2018 y sigue reapareciendo en nuevas librerías.

**Defensas:**

1. **Rechaza claves peligrosas.** Al recorrer input no confiable, niega las claves `__proto__`, `constructor` y `prototype` explícitamente. Es el fix más simple y lo que hace lodash moderno.
2. **Usa `Object.create(null)` o `Map`.** Los objetos construidos con prototype `null` no tienen `Object.prototype` que contaminar.
3. **Usa un schema.** Un validador JSON Schema con `additionalProperties: false` rechaza claves desconocidas antes de que lleguen al paso de merge. El [Validador JSON Schema](/es/json-schema-validator/) es donde lo pruebas interactivamente.
4. **Congela `Object.prototype` en producción.** `Object.freeze(Object.prototype)` como defensa en profundidad — algunos frameworks lo hacen al arrancar.

## Parser DoS: inputs grandes y anidamiento profundo

`JSON.parse` lanza en sintaxis inválida pero parsea alegremente un payload válido de tamaño sin cota. Tres sabores de DoS:

**1. Volumen puro.** Un body JSON de 500 MB intentará materializarse como un objeto JavaScript que ocupa 2-4 GB de heap (por overhead de objeto). En Node, el proceso crashea o el cap `--max-old-space-size` lo mata. La defensa es un límite de tamaño de request en la capa HTTP — `body-parser` de Express tiene default 100 KB para JSON, y no está ahí por casualidad. Súbelo solo donde lo necesites.

**2. Anidamiento profundo.** Un documento JSON como `{"a":{"a":{"a":...}}}` anidado a 10.000 niveles parsea bien pero fuerza a tu código downstream (validadores, serializadores, loggers) a recursión que revienta la pila o fija un core de CPU. `JSON.parse` suele ser iterativo en V8, pero todo lo que toca el resultado tiende a recursar.

```js
// payload atacante
let deep = 'null';
for (let i = 0; i < 100_000; i++) deep = `{"a":${deep}}`;

JSON.parse(deep);             // ok
JSON.stringify(JSON.parse(deep)); // RangeError: Maximum call stack size exceeded
```

**3. Key-collision hashing.** Histórico; la mayoría de engines modernos aleatorizan seeds de hash y esto ya no funciona contra V8. Sigue vale conocerlo porque aparece en runtimes más antiguos.

**Defensas:**

1. **Límites de tamaño de request.** Aplícalos en la capa HTTP, por debajo de la aplicación. Un cap de reverse proxy a 1 MB o 10 MB elimina la cola.
2. **Schema con `maxLength`, `maxItems` y `maxProperties`.** Todo string y array en tu schema debería tener una cota.
3. **Rechaza profundidad.** Algunas librerías (`secure-json-parse`, `@hapi/bourne`) rechazan documentos por encima de una profundidad configurable.
4. **Timeout en tu validador.** Si la validación tarda más que unos pocos milisegundos sobre input típico, tienes un schema lento o un input enorme.

## Expansión estilo billion-laughs

YAML tiene este problema nativamente con anchors y aliases. JSON no — no hay mecanismo nativo de referencia — **pero JSON Schema sí**, vía `$ref`. Un schema que se refiere a sí mismo vía `$ref` con combinadores complejos puede hacer que un validador haga trabajo exponencial.

```json
{
  "definitions": {
    "rec": {
      "oneOf": [
        { "$ref": "#/definitions/rec" },
        { "$ref": "#/definitions/rec" }
      ]
    }
  },
  "$ref": "#/definitions/rec"
}
```

Ajv maneja este caso específico, pero otros validadores han shippado CVEs. Si aceptas schemas suministrados por usuarios (una herramienta de dev, una feature de importación de OpenAPI), trátalos como código ejecutable y sandboxea en consecuencia.

## Firmado pero sin verificar: MIME sniffing y confusión de content-type

Los navegadores modernos han arreglado mayormente el MIME sniffing para `application/json`, pero toolchains más viejas siguen existiendo. Dos problemas relacionados:

- **JSON hijacking.** Ataque legacy contra arrays JSON top-level servidos sin `X-Content-Type-Options: nosniff`. No relevante en navegadores modernos pero sigue apareciendo en auditorías.
- **Content-type confusion.** Un endpoint que acepta JSON sin comprobar el header `Content-Type` puede ser engañado para aceptar datos form-encoded que parecen JSON-ish, esquivando defensas CSRF ligadas al content type.

Defensas: envía siempre `Content-Type: application/json; charset=utf-8` y `X-Content-Type-Options: nosniff`. Comprueba siempre `Content-Type` en el lado receptor — no llames `JSON.parse` sobre cualquier body POST.

## Precisión numérica

Los números JSON son doubles IEEE 754 en todo parser mainstream (JavaScript, JSON.parse en Python, encoding/json en Go). Un entero de 64 bits pierde precisión por encima de `2^53` (9.007.199.254.740.993 se vuelve 9.007.199.254.740.992). No es un bug de seguridad en sí mismo pero ha causado bugs en transacciones financieras en bancos que serializaban IDs `uint64` como números JSON.

El fix es serializar enteros grandes como strings. encoding/json de Go respeta la struct tag `,string`. JSON Schema tiene `"type": "string", "pattern": "^[0-9]+$"` para este caso. Si controlas ambos lados, prefiere strings para cualquier cosa de más de 32 bits.

## Checklist de defensa en profundidad

| Capa | Defensa |
| --- | --- |
| HTTP | Límite de tamaño de request, check de `Content-Type`, header `nosniff` |
| Parser | Variante safe-load cuando el formato la permite (YAML safe-load, JSON ya es más seguro) |
| Schema | Valida contra JSON Schema con `additionalProperties: false`, `maxLength`/`maxItems` acotados |
| Merge/walk | Rechaza claves `__proto__`/`constructor`/`prototype` o usa `Object.create(null)` |
| Validador | Cap de profundidad, timeout, schema cache, sin `$ref` remotos en request time |
| Logging | No loguees bodies de request enteros; trunca a una longitud conocida |

## Un self-test rápido

Pega esto en cualquier endpoint HTTP que acepte JSON detrás de un validador que escribiste:

```json
{
  "__proto__": { "polluted": true },
  "constructor": { "prototype": { "polluted": true } },
  "normal_field": "value"
}
```

Luego, en un request separado, comprueba si `{}.polluted` es true. Si lo es, tienes una vulnerabilidad de pollution. El [Formateador JSON](/es/formatter/) es una forma segura de inspeccionar los bytes exactos antes de enviarlos.

## Lectura relacionada

- [Fundamentos de JSON Schema](/es/docs/json-schema-essentials/) para los keywords de schema que fuerzan los límites de tamaño de arriba.
- [JSON vs YAML vs TOML](/es/docs/json-vs-yaml-vs-toml-decision/) para un deep dive en el problema de unsafe-load de YAML, que no existe en JSON.
- [Buenas prácticas JWT en 2026](/es/docs/jwt-best-practices-2026/) para el caso de JSON firmado, donde aplican los mismos principios con reglas extra.
