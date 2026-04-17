---
title: "JSON vs YAML vs TOML — A Practical Decision Framework"
description: "Stop arguing about config formats. A practical framework for choosing between JSON, YAML, and TOML based on who reads it, who writes it, and what tooling you have."
category: formats
relatedToolIds: ["yaml-to-json", "json-to-yaml", "json-to-toml", "toml-to-json"]
publishedAt: 2026-04-17
lang: en
tags: ["yaml", "toml", "formats", "config"]
excerpt: "JSON, YAML, and TOML all represent the same tree of data. Which one you should use is decided by who edits the file, not by syntactic taste."
faq:
  - q: "Why does JSON have no comments?"
    a: "JSON was designed as a machine-to-machine data interchange format, not as a human-edited config format. Douglas Crockford, who specified JSON, deliberately removed comments because parsers were implementing non-portable directives in them, breaking interoperability between tools. The omission is a feature for wire traffic and a hostile property for configuration. If you find yourself wanting comments in a `.json` config file, that is the signal to convert it to YAML or TOML — both natively support `#` comments and both have mature tooling."
  - q: "When is YAML actually dangerous?"
    a: "YAML has two real security footguns. Tag-based deserialization lets a malicious document instantiate arbitrary classes during parsing via tags like `!!python/object:...`, `!!java...`, or `!!ruby/object:...` — always use `yaml.safe_load()` in Python, `SafeConstructor` in snakeyaml, or `YAML(typ='safe')` in ruamel on untrusted input. The other gotcha is the Norway problem: unquoted `NO` was parsed as boolean `false` in YAML 1.1 and many parsers still follow those semantics. Quote country codes and similar string-ish tokens defensively."
  - q: "Why does TOML work for Cargo but not deep config trees?"
    a: "TOML was designed for flat-to-moderately-nested configuration. Its table and dotted-key syntax is clean for shallow structures — `Cargo.toml` and `pyproject.toml` are mostly lists of packages, feature flags, and build options. Representing a 5-level-deep nested object in TOML is possible but reads badly, and TOML has no native reference or inheritance mechanism, so you end up repeating yourself. If your config is deep, cross-referenced, or multi-environment, YAML handles it more naturally thanks to anchors and aliases."
  - q: "Is YAML a superset of JSON?"
    a: "Since YAML 1.2, technically yes — every valid JSON document parses as YAML. That was an explicit goal, so you can paste a JSON blob into a YAML file and the parser accepts it. In practice, 'superset' hides that YAML adds significant whitespace, multi-document files, anchors, multiple scalar styles, and implicit typing on top. So while JSON-in-YAML works, YAML's extra features mean a round trip through JSON loses comments and anchors. Convert one way (YAML → JSON) freely, but treat the reverse as lossy."
  - q: "Can I safely convert between JSON, YAML, and TOML?"
    a: "Structural data round-trips cleanly; metadata does not. YAML → JSON loses comments and expands anchors inline, which inflates the file. JSON → YAML is lossless in structure but your emitter may default to block or flow style — check the output. TOML ↔ JSON is the cleanest round trip because TOML has explicit types that map 1:1 to JSON primitives, with one catch: TOML's native date types become plain strings in JSON. Use JSONCraft's in-browser converters (JSON → YAML, YAML → JSON, JSON → TOML, TOML → JSON) — no data leaves the page."
---

JSON, YAML, and TOML can all represent the same tree of data. A Kubernetes manifest in YAML, a `package.json` in JSON, and a `pyproject.toml` in TOML are encoding the same structural ideas: nested maps, lists, scalars. Which one you should use is decided less by syntactic taste and more by **who edits the file, who reads it, and what tooling you have on the far side**.

This guide gives you a practical framework for that decision, the pitfalls of each format, and the conversion paths between them.

## The three formats in one table

| Property | JSON | YAML | TOML |
| --- | --- | --- | --- |
| First spec | 2001 (RFC 4627, updated 8259) | 2001 (v1.2.2 latest, 2021) | 2013 (v1.0.0 in 2021) |
| Intended audience | Machines | Humans | Humans (config only) |
| Comments | **No** | `#` | `#` |
| Trailing commas | No | N/A | No |
| Strings need quotes | Yes | No (often) | Yes |
| Multi-document files | No | Yes (`---` separator) | No |
| Complex references | No | Yes (anchors `&`/`*`) | No |
| Schema story | JSON Schema (mature) | JSON Schema via conversion | TOML has no native schema |
| Parser complexity | Low | **Very high** | Medium |
| Typical file sizes | Any | Any, but degrades past ~1k lines | Small-to-medium config only |

## JSON: the wire format, not the config format

JSON was designed as a data interchange format and it shows. No comments, no trailing commas, mandatory quotes on every string key. These are features for machine-to-machine traffic and actively hostile properties for human-edited configuration.

Reach for JSON when:

- Data is moving over a network or between processes.
- You need the single most widely supported parser on the planet.
- You are generating the file from code, not editing it by hand.
- You need JSON Schema validation with a mature tooling stack.

Avoid JSON when humans will be editing the file frequently. Tools like [JSON to YAML](/json-to-yaml/) exist because `.json` config files in real projects get rewritten as YAML within a year anyway.

```json
{
  "name": "api-gateway",
  "port": 8080,
  "database": {
    "host": "localhost",
    "poolSize": 20
  },
  "featureFlags": ["rate-limit", "audit-log"]
}
```

Clean. Machine-friendly. No comments to explain *why* `poolSize` is 20.

## YAML: superset of JSON, with teeth

YAML 1.2 is technically a superset of JSON — every valid JSON document parses as YAML. It adds comments, multi-document files, anchors and aliases, multiple scalar styles, and significant whitespace. This is why Kubernetes, GitHub Actions, Ansible, and many CI systems picked it.

```yaml
# api-gateway config
name: api-gateway
port: 8080

database:
  host: localhost
  poolSize: 20   # raised from 10 after the Dec incident

featureFlags:
  - rate-limit
  - audit-log

# reused across deploy targets
defaults: &defaults
  timeout: 30s
  retries: 3

production:
  <<: *defaults
  replicas: 5

staging:
  <<: *defaults
  replicas: 1
```

The anchors (`&defaults`, `*defaults`, `<<:` merge key) are genuinely useful for configuration DRY. They are also the first thing a YAML novice trips over.

YAML has real security footguns:

- **Tag-based deserialization.** `!!python/object:...`, `!!java...`, `!!ruby/object:...` tags let a malicious YAML file instantiate arbitrary classes during parsing. **Always use `yaml.safe_load()` in Python, `SafeConstructor` in snakeyaml, `YAML(typ='safe')` in ruamel.** Never call `yaml.load()` on untrusted input.
- **The Norway problem.** Unquoted `NO` was historically parsed as boolean `false` in YAML 1.1. YAML 1.2 narrowed this but many parsers still follow 1.1 semantics. If you are writing country codes unquoted, you have a bug waiting.
- **Significant whitespace.** Tabs and spaces are not interchangeable. One stray tab and your config silently reshapes.

Use YAML when the file is primarily human-edited, references are useful (multi-environment config), and you have a schema validator on the receiving end. Feed it through [YAML to JSON](/yaml-to-json/) to sanity-check what your parser actually sees.

## TOML: config for humans, without the rope

TOML was designed explicitly for configuration files by Tom Preston-Werner. It is deliberately less expressive than YAML and trades that expressiveness for zero ambiguity. Rust's Cargo (`Cargo.toml`) and Python's modern packaging (`pyproject.toml`) both picked it.

```toml
# api-gateway config
name = "api-gateway"
port = 8080

[database]
host = "localhost"
pool_size = 20  # raised from 10 after the Dec incident

feature_flags = ["rate-limit", "audit-log"]

[production]
replicas = 5
timeout = "30s"
retries = 3

[staging]
replicas = 1
timeout = "30s"
retries = 3
```

TOML shines at flat-to-moderately-nested config. It has native support for dates (`RFC 3339`), integers, floats, booleans, and strings, with explicit types that do not guess. There is no Norway problem because strings require quotes.

Where TOML breaks down is deeply nested data. Representing a 5-level-deep nested object works but reads badly. TOML also has no native reference or inheritance mechanism, so you end up repeating yourself or post-processing at load time.

Use TOML when the file is a flat or shallow configuration, humans are the primary editors, and you value explicitness over expressiveness.

## The decision framework

Ask three questions in order:

1. **Who writes this file — a machine or a human?** Machine → JSON. Human → continue.
2. **How deep is the nesting, and do you need cross-references?** Deep + references (think Kubernetes, Ansible) → YAML. Shallow, no references → TOML.
3. **Can the file come from an untrusted source?** If yes, and you picked YAML, make sure every parser in your stack is in safe-load mode. JSON and TOML do not have deserialization-to-code footguns in their spec.

## Converting between them

Config tends to drift between formats over a project's life. A Node service starts with `package.json`, grows CI in `.github/workflows/*.yml`, and picks up a tool that wants `pyproject.toml`. Keeping them consistent is easier than picking one and forcing it everywhere.

JSONCraft ships four one-step conversions: [JSON → YAML](/json-to-yaml/), [YAML → JSON](/yaml-to-json/), [JSON → TOML](/json-to-toml/), and [TOML → JSON](/toml-to-json/). They run entirely in your browser — no data leaves the page, which matters if the file has secrets.

A few caveats on conversion:

- **YAML → JSON loses comments and anchors.** Anchors get expanded inline, which inflates the file. Comments just disappear. Plan for this if the YAML file is a source of truth that humans maintain.
- **JSON → YAML is lossless in structure but your tool might emit block style or flow style by default.** Check the output.
- **TOML ↔ JSON is the cleanest round trip** because TOML has explicit types that map 1:1 to JSON primitives, with one catch: TOML's date types become strings in JSON.

## A quick rule of thumb

- Wire traffic, machine-generated files, JSON Schema validation → **JSON**.
- Kubernetes, CI pipelines, multi-environment configs with references → **YAML** (with safe loaders).
- Rust, Python packaging, small-to-medium app config → **TOML**.

If you find yourself picking YAML for something small and flat, try TOML first. If you find yourself picking JSON for a file humans edit every week, try YAML. If you are picking TOML for a deeply nested tree, you are about to be sad.

See also: [JSON Security Pitfalls](/docs/json-security-pitfalls/) for parser-level attacks that apply to JSON inputs even when the format looks benign.
