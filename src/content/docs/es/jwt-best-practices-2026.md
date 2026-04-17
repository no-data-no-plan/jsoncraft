---
title: "Buenas prácticas JWT en 2026 — Qué usar y qué evitar"
description: "Guía moderna de JWT: EdDSA antes que RS256, pinning obligatorio del alg, estrategias de revocación y los footguns que siguen llegando a producción."
category: security
relatedToolIds: ["base64", "hash"]
publishedAt: 2026-04-17
lang: es
tags: ["jwt", "auth", "hs256", "rs256", "eddsa"]
excerpt: "Un JWT es un blob JSON firmado. Simple. Y sigue siendo la primitiva de autenticación peor usada en 2026. Estas son las buenas prácticas actuales."
faq:
  - q: "¿Sigue siendo seguro HS256 en 2026?"
    a: "HS256 es criptográficamente sólido — HMAC-SHA256 no está roto — pero es un algoritmo simétrico, lo que significa que el mismo secreto firma y verifica. Úsalo solo cuando firmar y verificar ocurren dentro de la misma frontera de confianza, como un único servicio monolítico. En el momento en que un segundo actor necesita verificar tokens, le estás dando la capacidad de forjar. Para cualquier montaje multi-servicio o client-facing, prefiere EdDSA (Ed25519) o ES256. Te dan separación de claves firmar/verificar sin el footgun de HS256."
  - q: "¿Por qué es EdDSA el default recomendado?"
    a: "EdDSA con Ed25519 es ~8x más rápido de verificar que RS256, las firmas son 64 bytes en vez de 256, y las claves son 32 bytes en vez de 256. No tiene parámetros donde pegarte un tiro — no hay negociación de curva, no hay modo de padding. Está estandarizado en RFC 8037 desde 2017 y toda librería JWT mainstream lo soporta. Las únicas razones para elegir otra cosa son HSMs de hardware que exigen ECDSA (usa ES256) o clientes OIDC legacy que piden RSA (usa RS256 a 2048+ bits)."
  - q: "¿Cómo revoco un JWT antes de que expire?"
    a: "Los JWTs son stateless por diseño — no hay revocación integrada. Tres respuestas prácticas: (1) vidas cortas de access token de 5-15 minutos más refresh tokens, así revocación = negarse a emitir un access token nuevo; este es el modelo OAuth 2.0. (2) Denylist por `jti` en Redis con TTL igual al `exp` restante; cada verificador consulta Redis, lo que reintroduce la consulta a BD que se supone que JWT evitaba. (3) Cambiar a session tokens opacos respaldados por Redis — a menudo la opción correcta cuando no necesitas verificación stateless multi-servicio."
  - q: "¿Qué es el ataque de confusión de alg y cómo lo prevengo?"
    a: "El ataque clásico es enviar un token con `alg: HS256` firmado usando la clave pública RSA del servidor como secreto HMAC. Si tu verificador lee `alg` del header y despacha según eso, HMAC-verificará el token con la pública y aceptará la forja. El fix es pinear el algoritmo esperado de forma explícita en tu llamada de verify — `jwt.verify(token, key, { algorithms: ['EdDSA'] })` — y nunca confiar en el `alg` del header. Rechaza también `alg: none` sin condiciones, aunque la mayoría de librerías modernas ya lo hagan."
  - q: "¿Debería guardar JWTs en localStorage o en cookies?"
    a: "Ninguno es ideal. LocalStorage es legible por cualquier XSS — una inyección de script y tu token se exfiltra. Las cookies evitan eso pero introducen exposición CSRF, lo que significa que también necesitas tokens CSRF o protecciones SameSite. Si tienes que usar cookies, marca `HttpOnly`, `Secure` y `SameSite=Strict` (o `Lax`). El patrón más seguro en navegador es solo en memoria durante la sesión y re-fetch al recargar — XSS no puede leerlo y no hay copia persistente que un atacante encuentre. Nunca loguees tokens: cualquier log de acceso que capture el header `Authorization` es una fuga de credenciales."
---

Los JSON Web Tokens son un blob firmado y codificado en base64url. En teoría son simples. En la práctica siguen siendo la primitiva de autenticación peor usada en producción — `alg: none` todavía llega a producción en 2026, se siguen usando JWTs como session tokens para casos que necesitan revocación, y las claves RSA se siguen generando a 1024 bits por herramientas que se niegan a morir.

Esta guía cubre qué deberías usar en 2026, qué deberías evitar, y cómo razonar sobre los tradeoffs.

## La anatomía

Un JWT son tres partes codificadas en base64url separadas por puntos: `header.payload.signature`. Fíjate: **base64url**, no base64 — `-` y `_` sustituyen a `+` y `/`, y el padding `=` al final se quita. Un JWT con una firma en base64 normal fallará la verificación en cualquier librería correcta.

```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTc2MzAwMDAwMH0.signature_bytes_base64url
```

Decodifica los dos primeros segmentos con la [herramienta Base64](/es/base64/) (acuérdate de cambiar a variante url-safe) y obtienes JSON plano:

```json
// header
{ "alg": "EdDSA", "typ": "JWT" }
// payload
{ "sub": "user_123", "exp": 1763000000, "iat": 1762996400, "iss": "https://api.example.com" }
```

La firma se calcula sobre `base64url(header) + "." + base64url(payload)` usando el algoritmo que especifique `alg`. Ese es también el mayor footgun de la spec.

## Selección de algoritmo en 2026

| Alg | Tipo | Tamaño clave | Cuándo usarlo | Notas |
| --- | --- | --- | --- | --- |
| `EdDSA` (Ed25519) | Asimétrico | 32 bytes | **Default para sistemas nuevos** | Verify más rápido, claves más pequeñas, defaults más seguros |
| `ES256` (ECDSA P-256) | Asimétrico | 32 bytes | Restricciones hardware/FIPS | Ampliamente soportado, algo más engorroso que EdDSA |
| `RS256` | Asimétrico | ≥2048 bits | Clientes legacy que exigen RSA | Firmas grandes (256 bytes a 2048 bits) |
| `HS256` | HMAC simétrico | ≥32 bytes aleatorios | Deploys de un solo servicio | Mismo secreto firma y verifica — sin separación de roles |
| `none` | — | — | **Nunca** | Footgun histórico, rechaza siempre |
| `RS1`, `HS1` | — | — | Nunca | SHA-1 está criptográficamente roto |

**EdDSA es el default correcto en 2026.** Verificar Ed25519 es ~8x más rápido que RS256, las firmas son 64 bytes en vez de 256, las claves son 32 bytes en vez de 256, y el algoritmo no tiene parámetros donde pegarte un tiro (no hay negociación de curva, no hay modo de padding). Está estandarizado en RFC 8037 desde 2017 y toda librería JWT mainstream lo soporta.

Si estás en un stack que no puede usar EdDSA (algunos proveedores JCA empresariales, HSMs de hardware antiguos), usa **ES256**. Tira de RS256 solo cuando el consumidor lo exija — por ejemplo, ciertos clientes OIDC legacy.

Usa **HS256** solo cuando firmar y verificar ocurren dentro de la misma frontera de confianza. En el momento en que un segundo actor necesita verificar tokens, le estás dando la capacidad de forjar.

## Las cuatro reglas que previenen la mayoría de CVEs de JWT

1. **Pin `alg` en tu verificador.** Pasa el algoritmo esperado de forma explícita — no dejes que la librería lea `alg` del header. El ataque clásico es enviar un token con `alg: HS256` firmado con la clave pública RSA del servidor, que el verificador acepta obedientemente si confía en el header.
2. **Rechaza `alg: none`.** La mayoría de librerías modernas lo hacen por defecto, pero si envuelves una librería o escribes la tuya, sé explícito.
3. **Valida `exp`, `nbf` e `iat`.** Los tokens expirados deben fallar la validación. Una tolerancia de 5 minutos de skew de reloj es razonable; más que eso es un code smell.
4. **Valida `iss` y `aud`.** Comprueba que el token fue emitido por quien esperas y está dirigido a tu servicio. Servicios que se saltan la validación de `aud` pueden ver tokens destinados a una API reproducidos contra otra.

```js
// Bien: algoritmo explícito, audience explícito, issuer explícito
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['EdDSA'],          // pinned
  audience: 'https://api.example.com',
  issuer:   'https://auth.example.com',
  clockTolerance: 30,              // segundos
});
```

## Claims estándar que conviene conocer

| Claim | Nombre | ¿Requerido? | Propósito |
| --- | --- | --- | --- |
| `iss` | Issuer | Recomendado | Quién acuñó el token |
| `sub` | Subject | Recomendado | A quién representa el token |
| `aud` | Audience | Recomendado | Quién debería aceptar el token |
| `exp` | Expiration | **Requerido** | Timestamp Unix tras el cual el token es inválido |
| `nbf` | Not before | Opcional | Timestamp Unix antes del cual es inválido |
| `iat` | Issued at | Recomendado | Timestamp Unix de emisión |
| `jti` | JWT ID | Opcional | ID único, usado para denylist/revocación |

Los claims privados van en el mismo objeto. Mantenlos pequeños — cada byte viaja en cada request. Si necesitas más de ~500 bytes de estado, estás abusando de JWT.

## El problema de la revocación

Los JWTs son, por diseño, stateless. Una firma válida y un `exp` vivo bastan para ser aceptados. Esto es rápido, pero implica que **no hay forma integrada de revocar un token antes de que expire**. Si un usuario cierra sesión, si detectas robo de credenciales, si cambian los permisos — los tokens antiguos siguen siendo válidos hasta que expiren.

Hay tres respuestas prácticas:

1. **Vidas cortas + refresh tokens.** Los access tokens viven 5-15 minutos. Revocación = "niégate a emitir un access token nuevo desde este refresh token." Este es el modelo OAuth 2.0.
2. **Denylist por `jti`.** En logout o revocación, mete el `jti` en Redis con TTL igual al tiempo restante de `exp`. Cada verificador consulta Redis. Acabas de reintroducir una consulta a base de datos en cada request, que era gran parte de por qué existían los JWTs.
3. **Usa session tokens.** Un token opaco aleatorio respaldado por Redis es rápido, revocable al instante y más pequeño. Los JWTs se ganan el sueldo cuando múltiples servicios necesitan verificar sin un session store compartido — si no, los session tokens simples suelen ser la opción correcta.

## Almacenamiento y transporte

- **Header Authorization, no cookies por defecto.** Si usas cookies, marca `HttpOnly`, `Secure` y `SameSite=Strict` o `Lax`. Los JWTs en cookie te dan exposición implícita a CSRF — también necesitas una defensa CSRF.
- **LocalStorage no es buen hogar.** Cualquier XSS en tu app lee el token. Si tienes que guardarlo en el navegador, solo en memoria durante la sesión y re-fetch al recargar.
- **Nunca loguees tokens.** Son credenciales bearer. Cualquier log de acceso que capture el header `Authorization` es una fuga de credenciales.

## Workflow de verificación rápida

Cuando debugueas un JWT en producción, el workflow es:

1. Pega el token en el [decoder Base64](/es/base64/) (modo url-safe) para inspeccionar header y payload.
2. Revisa `alg`, `exp`, `iss`, `aud` contra lo que tu verificador espera.
3. Calcula la firma esperada con la [herramienta Hash](/es/hash/) si es HS256 — `HMAC-SHA256(header + "." + payload, secret)`, base64url-encoded.
4. Si es asimétrico, usa el endpoint JWKS del issuer para obtener la clave pública que coincida con `kid`.

## Lectura relacionada

Para el modelo de amenazas más amplio alrededor de inputs JSON, lee [Pitfalls de seguridad en JSON](/es/docs/json-security-pitfalls/). Si estás construyendo una API que consume JWTs en bodies de request (raro pero pasa), combina esta guía con [Fundamentos de JSON Schema](/es/docs/json-schema-essentials/) para que tu validador rechace tokens malformados antes de que lleguen al verificador.
