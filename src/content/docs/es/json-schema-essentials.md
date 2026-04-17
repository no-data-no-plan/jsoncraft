---
title: "Fundamentos de JSON Schema — Validación, tipos y patrones comunes"
description: "Una guía práctica de JSON Schema Draft 7, 2019-09 y 2020-12: tipos, keywords, $ref, validación condicional y los patrones que se usan en APIs de producción."
category: schema
relatedToolIds: ["json-schema-validator", "formatter"]
publishedAt: 2026-04-17
lang: es
tags: ["json-schema", "validation", "draft-07"]
excerpt: "JSON Schema detiene los payloads defectuosos en el borde de tu servicio. Estos son los keywords y patrones que los backend engineers usan de verdad."
---

JSON Schema es el contrato entre tu API y todo lo que la llama. Es el único artefacto que puede validar input, impulsar code generation, alimentar OpenAPI y documentar la forma de tus datos al mismo tiempo. Pero la mayoría de equipos usan quizá el 15%, se paran en `type` y `required`, y luego se preguntan por qué sus validadores dejan pasar bugs reales.

Esta guía cubre los keywords que aparecen en schemas de producción, los tres drafts que te vas a encontrar de verdad, y los patrones que distinguen un schema de juguete de uno que protege un servicio real.

## ¿Qué draft usar?

Hay cinco drafts publicados todavía en uso, pero solo tres importan en 2026: **Draft 7** (2018), **2019-09** y **2020-12**. Draft 7 es el más soportado — Ajv lo usa por defecto, OpenAPI 3.1 se basa en 2020-12, y la mayoría de validadores por lenguaje ofrecen soporte opt-in para drafts más nuevos.

| Draft | Publicado | Añadidos notables | Úsalo cuando |
| --- | --- | --- | --- |
| Draft 7 | 2018 | `if`/`then`/`else`, `writeOnly`, content encoding | Buscas máxima compatibilidad |
| 2019-09 | 2019 | `$defs` (sustituye `definitions`), `unevaluatedProperties`, `dependentRequired` | Necesitas `unevaluatedProperties` |
| 2020-12 | 2020 | `prefixItems`, cambio semántico en `items`, `$dynamicRef` | OpenAPI 3.1, stack moderno |

Si no tienes una razón de peso para elegir un draft más nuevo, **apunta a Draft 7**. Es el suelo que todo validador mainstream soporta, incluyendo Ajv, python-jsonschema, go-jsonschema y everit-org/json-schema en la JVM.

## Los keywords que usarás a diario

Un schema mínimo de producción usa una docena de keywords. Esta forma cubre el 90% de los payloads reales:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "email", "createdAt"],
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 254
    },
    "age": { "type": "integer", "minimum": 0, "maximum": 150 },
    "role": { "enum": ["admin", "user", "guest"] },
    "tags": {
      "type": "array",
      "items": { "type": "string", "pattern": "^[a-z0-9-]+$" },
      "uniqueItems": true,
      "maxItems": 20
    },
    "createdAt": { "type": "string", "format": "date-time" }
  }
}
```

Fíjate en `additionalProperties: false`. Esto es innegociable en cualquier schema que valide input externo. Sin esto, un atacante puede colar campos extra a través de tu validador hacia cualquier código downstream que inspeccione el JSON crudo. Los schemas que lo omiten no están validando — están sugiriendo.

## Validación condicional con `if`/`then`/`else`

La feature más infrautilizada de Draft 7 son los subschemas condicionales. Permiten que un solo schema describa un payload cuyos campos requeridos dependen de un discriminador:

```json
{
  "type": "object",
  "required": ["kind"],
  "properties": {
    "kind": { "enum": ["card", "bank"] }
  },
  "if": {
    "properties": { "kind": { "const": "card" } }
  },
  "then": {
    "required": ["cardNumber", "cvc", "expiry"]
  },
  "else": {
    "required": ["iban", "bic"]
  }
}
```

Pega esto en el [Validador de JSON Schema](/es/json-schema-validator) y prueba ambas formas. Antes de `if`/`then`/`else`, tenías que tirar de `oneOf` con dos subschemas completos; después, un único schema expresa la intención con claridad.

Para más de dos ramas, `oneOf` sigue siendo la herramienta correcta. `allOf` es para composición (mezclar un `Timestamped` base), y `anyOf` es para "coincide con al menos uno" — que rara vez es lo que quieres en un contexto de validación.

## `$ref`, local y remoto

`$ref` permite factorizar schemas como funciones. Los refs locales usan JSON Pointer hacia `#/$defs` (2019-09+) o `#/definitions` (Draft 7):

```json
{
  "type": "object",
  "properties": {
    "billing":  { "$ref": "#/definitions/address" },
    "shipping": { "$ref": "#/definitions/address" }
  },
  "definitions": {
    "address": {
      "type": "object",
      "required": ["country"],
      "properties": {
        "country": { "type": "string", "pattern": "^[A-Z]{2}$" },
        "zip":     { "type": "string", "maxLength": 10 }
      }
    }
  }
}
```

Los refs remotos (`"$ref": "https://example.com/schemas/address.json"`) también funcionan, pero implican que tu validador tiene que estar dispuesto a hacer fetch — o, más comúnmente, a pre-cargar el schema referenciado. Con Ajv, lo pasas por `addSchema()` al arranque y resuelve localmente. **Nunca dejes que un validador salga a la red en request time.** La latencia no tiene cota y acabas de inventar un nuevo modo de fallo.

## Formats: útiles pero no son validación

`format` es consultivo en JSON Schema. Algunos validadores (como Ajv con el plugin `ajv-formats`) los aplican; otros los ignoran por completo. Formats útiles incluyen `uuid`, `email`, `uri`, `date`, `date-time`, `ipv4`, `ipv6` y `hostname`. Los formats basados en regex como `email` no cumplen del todo con RFC 5322 — ninguna regex lo hace — pero cazan el 99% de los typos.

Si un format es crítico para seguridad (digamos, validas una URL antes de pasarla a un fetcher), **no confíes solo en `format`**. Parsea con el URL parser del lenguaje y comprueba scheme y host contra una allowlist.

## Chuleta de keywords

| Categoría | Keywords | Notas |
| --- | --- | --- |
| Tipo | `type`, `enum`, `const` | `enum` para valores discretos abiertos, `const` para exactamente uno |
| Números | `minimum`, `maximum`, `exclusiveMinimum`, `multipleOf` | Draft 7 cambió `exclusiveMinimum` a número |
| Strings | `minLength`, `maxLength`, `pattern`, `format` | `pattern` usa regex ECMA-262 |
| Arrays | `items`, `minItems`, `maxItems`, `uniqueItems`, `contains` | En 2020-12, `prefixItems` maneja tuplas |
| Objetos | `properties`, `required`, `additionalProperties`, `patternProperties`, `propertyNames` | `propertyNames` restringe las claves |
| Composición | `allOf`, `anyOf`, `oneOf`, `not` | `oneOf` debe coincidir con exactamente un subschema |
| Condicionales | `if`, `then`, `else`, `dependentRequired` | Draft 7+ |
| Estructura | `$ref`, `$defs`, `$id` | `$id` fija el base URI del schema para resolución de refs |

## Patrones prácticos

**Campo nullable (JSON Schema no tiene keyword `nullable`):**

```json
{ "type": ["string", "null"], "maxLength": 255 }
```

El `nullable: true` de OpenAPI 3.0 es una convención distinta — se desazucara a esta forma en 3.1.

**Sum type (unión discriminada):**

```json
{
  "oneOf": [
    { "type": "object", "required": ["kind", "text"],
      "properties": { "kind": { "const": "text" }, "text": { "type": "string" } } },
    { "type": "object", "required": ["kind", "url"],
      "properties": { "kind": { "const": "image" }, "url": { "type": "string", "format": "uri" } } }
  ]
}
```

**Map restringido (objeto con patrón de clave conocido):**

```json
{
  "type": "object",
  "patternProperties": {
    "^[A-Z]{2}$": { "type": "number", "minimum": 0 }
  },
  "additionalProperties": false
}
```

Esto valida un map de códigos de país ISO a números y rechaza cualquier clave que no coincida.

## Hacia dónde seguir

Una vez tengas un schema en el que confíes, pásalo a [Ajv](https://ajv.js.org/) con `strict: true` y `allErrors: false` en hot paths de producción — `allErrors: true` está bien para herramientas de desarrollo pero es más lento. Combínalo con el [Formateador JSON](/es/formatter) para inspección rápida de payloads, y con [JSON Pointer y JSON Patch](/es/docs/json-pointer-and-patch/) para entender cómo se resuelven los paths `$ref` por dentro.

Si validas input no confiable, lee también [Pitfalls de seguridad en JSON](/es/docs/json-security-pitfalls/) — el schema por sí solo no detiene prototype pollution ni DoS a nivel de parser.
