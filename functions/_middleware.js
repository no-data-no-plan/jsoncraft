// AdSense/Google image hosts — needed for ad creatives to render under tightened img-src
const AD_IMG = "https://*.googlesyndication.com https://*.doubleclick.net https://*.googleusercontent.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.adtrafficquality.google";

// Shared script allowlist (same set used by enforcing CSP)
const SCRIPT_ALLOW = "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://adservice.google.es https://fundingchoicesmessages.google.com https://*.adtrafficquality.google https://static.cloudflareinsights.com";

// ENFORCING CSP (strict) — no 'unsafe-inline'. Requires per-request nonce on every
// <script> tag, which HTMLRewriter stamps below. Phase 1 Report-Only probe ran clean
// on 2026-04-05 across jsoncraft routes, so flipping to enforcing.
function buildCSP(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${SCRIPT_ALLOW}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: ${AD_IMG}`,
    "connect-src 'self' https://pagead2.googlesyndication.com https://formspree.io https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

// Static fallback CSP (for non-HTML responses) — no nonce needed, just the domain
// allowlist. Assets themselves don't execute scripts so unsafe-inline is irrelevant here.
const CSP_STATIC = [
  "default-src 'self'",
  `script-src 'self' ${SCRIPT_ALLOW}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: ${AD_IMG}`,
  "connect-src 'self' https://pagead2.googlesyndication.com https://formspree.io https://*.google.com https://*.adtrafficquality.google https://*.cloudflareinsights.com",
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://www.google.com https://*.adtrafficquality.google",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'ambient-light-sensor=()',
  'autoplay=()',
  'battery=()',
  'camera=()',
  'display-capture=()',
  'document-domain=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'gamepad=()',
  'geolocation=()',
  'gyroscope=()',
  'hid=()',
  'idle-detection=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'serial=()',
  'sync-xhr=(self)',
  'usb=()',
  'web-share=()',
  'xr-spatial-tracking=()',
].join(', ');

// HTMLRewriter handler: stamp a nonce on every inline/external <script> tag it sees.
// We only apply this to text/html responses — assets (JS, CSS, images) pass through untouched.
class NonceInjector {
  constructor(nonce) { this.nonce = nonce; }
  element(element) { element.setAttribute('nonce', this.nonce); }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname.endsWith('.pages.dev')) {
    return new Response(null, {
      status: 301,
      headers: { 'Location': 'https://jsoncraft.dev' + url.pathname + url.search }
    });
  }

  let response = await context.next();

  // Generate a per-request nonce and rewrite HTML to inject it into <script> tags.
  // Only text/html responses are touched; JS/CSS/image assets stream through as-is.
  const contentType = response.headers.get('content-type') || '';
  const isHtml = contentType.includes('text/html');
  const nonce = crypto.randomUUID().replace(/-/g, '');

  if (isHtml) {
    response = new HTMLRewriter()
      .on('script', new NonceInjector(nonce))
      .transform(response);
  }

  const newHeaders = new Headers(response.headers);
  newHeaders.delete('Access-Control-Allow-Origin');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', PERMISSIONS_POLICY);
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // HTML responses get the strict nonce-based CSP matching what HTMLRewriter stamped.
  // Non-HTML (JS/CSS/images/etc.) get the static policy without nonce.
  newHeaders.set('Content-Security-Policy', isHtml ? buildCSP(nonce) : CSP_STATIC);
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  newHeaders.set('Cross-Origin-Resource-Policy', 'same-site');
  newHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
