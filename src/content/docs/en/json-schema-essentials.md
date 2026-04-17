---
title: "JSON Schema Essentials — Validation, Types, and Common Patterns"
description: "A practical guide to JSON Schema Draft 7, 2019-09 and 2020-12: types, keywords, $ref, conditional validation, and the patterns that ship in production APIs."
category: schema
relatedToolIds: ["json-schema-validator", "formatter"]
publishedAt: 2026-04-17
lang: en
tags: ["json-schema", "validation", "draft-07"]
excerpt: "JSON Schema stops bad payloads at the edge of your service. Here are the keywords and patterns backend engineers actually use."
faq:
  - q: "Which JSON Schema draft should I use in 2026?"
    a: "Target Draft 7 unless you have a specific reason not to. It is the floor that every mainstream validator supports — Ajv, python-jsonschema, go-jsonschema, and everit-org/json-schema on the JVM all ship it by default. Reach for 2019-09 only if you need `unevaluatedProperties` or `dependentRequired`, and 2020-12 only if you are on OpenAPI 3.1 or need `prefixItems` tuple semantics. Newer drafts add power but cut you off from half the ecosystem, and most production bugs are caught fine by Draft 7 keywords."
  - q: "Why is additionalProperties false so important?"
    a: "Without `additionalProperties: false`, your schema is advisory rather than enforcing. An attacker can smuggle extra fields through the validator into whatever downstream code inspects the raw JSON — anything from prototype-pollution keys like `__proto__` to privilege-escalation fields your app reads opportunistically. Schemas that omit it are suggesting, not validating. Set it on every object that touches external input. The only time to relax it is for open-ended maps, where `patternProperties` plus `additionalProperties: false` is still the right shape."
  - q: "How do I reference other schemas with $ref?"
    a: "Local refs use JSON Pointer into `#/$defs` (2019-09+) or `#/definitions` (Draft 7): `{ \"$ref\": \"#/definitions/address\" }`. Remote refs like `\"$ref\": \"https://example.com/schemas/address.json\"` work too, but never let your validator fetch at request time — the latency is unbounded. Pre-load every referenced schema at boot with `ajv.addSchema()` or the equivalent so resolution is purely in-memory. This is also how you get reliable validation in offline or sandboxed environments."
  - q: "When should I use if/then/else versus oneOf?"
    a: "Use `if`/`then`/`else` for two-branch conditional validation driven by a discriminator — for example, required fields that differ when `kind` is `card` versus `bank`. It reads cleaner than two full subschemas under `oneOf` for the same purpose. Reach for `oneOf` when you have three or more branches, or when the branches do not share a common discriminator field. `allOf` is for composition (mixing in a `Timestamped` base), and `anyOf` is for 'match at least one' — which is rarely what you actually want in validation."
  - q: "Is format alone enough to validate emails or URLs?"
    a: "No. `format` is advisory in JSON Schema — some validators enforce it (Ajv with `ajv-formats`), others ignore it entirely. Regex-based formats like `email` do not fully conform to RFC 5322, because no regex can. They catch obvious typos but are not security boundaries. When a format is security-critical — validating a URL before a server-side fetch, for example — parse the value with the language's URL parser and check scheme and host against an explicit allowlist. Treat `format` as a hint, not a defense."
---

JSON Schema is the contract between your API and everything that calls it. It is the single artifact that can validate input, drive code generation, feed OpenAPI, and document the shape of your data all at once. But most teams use maybe 15% of it, stop at `type` and `required`, and then wonder why their validators miss real bugs.

This guide covers the keywords that show up in production schemas, the three drafts you will actually encounter, and the patterns that separate a toy schema from one that protects a real service.

## Which draft should you target?

There are five published drafts still in active use, but only three matter in 2026: **Draft 7** (2018), **2019-09**, and **2020-12**. Draft 7 is the most widely supported — Ajv defaults to it, OpenAPI 3.1 is based on 2020-12, and most language validators offer opt-in support for newer drafts.

| Draft | Released | Notable additions | Use when |
| --- | --- | --- | --- |
| Draft 7 | 2018 | `if`/`then`/`else`, `writeOnly`, content encoding | Maximum library compatibility |
| 2019-09 | 2019 | `$defs` (replaces `definitions`), `unevaluatedProperties`, `dependentRequired` | You need `unevaluatedProperties` |
| 2020-12 | 2020 | `prefixItems`, `items` array semantics change, `$dynamicRef` | OpenAPI 3.1, modern stack |

If you do not have a forcing reason to pick a newer draft, **target Draft 7**. It is the floor that every mainstream validator supports, including Ajv, python-jsonschema, go-jsonschema, and everit-org/json-schema on the JVM.

## The keywords you will use every day

A minimal production-ready schema uses a dozen keywords. Here is a shape that covers 90% of real payloads:

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

Note `additionalProperties: false`. This is non-negotiable in any schema that validates external input. Without it, an attacker can smuggle extra fields through your validator into whatever downstream code inspects the raw JSON. Schemas that omit it are not validating — they are suggesting.

## Conditional validation with `if`/`then`/`else`

The single most underused feature of Draft 7 is conditional subschemas. They let one schema describe a payload whose required fields depend on a discriminator:

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

Paste that into the [JSON Schema Validator](/json-schema-validator/) and try both shapes. Before `if`/`then`/`else`, you would have to reach for `oneOf` with two full subschemas; after, one schema expresses the intent cleanly.

For more than two branches, `oneOf` remains the right tool. `allOf` is for composition (mixing in a `Timestamped` base), and `anyOf` is for "match at least one" — which is rarely what you actually want in a validation context.

## `$ref`, local and remote

`$ref` lets you factor schemas like functions. Local refs use JSON Pointer into `#/$defs` (2019-09+) or `#/definitions` (Draft 7):

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

Remote refs (`"$ref": "https://example.com/schemas/address.json"`) work too, but they mean your validator has to be willing to fetch — or, more commonly, to pre-load the referenced schema. For Ajv, you pass it through `addSchema()` at boot and it resolves locally. **Never let a validator hit the network at request time.** The latency is unbounded and you just invented a new failure mode.

## Formats: useful but not validation

`format` is advisory in JSON Schema. Some validators (like Ajv with the `ajv-formats` plugin) enforce it; others ignore it entirely. Useful formats include `uuid`, `email`, `uri`, `date`, `date-time`, `ipv4`, `ipv6`, and `hostname`. Regex-based formats like `email` do not fully conform to RFC 5322 — no regex does — but they catch 99% of typos.

If a format is security-critical (say, you are validating a URL before passing it to a fetcher), **do not trust `format` alone**. Parse it with the language's URL parser and check the scheme and host against an allowlist.

## A keyword cheatsheet

| Category | Keywords | Notes |
| --- | --- | --- |
| Type | `type`, `enum`, `const` | `enum` for open-ended discrete values, `const` for exactly one |
| Numbers | `minimum`, `maximum`, `exclusiveMinimum`, `multipleOf` | Draft 7 changed `exclusiveMinimum` to a number |
| Strings | `minLength`, `maxLength`, `pattern`, `format` | `pattern` uses ECMA-262 regex |
| Arrays | `items`, `minItems`, `maxItems`, `uniqueItems`, `contains` | In 2020-12, `prefixItems` handles tuples |
| Objects | `properties`, `required`, `additionalProperties`, `patternProperties`, `propertyNames` | `propertyNames` constrains keys |
| Composition | `allOf`, `anyOf`, `oneOf`, `not` | `oneOf` must match exactly one subschema |
| Conditionals | `if`, `then`, `else`, `dependentRequired` | Draft 7+ |
| Structure | `$ref`, `$defs`, `$id` | `$id` sets the schema's base URI for ref resolution |

## Practical patterns

**Nullable field (JSON Schema does not have a `nullable` keyword):**

```json
{ "type": ["string", "null"], "maxLength": 255 }
```

OpenAPI 3.0's `nullable: true` is a different convention — it desugars to this form in 3.1.

**Sum type (discriminated union):**

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

**Constrained map (object with known key pattern):**

```json
{
  "type": "object",
  "patternProperties": {
    "^[A-Z]{2}$": { "type": "number", "minimum": 0 }
  },
  "additionalProperties": false
}
```

This validates a map of ISO country codes to numbers and rejects any key that does not match.

## Where to go next

Once you have a schema you trust, feed it into [Ajv](https://ajv.js.org/) with `strict: true` and `allErrors: false` in production hot paths — `allErrors: true` is great for developer tools but slower. Pair it with the [JSON Formatter](/formatter/) for quick payload inspection, and combine it with [JSON Pointer and JSON Patch](/docs/json-pointer-and-patch/) to understand how `$ref` paths are resolved under the hood.

If you validate untrusted input, also read [JSON Security Pitfalls](/docs/json-security-pitfalls/) — schema alone does not stop prototype pollution or parser-level DoS.
