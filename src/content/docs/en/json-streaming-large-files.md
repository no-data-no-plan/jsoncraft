---
title: "Streaming JSON Parsers — Handling Arrays of a Million Records"
description: "You cannot JSON.parse a 5 GB file. Streaming JSON parsers process arrays one record at a time. Here is how oboe.js, stream-json, and ijson work in practice."
category: performance
relatedToolIds: ["viewer", "json-to-csv"]
publishedAt: 2026-04-17
lang: en
tags: ["streaming", "performance", "large-files"]
excerpt: "JSON.parse needs to materialize the entire document in memory. Streaming parsers emit events as they go. That difference is the only way to handle multi-gigabyte files."
faq:
  - q: "Can I JSON.parse a 5 GB file?"
    a: "No — not safely. `JSON.parse` materializes the entire document in memory, and a 5 GB JSON blob inflates to roughly 20+ GB of V8 heap because of object overhead. Node's default `--max-old-space-size` kills the process long before parsing completes. Above 100 MB you need a streaming parser (`stream-json`, `oboe.js`, `ijson`, `jq --stream`) that processes the input as a byte stream and emits events as structure becomes available, holding at most one record in memory at a time. Under 10 MB, the regular parser is fine and simpler."
  - q: "Which Node.js library is best for streaming JSON?"
    a: "`stream-json` is the de facto choice for production Node pipelines. It plugs into the native Streams API, so you pipe it like any other transform: `fs.createReadStream(file).pipe(parser()).pipe(streamArray()).on('data', ...)`. It has filters like `Pick` to focus on a specific subtree and streamers like `StreamArray` and `StreamValues` for common shapes. For progressive rendering in the browser, use `oboe.js` instead, which emits values as soon as they match a JSONPath-like selector. Both keep memory flat regardless of input size."
  - q: "When is streaming actually worse than batching?"
    a: "Streaming wins on memory but loses on ergonomics and random access. For files under 10 MB, the setup overhead — pipes, event handlers, partial-output recovery logic — is not worth it; `JSON.parse(text)` is one line. Streaming also gives up full-document validation (you cannot JSON Schema a document you never materialize), random access (jumping to record 900,000 requires streaming through 899,999 first), and clean error recovery (if input truncates mid-stream, you have already committed to earlier side effects). Write output to a staging location and swap atomically to mitigate partial-failure risk."
  - q: "Why is NDJSON easier to stream than a JSON array?"
    a: "NDJSON (newline-delimited JSON) puts one complete JSON value per line, with no enclosing array. Every streaming-capable tool — `jq`, `stream-json`, `ijson`, even `awk`/`head`/`tail` — handles it natively because splitting on newlines is trivial and each line parses independently. BigQuery exports, Kafka Connect sinks, and most log aggregators emit NDJSON for this reason. The tradeoff is that NDJSON is not 'valid JSON' — no outer array — but it was never meant to be. If you control the producer and expect large output, emit NDJSON."
  - q: "Does Python's standard json module support streaming?"
    a: "No. `json.load()` and `json.loads()` both materialize the whole document. Use `ijson` as the standard streaming answer: `for user in ijson.items(f, 'users.item'):` yields complete objects one at a time from the path you specify. `ijson.parse(file)` gives you the raw token stream for fine control. Install `ijson[yajl]` in production to get the C-based yajl backend, which is substantially faster than the pure-Python fallback. Go's `encoding/json` ships a `Decoder.Token()` iterator out of the box, no external dependency required."
---

A 5 GB JSON export from your analytics database lands in S3. You need to transform it, filter it, and push the result into a CSV for a stakeholder. `JSON.parse` is not going to work — it wants to build the entire object tree in memory, which on Node means 20+ GB of heap, which means OOM. The same story plays out for log aggregation, migrations, backup restoration, and anything else that deals with "JSON but big."

Streaming JSON parsers are the answer. They process the input as a byte stream and emit events as structure becomes available, never holding the whole document in memory. This guide covers how they work, the three canonical libraries, and the tradeoffs compared to the regular parser.

## How streaming parsers work

Every streaming JSON parser is a state machine that walks the byte stream and emits events: "started object," "key is `id`," "value is the string `abc123`," "ended object." The caller registers handlers for the events they care about and ignores the rest. The parser never materializes the whole tree — at most it holds the currently-open containers in a stack.

This is the same pattern SAX has for XML, and the libraries often advertise themselves as "SAX-style for JSON."

Here is what the event stream looks like for a small document:

```js
// input
// {"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Ben"}]}

// events (conceptual)
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

In practice, most libraries ship a convenience layer that lets you say "emit each element of `users[]` as a complete object" — the library accumulates the bytes for one user, emits it, and moves on.

## The canonical libraries

| Library | Language | Style | Best for |
| --- | --- | --- | --- |
| `stream-json` | Node.js | Node streams + pipes | Production Node pipelines |
| `oboe.js` | Browser + Node | Selector-based callbacks | Incremental rendering of HTTP responses |
| `ijson` | Python | Iterator / generator | Scripts, ETL |
| `encoding/json` w/ `Decoder.Token()` | Go | Token iterator | Standard library, zero deps |
| `jq --stream` | Shell | `[path, value]` events | Quick one-offs |

All of these handle multi-GB input on a small heap. Choice comes down to language and ergonomics.

## stream-json in Node

`stream-json` integrates with Node's Streams API, which means you pipe it like any other transform:

```js
import fs from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray.js';
import { pick } from 'stream-json/filters/Pick.js';

fs.createReadStream('huge.json')
  .pipe(parser())
  .pipe(pick({ filter: 'users' }))       // focus on the "users" array
  .pipe(streamArray())                    // emit each element separately
  .on('data', ({ key, value }) => {
    // value is one user object, fully materialized
    if (value.age >= 18) {
      writeCsvRow(value);
    }
  })
  .on('end', () => console.log('done'));
```

Memory stays flat — only one user at a time is alive in JS land. You trade random access (you cannot jump to the 500,000th user cheaply) for bounded memory.

## oboe.js for the browser

oboe.js was built for the case where an HTTP response is large and you want to render results progressively instead of waiting for the whole body. Its API uses JSONPath-ish selectors:

```js
import oboe from 'oboe';

oboe('/api/users')
  .node('users.*', user => {
    // fires for each user as soon as it is fully received
    appendToTable(user);
  })
  .done(full => console.log(`got ${full.users.length} users`));
```

oboe buffers minimally: once it has a complete value matching the selector, it emits it and discards. This is how old Google Maps first-result search worked — results appeared before the body finished downloading.

## ijson for Python

Python's `json` module is not streaming. `ijson` is the standard answer:

```python
import ijson

with open('huge.json', 'rb') as f:
    for user in ijson.items(f, 'users.item'):
        # user is a complete dict, one at a time
        if user['age'] >= 18:
            write_csv_row(user)
```

`ijson.items(file, path)` yields complete objects at the given path. `ijson.parse(file)` gives you the raw token stream if you need fine control. It ships backends for `yajl` (C, fastest) and pure Python; install `ijson[yajl]` for production.

## jq in streaming mode

If you are at a shell prompt, `jq --stream` is the easiest way to process a large file without installing anything extra:

```bash
# emit each user as NDJSON, filtering for adults
jq -c --stream '
  select(.[0][0] == "users" and (.[0] | length) == 2)
  | .[1]
' huge.json | jq -c 'select(.age >= 18)'
```

The `--stream` mode is a bit acquired — it emits `[path, value]` events and expects you to reassemble — but for one-offs it is often faster to write than installing anything.

## The tradeoffs

Streaming gives you flat memory usage and progressive output. You give up:

- **Random access.** You can only see what has already streamed past. Jumping to element 900,000 means streaming through 899,999 first.
- **Full-document validation.** You cannot run a JSON Schema validator over a document you never materialize. You can validate each element individually, which is usually what you want anyway.
- **Error recovery.** If the input is truncated at byte 4.2 GB, you already committed to the first 4.2 GB worth of side effects. Design your pipeline so partial output is safe — write to a staging table, then swap.
- **Ergonomics.** `JSON.parse(text)` is one line; streaming setup is ten. For small files, it is not worth it.

## When to reach for streaming

Rules of thumb, regardless of language:

- **Input under 10 MB:** use the regular parser. The complexity is not justified.
- **Input 10-100 MB:** regular parser still works but watch peak memory. In Node, a 100 MB JSON can hit 400 MB of heap during parse.
- **Input over 100 MB or unbounded:** streaming. No exceptions.
- **Input is a single huge object, not an array:** streaming only helps if you can skip parts. A single 2 GB object with no array in sight is just big, and you need a different data model.

## NDJSON and the streaming-friendly format

If you control the producer, consider emitting **NDJSON** (newline-delimited JSON) instead of a giant array. Each line is an independent JSON value. Every streaming-capable tool — jq, stream-json, ijson, even `awk`/`head`/`tail` — handles it naturally.

```
{"id": 1, "name": "Ana"}
{"id": 2, "name": "Ben"}
{"id": 3, "name": "Cyr"}
```

This is the format BigQuery, Kafka Connect sinks, and most log aggregators emit. It is also trivial to process with [JSON to CSV](/json-to-csv/) on a per-line basis. The price is that it is not "valid JSON" — no enclosing array — but it was never meant to be.

## Interactive inspection

When you have a sample file in the 1-50 MB range, the [JSON Viewer](/viewer/) will load it in-browser and let you navigate the tree lazily. Above that size, use a streaming parser to extract a sample and inspect the sample. Opening a 2 GB JSON in any GUI tool is asking for tears.

## Related reading

- [JSON Compression Strategies](/docs/json-compression-strategies/) — gzip alone cuts a multi-GB JSON to a third of its size, which may be enough to keep you on a non-streaming parser.
- [JSONPath vs JMESPath vs jq](/docs/jsonpath-vs-jmespath-vs-jq/) — jq's streaming mode is the easiest entry point to streaming if you are already comfortable with the basic syntax.
