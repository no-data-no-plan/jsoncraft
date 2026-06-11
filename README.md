# JSONCraft

**[jsoncraft.dev](https://jsoncraft.dev)** — JSON formatter, diff, viewer and 20+ developer tools. Everything runs client-side: your data never leaves the browser. No signup, EN + ES.

## Tools

JSON formatter · diff · tree viewer · graph view · JSONPath tester · JSON Schema validator · YAML validator · YAML ⇄ JSON · CSV ⇄ JSON · TOML ⇄ JSON · JSON → TypeScript · JSON → HTML table · XML formatter · regex tester · base64 · URL encode/decode · hash generator · UUID generator · timestamp converter · cron builder

## Architecture

- **Astro + Svelte 5 + CodeMirror 6** on **Cloudflare Pages**; each tool is an interactive island on a static page.
- **Edge middleware** (`functions/_middleware.js`): per-request nonce CSP (no `unsafe-inline`), strict security headers, `304` pass-through guard to keep cached HTML and CSP nonces in sync.
- **Privacy by construction**: parsing, conversion and diffing happen in the browser — there is no backend that sees your JSON.
- **Quality gates**: a11y pre-commit hook, vitest unit tests, Playwright e2e, per-URL honest sitemap `lastmod` derived from git history.

## Development

```sh
npm ci
git config core.hooksPath .githooks   # a11y pre-commit checks
npm run dev
npm run build
npm test
```

Node ≥ 22.12. Clone with full history (the sitemap step reads per-file git dates).

## Status

Actively maintained. Built and operated by [Marco B.](https://jsoncraft.dev/about/)
