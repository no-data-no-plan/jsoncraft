#!/bin/bash
# Guard against Svelte 5 runes mode bug: $props() without $state() means
# reactive variables silently stop working (UI renders via SSR but never updates).
# This happened 2026-04-06 and broke 14 components in production.

fail=0
for f in src/components/*.svelte; do
  has_props=$(grep -c '\$props()' "$f" 2>/dev/null)
  has_state=$(grep -c '\$state' "$f" 2>/dev/null)
  plain_lets=$(grep -cP '^\s+let \w+' "$f" 2>/dev/null)
  if [ "$has_props" -gt 0 ] && [ "$has_state" -eq 0 ] && [ "$plain_lets" -gt 0 ]; then
    echo "ERROR: $f uses \$props() (runes mode) but has $plain_lets plain 'let' vars without \$state()"
    echo "  → In runes mode, 'let' is NOT reactive. Use 'let x = \$state(value)' for reactive state."
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  echo ""
  echo "Fix: convert reactive 'let' vars to '\$state()' in the files above."
  exit 1
else
  echo "OK: All Svelte components use \$state() correctly."
fi
