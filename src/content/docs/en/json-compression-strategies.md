---
title: "JSON Compression Strategies — gzip, MessagePack, CBOR, and When Each Wins"
description: "JSON is text and it compresses beautifully. But sometimes you want a binary format instead. Here is when gzip is enough and when MessagePack or CBOR earns its keep."
category: performance
relatedToolIds: ["formatter"]
publishedAt: 2026-04-17
lang: en
tags: ["compression", "msgpack", "cbor", "gzip"]
excerpt: "JSON plus gzip already wins on the wire. The binary formats only pull ahead when parse speed, message size floor, or type fidelity matter more than ubiquity."
faq:
  - q: "Is MessagePack actually smaller than gzipped JSON?"
    a: "Usually no. Raw MessagePack is 60-75% of raw JSON size, but JSON compresses extraordinarily well under gzip because of repeated keys and ASCII digits — expect 20-30% of original size after gzip. MessagePack gzipped is typically larger than JSON gzipped because its binary-packed bytes compress less efficiently than text redundancy. Where MsgPack wins: binary data alongside structure (avoids base64's 33% inflation), storage on devices that cannot run gzip, or internal service-to-service traffic where you want to skip the gzip CPU cost entirely."
  - q: "Should I use CBOR instead of MessagePack?"
    a: "For pure engineering purposes, pick whichever has better library support in your stack — the wire format, size, and parse cost are nearly identical. The real difference is standardization: CBOR is RFC 8949, an IETF standard used in IoT (CoAP), WebAuthn, and the COSE signing format. MessagePack has de facto adoption but no formal RFC. If you need to cite a spec in a security review, point to an RFC, or interoperate with IoT/WebAuthn stacks, use CBOR. If your ecosystem already ships good MsgPack libraries, stay there."
  - q: "When does a binary JSON format actually win?"
    a: "Four situations. One: inter-service traffic where you control both ends and CPU cost of gzip/ungzip matters — MsgPack or Protobuf saves the cycles. Two: payloads dominated by binary blobs where JSON's base64 inflates by 33%. Three: extreme parse-speed requirements in a fast language (Go, Rust, C++) where generated Protobuf decoders beat JSON parsing. Four: constrained environments like IoT radios where gzip is not available. On public HTTP APIs with gzip at the edge, JSON almost always wins on total cost when you factor in debuggability and ecosystem."
  - q: "Is JSON.parse slower than binary decoders?"
    a: "In JavaScript, usually not. V8's `JSON.parse` is one of the most heavily optimized routines in the engine — SIMD-accelerated state machine, specialized fast paths for common object shapes. A hand-written MessagePack parser in pure JS typically loses to it on small-to-medium payloads. Binary wins in parse speed only when the decoder is generated code in a fast language (Go, Rust, C++) and parsing is the measured bottleneck. Before optimizing for parse speed in V8, profile first — most 'JSON is slow' problems are actually 'we parse the same payload 300 times per request.'"
  - q: "Should I use zstd or gzip for JSON at rest?"
    a: "zstd if you control both ends. It compresses slightly better than gzip at comparable speeds and decompresses 2-5x faster at similar ratios, making it the right modern default for storage — S3, Kafka topics, on-disk caches. gzip remains the safe default over HTTP because every browser and CDN supports it automatically. Brotli is a middle ground for static assets but has slower compression than gzip for dynamic content. For JSON specifically, zstd's level 3 is usually the sweet spot: compression speed competitive with gzip level 6, slightly better ratio, much faster decode."
---

JSON has one real performance weakness: it is text. Every integer is a string of digits, every key is spelled out on every object, every boolean is four or five bytes. For a large payload this is wasteful, which is why every mainstream HTTP stack applies gzip by default and every few years a new binary format is proposed as "JSON but faster."

This guide walks through the three practical alternatives — **gzip on JSON**, **MessagePack**, and **CBOR** — and when each one is actually the right answer. Spoiler: most of the time it is still JSON with gzip.

## The candidates

| Format | Type | Typical size vs raw JSON | Parse speed (V8) | Schema needed? | Ubiquity |
| --- | --- | --- | --- | --- | --- |
| JSON (raw) | Text | 100% | **Fastest** (native) | No | Universal |
| JSON + gzip | Text + compressed | 20-30% | Decompress + parse | No | Universal on the web |
| MessagePack | Binary | 60-75% (uncompressed) | Slower than JSON.parse | No | Good, language-dependent |
| CBOR (RFC 8949) | Binary | 60-75% (uncompressed) | Comparable to MsgPack | No | IETF standard, less tooling |
| Protocol Buffers | Binary + schema | 30-60% | Fast (code-gen) | **Yes** | gRPC ecosystem |
| Apache Avro | Binary + schema | 30-50% | Fast | **Yes** | Big-data pipelines |

Two things leap out. **On the wire, JSON + gzip is the smallest non-schema option** — text compresses better than the lightly-packed binary formats. And **`JSON.parse` is the fastest pure parser in V8** for most real payloads, because it is native C++ and binary formats need an extra decoding step.

## gzip is almost always enough

A typical JSON payload has enormous redundancy: repeated keys on every object, long camelCase identifiers, ASCII digits for numbers. gzip (DEFLATE) eats this for breakfast. Expect 70-80% size reduction on any JSON document larger than about 1 KB, and 80-90% on API responses with repeated objects.

```bash
$ wc -c api_response.json
1948221 api_response.json           # 1.95 MB

$ gzip -c api_response.json | wc -c
 287904                             # 288 KB — 85% reduction
```

Every modern HTTP stack — nginx, Cloudflare, every cloud load balancer, every serverless function runtime — does this transparently when the client sends `Accept-Encoding: gzip`. You are almost certainly already paying this price once, on the edge.

The interesting case is when you have JSON *at rest* — on disk, in S3, in a Kafka topic. There, you get to choose. gzip is still an excellent default; `zstd` compresses slightly better and decompresses 2-5x faster at similar ratios, and is the right modern default if you control both ends.

## MessagePack

MessagePack is a binary format designed to be "like JSON, but smaller and faster." It maps 1:1 to JSON's type system — maps, arrays, strings, numbers, booleans, null — plus a few extensions like binary data and timestamps.

A MessagePack payload is 60-75% of the raw JSON size without compression. Keys are still spelled out (there is no schema), so the savings come from binary encoding of numbers, fewer structural bytes (no quotes, no commas), and tight integer packing.

```js
import { encode, decode } from '@msgpack/msgpack';

const payload = { users: [{ id: 1, name: 'Ana' }, { id: 2, name: 'Ben' }] };
const bytes = encode(payload);        // Uint8Array, 32 bytes
const back  = decode(bytes);           // equivalent object
```

**When MsgPack wins:**

- Binary data alongside JSON-like structure. Encoding a `Uint8Array` in JSON means base64, which inflates by 33%. In MsgPack, it is a first-class type.
- Storage where you cannot apply gzip (some IoT radios, some embedded stacks).
- Inter-service traffic where you control both ends and want to save the gzip CPU cost.

**When it does not:**

- Over HTTP, after gzip, MsgPack is usually larger than JSON-over-gzip.
- `JSON.parse` in V8 is faster than MsgPack decode for small payloads, because V8's JSON parser is extraordinarily optimized.
- Debuggability: JSON is readable in any tool, anywhere. MsgPack needs a decoder.

## CBOR

CBOR (Concise Binary Object Representation, RFC 8949) is the IETF-standardized equivalent of MessagePack. The wire format is similar in size and parse cost. The real difference is that CBOR is a standard with a formal spec, used in IoT (CoAP), WebAuthn, and the COSE signing format.

If your constraint is "we need a binary object representation and an RFC to cite," CBOR is MessagePack's more formally-dressed sibling. For raw engineering purposes, pick whichever has better library support in your stack.

## Schema-driven: Protobuf and Avro

Protocol Buffers and Avro are in a different category. They require a schema on both ends, and they use that schema to encode only the *data*, not the field names or structure. A Protobuf message for `{id: 1, name: "Ana"}` with `id` as field 1 and `name` as field 2 is roughly:

```txt
08 01 12 03 41 6e 61
```

That is seven bytes for what JSON spells out in 22. Protobuf is the right answer when:

- You control both ends and can coordinate schema changes.
- Parse speed matters more than ubiquity — Protobuf decoders use generated code, which is faster than JSON parsing in most languages.
- You want wire-level backward and forward compatibility guarantees.

The cost is operational: every message has a schema artifact you must ship, version, and evolve. For internal services this is a fair trade; for public APIs it is almost always wrong. Stripe, GitHub, and every other public API worth mentioning uses JSON.

## Benchmarking on your own payload

Never pick a format based on someone else's benchmark. JSON vs MsgPack vs CBOR hinges on your data shape — lots of small messages vs one large one, numeric-heavy vs string-heavy, deeply nested vs flat.

A quick benchmark in Node:

```js
import { performance } from 'node:perf_hooks';
import { encode, decode } from '@msgpack/msgpack';
import { gzipSync } from 'node:zlib';

const payload = JSON.parse(await readFile('sample.json', 'utf8'));
const jsonStr = JSON.stringify(payload);

// sizes
console.log('json       ', jsonStr.length);
console.log('json+gzip  ', gzipSync(jsonStr).length);
console.log('msgpack    ', encode(payload).length);
console.log('msgpack+gz ', gzipSync(encode(payload)).length);

// parse speed (median of N)
const N = 1000;
let t = performance.now();
for (let i = 0; i < N; i++) JSON.parse(jsonStr);
console.log('JSON.parse   ', (performance.now() - t) / N, 'ms/op');

const mpBytes = encode(payload);
t = performance.now();
for (let i = 0; i < N; i++) decode(mpBytes);
console.log('mp.decode    ', (performance.now() - t) / N, 'ms/op');
```

Run this on three sizes of your real data. The results will usually surprise you in one of two directions: either gzip handles everything and the binary formats add complexity for no win, or your data has a specific property (lots of binary blobs, lots of integers) that makes binary a clear winner.

## A decision tree

1. **Is the traffic over HTTP and public?** JSON. gzip/br are already applied by the edge. Anything else costs you debuggability for a few percent.
2. **Is the traffic internal between two services you control, and is CPU a bottleneck?** Consider Protobuf or MsgPack. Benchmark first.
3. **Are you storing at rest?** JSON + zstd. Fast, small, no schema needed.
4. **Are you storing at rest AND the schema is stable AND you need to read selectively (column-style)?** Apache Parquet with Arrow. Different game entirely.
5. **Is the payload mostly binary data with some metadata?** MsgPack or CBOR, because base64 in JSON is painful.

## A note on parser speed

The intuition "binary formats are faster to parse" is often wrong in JavaScript. V8's `JSON.parse` is one of the most-optimized routines in the engine — it has a custom SIMD-accelerated state machine and specialized fast paths for common shapes. A hand-written MsgPack parser in JS will lose to it on any small-to-medium payload. Where binary wins is when parsing dominates *and* the decoder is generated code in a fast language (Go, Rust, C++).

Before optimizing for parse speed in V8, confirm it is actually the bottleneck with a profile. Most "JSON is too slow" problems are actually "we JSON.parse the same thing 300 times per request."

## Related reading

- [Streaming JSON Parsers](/docs/json-streaming-large-files/) — if your payload is large enough to need compression, it may also be large enough to need streaming.
- [JSON vs YAML vs TOML](/docs/json-vs-yaml-vs-toml-decision/) — compression does not change which text format is right for configuration.
- [JSON Security Pitfalls](/docs/json-security-pitfalls/) — a gzipped JSON bomb (small on wire, huge when decompressed) is a real attack. Cap `Content-Length` pre-decompression.
