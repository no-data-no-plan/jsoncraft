/**
 * Fire a single `tool_complete` gtag event per session per tool, debounced.
 *
 * Designed for reactive editors ($state / $effect with debounced input) —
 * fires after `debounceMs` of input stability, meaning the user stopped
 * editing and is now consuming the result. Marco's master-plan P1.1 / Sprint 3
 * instrumentation pattern, ported from CV's identical util for consistency.
 *
 * GA4 scorecard signal S11 ("tool_complete event tracked per tool"). Once per
 * page load is sufficient — not once per keystroke.
 *
 * Usage in a Svelte 5 component:
 *   import { useToolComplete } from '../lib/tool-complete.svelte';
 *   const fireToolComplete = useToolComplete('formatter');
 *   $effect(() => {
 *     // Reference reactive inputs inside the effect so Svelte tracks them.
 *     // Gate with a success condition to avoid firing on invalid input.
 *     input; status;
 *     if (status === 'valid') fireToolComplete();
 *   });
 */
export function useToolComplete(toolId: string, debounceMs = 1500) {
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function fire() {
    if (fired || typeof window === 'undefined') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (fired) return;
      fired = true;
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.('event', 'tool_complete', {
        tool_id: toolId,
        outcome: 'success',
      });
    }, debounceMs);
  };
}
