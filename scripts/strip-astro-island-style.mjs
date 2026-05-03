/**
 * Post-build: strip Astro's body-injected <style>${ISLAND_STYLES}</style>
 * from every dist/**\/*.html file. The same rule lives in src/styles/global.css
 * (loaded via <head>), so behavior is preserved while the served HTML validates
 * as W3C HTML5 (style elements are not allowed inside <body>).
 *
 * Astro 6.0.8 inserts the <style> via getPrescripts() in
 * runtime/server/scripts.js right before the first <astro-island>. When that
 * island lives in <body> (almost always), validator.w3.org/nu flags it as
 * "Element style not allowed as child of element body/div".
 *
 * Idempotent — running twice is a no-op.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';

const TARGET = '<style>astro-island,astro-slot,astro-static-slot{display:contents}</style>';
let patched = 0;
let skipped = 0;

for await (const file of glob('dist/**/*.html')) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes(TARGET)) {
    skipped++;
    continue;
  }
  writeFileSync(file, html.replaceAll(TARGET, ''));
  patched++;
}

console.log(`[strip-astro-island-style] patched=${patched} skipped=${skipped}`);
