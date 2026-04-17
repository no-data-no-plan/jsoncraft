---
title: "JSONPath vs JMESPath vs jq — When to Use Each"
description: "Three JSON query languages, three different sweet spots. A practical comparison of JSONPath, JMESPath, and jq with real queries and when to reach for each."
category: ecosystem
relatedToolIds: ["jsonpath", "viewer"]
publishedAt: 2026-04-17
lang: en
tags: ["jsonpath", "jmespath", "jq", "query"]
excerpt: "JSONPath for selection. JMESPath for AWS. jq for transformation. Same family of problems, three different answers."
---

You have a big blob of JSON and you want one piece of it — or a transformed version of many pieces of it. There are three widely-deployed query languages for JSON in 2026: **JSONPath**, **JMESPath**, and **jq**. They look similar at a glance and solve overlapping problems, but their sweet spots are genuinely different.

This guide walks through what each one is, where it came from, and when to reach for it.

## The family at a glance

| Property | JSONPath | JMESPath | jq |
| --- | --- | --- | --- |
| First published | 2007 (Stefan Goessner) | 2013 (AWS) | 2012 (Stephen Dolan) |
| Standardized | RFC 9535 (2024) | Formal spec with grammar | Informal, de-facto canonical impl |
| Primary use | Selection / path extraction | Selection + light shaping | Selection + transformation + scripting |
| Built-in functions | Few (varies by impl) | ~30 typed functions | 100+ functions, lambdas, variables |
| Turing-complete? | No | No | **Yes** |
| Typical runtime | In-process library | In-process library | Standalone binary (`jq`) or library |
| Reference implementations | Many, divergent | AWS SDK, jmespath.js, jmespath.py | Canonical `jq` C binary, gojq, jq-web |

## JSONPath: the simple selector

JSONPath is the "XPath for JSON" that Stefan Goessner sketched in a 2007 blog post. For 17 years it had no formal spec, which resulted in dialect fragmentation — `$..book[0]` works differently across implementations, and features like filter expressions are inconsistent. **RFC 9535**, published in 2024, finally standardized the language and settled most of those disagreements.

A JSONPath expression selects a set of nodes from a JSON document. It is read-only and purely a selector — there is no mapping or transformation step.

```
$                          # root
$.store.book[0]            # first book
$.store.book[*].title      # every book title
$..author                  # every author anywhere
$.store.book[?(@.price<10)] # filter expression
$.store.book[0,2]          # specific indices
$.store.book[:3]           # slice
```

You can try these live in the [JSONPath Tester](/jsonpath) against any payload.

**Use JSONPath when:**

- You just need to pluck values by path.
- You are working inside a library that already uses it (JSON Schema `errors` paths, many GUI JSON explorers).
- You need something simple enough that a non-engineer could guess.

**Avoid JSONPath when** you need to transform output structure. It cannot rename fields, reshape objects, or compute. If the answer has any shape your input did not, you want JMESPath or jq.

## JMESPath: AWS CLI's query language

JMESPath was designed at AWS to query responses from the AWS API. If you have ever typed `aws ec2 describe-instances --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name}"`, you have written JMESPath. It has a formal ABNF grammar and an extensive test suite, which means every compliant implementation behaves identically.

The standout feature compared to JSONPath is **output reshaping**: JMESPath can construct objects and arrays with new structure from matched nodes.

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

JMESPath has roughly 30 built-in functions (`length`, `sort_by`, `group_by`, `starts_with`, `contains`, `map`, etc.), pipe expressions, and a coherent type system. The functions are typed — passing a string to `sort_by` is a parse-time error, not a runtime surprise.

**Use JMESPath when:**

- You are inside the AWS ecosystem — it is the native query language.
- You need selection plus light reshaping in a portable query string.
- You want every implementation to behave the same way.

**Avoid JMESPath when** you need real programming: recursion, local variables, complex conditionals, or custom functions. JMESPath intentionally does not go there.

## jq: the functional language for JSON

jq is not really a query language. It is a small functional programming language whose values happen to be JSON. It has variables, functions you can define, conditionals, recursion, modules, and streaming support. The canonical implementation is a single C binary that every Unix developer can `brew install jq` or `apt install jq` into place.

```bash
# select + reshape (like JMESPath above)
jq '.Reservations[].Instances[] | { Id: .InstanceId, State: .State.Name }' input.json

# grouping with a named function
jq '.logs | group_by(.service) | map({ service: .[0].service, count: length })' input.json

# custom function + variable
jq 'def by_user($u): .users[] | select(.id == $u); by_user("u_42") | .name' input.json

# streaming a large array
jq -c --stream '. | select(.[0][0] == "records") | .[1]' huge.json
```

The things jq can do that the others cannot:

- **Pipe arbitrary transformations.** Every jq expression is a filter; you chain them with `|` like shell pipes.
- **Define and reuse functions.** `def inc: . + 1; [1,2,3] | map(inc)`.
- **Variables, `as`, destructuring.** `. as $root | .items[] | $root.meta + {item: .}`.
- **Streaming mode.** For files that will not fit in memory, `--stream` emits `[path, value]` events you can filter without ever materializing the whole tree.
- **Output modes.** `-c` for compact NDJSON, `-r` for raw strings (use this when piping to other Unix tools).

**Use jq when:**

- You are in a shell pipeline or a CI script.
- You need to transform, not just select.
- The query would need conditions, joins, groupings, or reshape that a one-liner selector cannot express.

**Avoid jq when** you are inside a non-shell application and adding a jq engine is heavier than importing a JSONPath library. Most languages have a native jq implementation today (gojq, pyjq, jq-web for browsers), but the dependency weight is real.

## Side by side: "get titles of books under $10"

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

For pure selection, all three work. The differences matter when the query grows. Adding "and output the title in uppercase with the price as a string" is a one-character extension in jq (`| { title: .title | ascii_upcase, price: "$\(.price)" }`), awkward but doable in JMESPath, and impossible in JSONPath.

## Picking one in practice

- In a **config file** (Helm, Kustomize, an API client spec) you are likely writing JSONPath because that is what the tool expects. Fine.
- In an **AWS CLI command** or an AWS SDK call you are writing JMESPath. Fine.
- At a **shell prompt or in a CI script** you want jq.
- Inside **application code**, pick the one with the best library for your language. In JS/TS, `jsonpath-plus` for JSONPath, `jmespath.js` for JMESPath, `jq-wasm` for jq — each has tradeoffs on bundle size and features.

Use the [JSONPath Tester](/jsonpath) and the [JSON Viewer](/viewer) to prototype your selectors before wiring them into code. Getting the expression right interactively is five minutes; debugging a wrong selector in production is an afternoon.

## Related reading

- [JSON Pointer and JSON Patch](/docs/json-pointer-and-patch/) — if you just need to address a single node (not a set), RFC 6901 is more precise and universally implemented.
- [Streaming JSON Parsers](/docs/json-streaming-large-files/) — when the input is too big for jq's default mode, `--stream` shows up there too.
