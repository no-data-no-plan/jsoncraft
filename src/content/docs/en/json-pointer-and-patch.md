---
title: "JSON Pointer and JSON Patch — RFC 6901 and RFC 6902 Explained"
description: "JSON Pointer is a standardized path syntax. JSON Patch is a standardized diff format. Both are tiny, both are universally supported, and both save you from reinventing them."
category: fundamentals
relatedToolIds: ["jsonpath", "diff"]
publishedAt: 2026-04-17
lang: en
tags: ["json-pointer", "json-patch", "rfc-6901", "rfc-6902"]
excerpt: "Two small RFCs most teams reinvent without knowing they exist. JSON Pointer addresses a single node. JSON Patch describes an atomic series of changes. Use them."
---

JSON Pointer (RFC 6901) and JSON Patch (RFC 6902) are two of the smallest, most universally implemented, and most frequently reinvented specifications in the JSON ecosystem. Both are under five pages. Both solve problems most teams solve badly with ad-hoc code.

**JSON Pointer** is a standardized syntax for addressing a single node in a JSON document. **JSON Patch** is a standardized format for describing a series of atomic changes to a document. They are related: JSON Patch uses JSON Pointer to name the locations it modifies.

## JSON Pointer: addressing one node

A JSON Pointer is a string with slash-separated tokens, each of which is an object key or an array index. The root of the document is the empty string. Tokens are combined with leading slashes.

```
// document
{
  "users": [
    { "id": 1, "name": "Ana" },
    { "id": 2, "name": "Ben" }
  ],
  "total": 2
}

// pointer            // resolves to
""                    // the whole document
"/total"              // 2
"/users"              // the array
"/users/0"            // { "id": 1, "name": "Ana" }
"/users/0/name"       // "Ana"
"/users/1/id"         // 2
```

Two characters need escaping inside tokens: `/` becomes `~1` and `~` becomes `~0`. So a key literally named `a/b~c` is referenced as `/a~1b~0c`. That is the entire escaping rule.

### Why it matters

JSON Pointer is the substrate for a lot of JSON tooling you already use:

- **JSON Schema `$ref`** uses JSON Pointer after the `#`. `{ "$ref": "#/definitions/address" }` is a JSON Pointer into the same document.
- **JSON Patch** uses JSON Pointer to name the target of every operation.
- **JSONPath-based tools** often emit JSON Pointer as their underlying address form because it is unambiguous (unlike JSONPath, which has dialect drift).
- **Error messages from Ajv and most validators** report the failing path as a JSON Pointer.

### JSON Pointer vs JSONPath

These look similar but are fundamentally different:

| | JSON Pointer | JSONPath |
| --- | --- | --- |
| Addresses | Exactly one node | A set of nodes (zero or more) |
| Has wildcards | No | Yes (`*`, `..`) |
| Has filters | No | Yes (`?(@.price<10)`) |
| Has one canonical spec | **Yes** (RFC 6901) | Only since 2024 (RFC 9535) |
| Implementations agree | Always | Often, not always |

Pointer is precise and simple. JSONPath is flexible and powerful but loose. Use Pointer when you need "the node," use JSONPath when you need "every node that matches."

## JSON Patch: atomic changes

JSON Patch is a format for describing changes to a JSON document. A patch is an array of operation objects. Each operation has an `op`, a `path` (a JSON Pointer), and possibly a `value` or a `from`.

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

The six operations in full:

| op | Required fields | Behavior |
| --- | --- | --- |
| `add` | `path`, `value` | Insert value at path. For arrays, path can end in `-` to append |
| `remove` | `path` | Delete the node at path |
| `replace` | `path`, `value` | Replace the node at path with a new value |
| `move` | `from`, `path` | Remove from `from`, add at `path` |
| `copy` | `from`, `path` | Copy node at `from` to `path` |
| `test` | `path`, `value` | Assert node at path equals value; if not, abort the whole patch |

The `test` op is what makes JSON Patch more than a mutation script. It lets you write compare-and-swap patches that fail cleanly if the document changed between when you read and when you wrote.

### Atomicity

A JSON Patch is **all-or-nothing**. If any operation in the array fails (a `test` mismatch, an `add` to a missing parent, a `remove` on a path that does not exist), the whole patch is aborted and the document is left unchanged. This is the key property that makes it useful for HTTP `PATCH` — you can send a patch and either it fully applied or nothing changed, without the client having to undo partial writes.

### HTTP semantics

The IETF `PATCH` method is deliberately format-agnostic, but RFC 5789 explicitly calls out JSON Patch as the canonical JSON-over-HTTP approach. A typical exchange:

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

The `test` operation combined with an ETag gives you optimistic concurrency control: two clients editing the same document cannot silently clobber each other.

## JSON Merge Patch: the simpler cousin

RFC 7396 defines **JSON Merge Patch**, which is a different, simpler format for the common case of "update these fields." A merge patch is itself a JSON object. Applying `{"name": "Updated", "tags": null}` to a document means:

- Set `name` to `"Updated"`.
- Delete `tags` (because the merge value is `null`).
- Leave everything else untouched.

Merge Patch is simpler to write but has two limitations: you cannot distinguish "delete this field" from "set it to null" (null means delete), and it cannot express array operations like "append one item." If you need either, use JSON Patch.

Content types: `application/json-patch+json` for RFC 6902, `application/merge-patch+json` for RFC 7396. Picking the right one is a signal to the server which format to expect.

## Generating patches from diffs

You rarely write a patch by hand. The common pattern is:

1. Fetch the current state.
2. Edit a local copy.
3. Compute a patch by diffing old vs new.
4. Send the patch.

Libraries that do step 3: `fast-json-patch` in JS, `jsonpatch` in Python, `evanphx/json-patch` in Go. They produce a minimal patch that describes the difference.

When debugging, the [JSON Diff tool](/diff/) visualizes exactly what changed between two documents — useful for checking that the patch you are about to send matches what you intend. Paste the before and after, read the diff, then let your library generate the JSON Patch.

## A practical example: collaborative editing

Say two users edit the same document concurrently. Without merging, one wins and overwrites the other. With JSON Patch plus ETags, the server rejects the second write (because the `test` on version fails), and the client can re-fetch, rebase, and try again. This is the same pattern git uses for merging, applied to a single JSON document.

```js
// client computes a patch from its local edits
const patch = jsonpatch.compare(originalDoc, editedDoc);

// prepend a version check
patch.unshift({ op: 'test', path: '/version', value: originalDoc.version });
patch.push({ op: 'replace', path: '/version', value: originalDoc.version + 1 });

// send
await fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json-patch+json', 'If-Match': etag },
  body: JSON.stringify(patch),
});
// 412 Precondition Failed → someone else patched first, re-fetch and retry
```

## When to reach for what

| You want to... | Use |
| --- | --- |
| Address one node in a document | JSON Pointer |
| Describe a schema reference | JSON Pointer (inside `$ref`) |
| Send a compact, atomic set of changes to an API | JSON Patch |
| Send a simple field-update | JSON Merge Patch |
| Query many nodes with conditions | JSONPath |
| Write a complex transformation | jq |

## Related reading

- [JSONPath vs JMESPath vs jq](/docs/jsonpath-vs-jmespath-vs-jq/) for when you need a set of nodes instead of one.
- [JSON Schema Essentials](/docs/json-schema-essentials/) — `$ref` uses JSON Pointer, and schema error paths are JSON Pointers.
- [JSON Security Pitfalls](/docs/json-security-pitfalls/) — a JSON Patch with a `path` of `/__proto__/isAdmin` is a pollution attempt in disguise. Filter patch paths for dangerous keys, same as you do for parsed input.
