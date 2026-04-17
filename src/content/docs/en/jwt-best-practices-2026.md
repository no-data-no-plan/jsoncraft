---
title: "JWT Best Practices in 2026 — What to Use, What to Avoid"
description: "Modern JWT guidance: EdDSA over RS256, mandatory alg pinning, revocation strategies, and the footguns that keep shipping in production auth code."
category: security
relatedToolIds: ["base64", "hash"]
publishedAt: 2026-04-17
lang: en
tags: ["jwt", "auth", "hs256", "rs256", "eddsa"]
excerpt: "JWTs are a signed JSON blob. Simple. They also remain the auth primitive most frequently misused in 2026. Here is the current best practice."
---

JSON Web Tokens are a signed, base64url-encoded blob. In principle they are simple. In practice they remain the authentication primitive most frequently misused in production — `alg: none` is still shipping in 2026, JWTs are still used as session tokens for use cases that need revocation, and RSA keys are still being generated at 1024 bits by tooling that refuses to die.

This guide covers what you should use in 2026, what you should avoid, and how to reason about the tradeoffs.

## The anatomy

A JWT is three base64url-encoded parts separated by dots: `header.payload.signature`. Note **base64url**, not base64 — `-` and `_` replace `+` and `/`, and trailing `=` padding is stripped. A JWT with a normal base64 signature will fail verification in every correct library.

```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTc2MzAwMDAwMH0.signature_bytes_base64url
```

Decode the first two segments with the [Base64 tool](/base64/) (remember to switch to url-safe variant) and you get plain JSON:

```json
// header
{ "alg": "EdDSA", "typ": "JWT" }
// payload
{ "sub": "user_123", "exp": 1763000000, "iat": 1762996400, "iss": "https://api.example.com" }
```

The signature is computed over `base64url(header) + "." + base64url(payload)` using whatever algorithm `alg` specifies. That is also the single biggest footgun in the spec.

## Algorithm selection in 2026

| Alg | Type | Key size | When to use | Notes |
| --- | --- | --- | --- | --- |
| `EdDSA` (Ed25519) | Asymmetric | 32 bytes | **Default for new systems** | Fastest verify, smallest keys, safest defaults |
| `ES256` (ECDSA P-256) | Asymmetric | 32 bytes | Hardware/FIPS constraints | Widely supported, slightly fiddlier than EdDSA |
| `RS256` | Asymmetric | ≥2048 bits | Legacy clients that require RSA | Large signatures (256 bytes at 2048-bit) |
| `HS256` | Symmetric HMAC | ≥32 random bytes | Single-service deployments | Same secret signs and verifies — no separation of roles |
| `none` | — | — | **Never** | Historical footgun, reject unconditionally |
| `RS1`, `HS1` | — | — | Never | SHA-1 is cryptographically broken |

**EdDSA is the right default in 2026.** Ed25519 verification is roughly 8x faster than RS256, signatures are 64 bytes instead of 256, keys are 32 bytes instead of 256, and the algorithm has no parameter choices that let you shoot yourself in the foot (no curve negotiation, no padding mode). It has been standardized in RFC 8037 since 2017 and every mainstream JWT library supports it.

If you are on a stack that cannot use EdDSA (some enterprise JCA providers, older hardware HSMs), use **ES256**. Reach for RS256 only when the consumer requires it — for instance, certain legacy OIDC clients.

Use **HS256** only when signing and verifying happen inside the same trust boundary. The moment a second party needs to verify tokens, you are handing them the ability to forge.

## The four rules that prevent most JWT CVEs

1. **Pin `alg` in your verifier.** Pass the expected algorithm explicitly — do not let the library read `alg` from the header. The classic attack is submitting a token with `alg: HS256` signed with the server's RSA public key, which the verifier dutifully accepts if it trusts the header.
2. **Reject `alg: none`.** Most modern libraries do this by default, but if you wrap a library or write your own, be explicit.
3. **Validate `exp`, `nbf`, and `iat`.** Expired tokens should fail validation. A 5-minute clock skew allowance is reasonable; anything larger is a code smell.
4. **Validate `iss` and `aud`.** Check that the token was issued by the party you expect and is intended for your service. Services that skip `aud` validation can have tokens intended for one API replayed against another.

```js
// Good: explicit algorithm, explicit audience, explicit issuer
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['EdDSA'],          // pinned
  audience: 'https://api.example.com',
  issuer:   'https://auth.example.com',
  clockTolerance: 30,              // seconds
});
```

## Standard claims worth knowing

| Claim | Name | Required? | Purpose |
| --- | --- | --- | --- |
| `iss` | Issuer | Recommended | Who minted this token |
| `sub` | Subject | Recommended | Who the token represents |
| `aud` | Audience | Recommended | Who should accept this token |
| `exp` | Expiration | **Required** | Unix timestamp after which token is invalid |
| `nbf` | Not before | Optional | Unix timestamp before which token is invalid |
| `iat` | Issued at | Recommended | Unix timestamp of issuance |
| `jti` | JWT ID | Optional | Unique ID, used for denylist/revocation |

Private claims go in the same object. Keep them small — every byte is carried on every request. If you need more than ~500 bytes of state, you are abusing JWT.

## The revocation problem

JWTs are, by design, stateless. A valid signature and a live `exp` are sufficient for acceptance. This is fast, but it means **there is no built-in way to revoke a token before it expires**. If a user logs out, if you detect credential theft, if permissions change — the old tokens remain valid until they expire.

There are three practical answers:

1. **Short lifetimes + refresh tokens.** Access tokens live 5-15 minutes. Revocation is "refuse to issue a new access token from this refresh token." This is the OAuth 2.0 model.
2. **Denylist by `jti`.** On logout or revocation, push the `jti` into Redis with TTL equal to remaining `exp` time. Every verifier checks Redis. You have now reintroduced a database lookup on every request, which is most of why JWTs existed.
3. **Use session tokens instead.** A random opaque token backed by Redis is fast, instantly revocable, and smaller. JWTs earn their keep when multiple services need to verify without a shared session store — otherwise, plain session tokens are usually the right call.

## Storage and transport

- **Authorization header, not cookies by default.** If you use cookies, set `HttpOnly`, `Secure`, and `SameSite=Strict` or `Lax`. Cookie-bound JWTs give you implicit CSRF exposure — you also need a CSRF defense.
- **LocalStorage is not a good home.** Any XSS in your app reads the token. If you must store in the browser, memory-only during session and re-fetch on reload.
- **Never log tokens.** They are bearer credentials. Any access log that captures the `Authorization` header is a credential leak.

## Quick verification workflow

When debugging a JWT in production, the workflow is:

1. Paste the token into the [Base64 decoder](/base64/) (url-safe mode) to inspect header and payload.
2. Check `alg`, `exp`, `iss`, `aud` against what your verifier expects.
3. Compute the expected signature with the [Hash tool](/hash/) if HS256 — `HMAC-SHA256(header + "." + payload, secret)`, base64url-encoded.
4. If asymmetric, use the issuer's JWKS endpoint to fetch the public key matching `kid`.

## Related reading

For the broader threat model around JSON inputs, see [JSON Security Pitfalls](/docs/json-security-pitfalls/). If you are building an API that consumes JWTs in request bodies (rare but it happens), combine this guidance with [JSON Schema Essentials](/docs/json-schema-essentials/) so your validator rejects malformed tokens before they reach your verifier.
