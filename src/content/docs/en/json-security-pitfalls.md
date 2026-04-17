---
title: "JSON Security Pitfalls — Prototype Pollution, DoS, and Parsing Attacks"
description: "Every JSON input is attacker-controlled until proven otherwise. Prototype pollution, parser DoS, deep nesting — the attacks that actually ship against JSON endpoints."
category: security
relatedToolIds: ["formatter", "json-schema-validator"]
publishedAt: 2026-04-17
lang: en
tags: ["security", "prototype-pollution", "json-dos"]
excerpt: "JSON.parse will not protect you from a billion-byte payload, a 10,000-deep object, or a key literally named __proto__. Here is what actually stops these."
---

A parser that accepts any syntactically valid JSON has not validated anything. It has only confirmed that the brackets balance and the quotes close. Every real attack on a JSON endpoint exploits something *after* the parser: a key literally named `__proto__`, a 100,000-element array that triggers `O(n²)` behaviour in a naive merge, a 50-megabyte string in a field you expected to hold an email address.

This guide covers the classes of attack that actually hit JSON endpoints in 2026, and the specific defenses that stop them.

## Prototype pollution

JavaScript objects inherit from `Object.prototype`. Any property you put on the prototype — `Object.prototype.isAdmin = true` — appears on every object that does not shadow it. Prototype pollution is the class of vulnerability where attacker-controlled input mutates `Object.prototype` through a recursive merge, clone, or option-parsing function.

The vulnerable shape:

```js
// attacker-controlled input
const payload = JSON.parse('{"__proto__": { "isAdmin": true }}');

// merge into application state (naive)
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
// Now every object in the process has isAdmin: true
console.log({}.isAdmin); // true
```

`JSON.parse` itself is safe — it produces a plain object with `__proto__` as a regular own property, not as the internal prototype link. The vulnerability is in the code that *walks* the parsed object and assigns into real objects without filtering the key.

Libraries that have shipped CVEs here: `lodash.merge`, `minimist`, `object-path`, `dot-prop`, `json-ptr`, and many project-local "deep merge" helpers. The class was first widely catalogued by Olivier Arteau in 2018 and keeps reappearing in new libraries.

**Defenses:**

1. **Reject dangerous keys.** When walking untrusted input, refuse `__proto__`, `constructor`, and `prototype` keys explicitly. This is the simplest fix and what modern lodash does.
2. **Use `Object.create(null)` or `Map`.** Objects built with a `null` prototype have no `Object.prototype` to pollute.
3. **Use a schema.** A JSON Schema validator with `additionalProperties: false` rejects unknown keys before they reach the merge step. The [JSON Schema Validator](/json-schema-validator) is where you test this interactively.
4. **Freeze `Object.prototype` in production.** `Object.freeze(Object.prototype)` as a defense-in-depth measure — some frameworks do this at boot.

## Parser DoS: big inputs and deep nesting

`JSON.parse` throws on invalid syntax but happily parses a valid payload of unbounded size. Three flavours of DoS:

**1. Sheer volume.** A 500 MB JSON body will try to materialize as a JavaScript object that occupies 2-4 GB of heap (due to object overhead). On Node, the process crashes or the `--max-old-space-size` cap kills it. The defense is a request size limit at the HTTP layer — Express's `body-parser` defaults to 100 KB for JSON, and that is there for a reason. Raise it only where you need it.

**2. Deep nesting.** A JSON document like `{"a":{"a":{"a":...}}}` nested 10,000 levels deep parses fine but forces your downstream code (validators, serializers, loggers) into recursion that blows the stack or pegs a CPU core. `JSON.parse` itself is usually iterative in V8, but everything that touches the result tends to recurse.

```js
// attacker payload
let deep = 'null';
for (let i = 0; i < 100_000; i++) deep = `{"a":${deep}}`;

JSON.parse(deep);             // ok
JSON.stringify(JSON.parse(deep)); // RangeError: Maximum call stack size exceeded
```

**3. Key-collision hashing.** Historical; most modern engines randomize hash seeds and this no longer works against V8. Still worth knowing because it shows up in older language runtimes.

**Defenses:**

1. **Request size limits.** Enforce at the HTTP layer, below the application. A reverse proxy cap of 1 MB or 10 MB eliminates the tail.
2. **Schema with `maxLength`, `maxItems`, and `maxProperties`.** Every string and array in your schema should have a bound.
3. **Reject depth.** Some libraries (`secure-json-parse`, `@hapi/bourne`) reject documents above a configurable depth.
4. **Timeout your validator.** If validation takes more than a few milliseconds on typical input, you have a slow schema or a big input.

## Billion-laughs-style expansion

YAML has this problem natively with anchors and aliases. JSON does not — there is no native reference mechanism — **but JSON Schema does**, through `$ref`. A schema that refers to itself via `$ref` with complex combinators can cause a validator to do exponential work.

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

Ajv handles this specific case, but other validators have shipped CVEs. If you accept user-supplied schemas (a developer tool, an OpenAPI import feature), treat them as executable code and sandbox accordingly.

## Signed but unverified: MIME sniffing and content-type confusion

Modern browsers have mostly fixed MIME sniffing for `application/json`, but older toolchains still exist. Two related issues:

- **JSON hijacking.** Legacy attack against top-level JSON arrays served without `X-Content-Type-Options: nosniff`. Not relevant to modern browsers but still shows up in audits.
- **Content-type confusion.** An endpoint that accepts JSON without checking the `Content-Type` header can be tricked into accepting form-encoded data that looks JSON-ish, sidestepping CSRF defenses tied to content type.

Defenses: always send `Content-Type: application/json; charset=utf-8` and `X-Content-Type-Options: nosniff`. Always check `Content-Type` on the receiving side — do not just call `JSON.parse` on any POST body.

## Numeric precision

JSON numbers are IEEE 754 doubles in every mainstream parser (JavaScript, JSON.parse in Python, encoding/json in Go). A 64-bit integer loses precision above `2^53` (9,007,199,254,740,993 becomes 9,007,199,254,740,992). This is not a security bug by itself but has caused financial-transaction bugs at banks that serialized `uint64` IDs as JSON numbers.

The fix is to serialize large integers as strings. Go's encoding/json respects the `,string` struct tag. JSON Schema has `"type": "string", "pattern": "^[0-9]+$"` for this case. If you control both sides, prefer strings for anything over 32 bits.

## A defense-in-depth checklist

| Layer | Defense |
| --- | --- |
| HTTP | Request size limit, `Content-Type` check, `nosniff` header |
| Parser | Safe-load variant when the format allows it (YAML safe-load, JSON is inherently safer) |
| Schema | Validate against JSON Schema with `additionalProperties: false`, bounded `maxLength`/`maxItems` |
| Merge/walk | Reject `__proto__`/`constructor`/`prototype` keys or use `Object.create(null)` |
| Validator | Depth cap, timeout, schema cache, no remote `$ref` at request time |
| Logging | Do not log entire request bodies; truncate at a known length |

## A quick self-test

Paste this into any HTTP endpoint that accepts JSON behind a validator you wrote:

```json
{
  "__proto__": { "polluted": true },
  "constructor": { "prototype": { "polluted": true } },
  "normal_field": "value"
}
```

Then, in a separate request, check whether `{}.polluted` is true. If it is, you have a pollution vulnerability. The [JSON Formatter](/formatter) is a safe way to inspect the exact bytes before sending them.

## Related reading

- [JSON Schema Essentials](/docs/json-schema-essentials/) for the schema keywords that enforce the size limits above.
- [JSON vs YAML vs TOML](/docs/json-vs-yaml-vs-toml-decision/) for a deeper dive on YAML's unsafe-load problem, which does not exist in JSON.
- [JWT Best Practices in 2026](/docs/jwt-best-practices-2026/) for the signed-JSON case, where the same principles apply with extra rules.
