<script lang="ts">
  /**
   * UndoToast — 5-second window to undo a destructive action.
   *
   * Built for the Nielsen audit 2026-04-30 (JC F2): Clear destroys editor
   * content with no confirmation and Ctrl+Z does not restore. JSON tools
   * routinely paste production payloads / customer fixtures / signed JWT
   * dumps — accidental Clear is catastrophic.
   *
   * Pattern (mirrors CompoundVision's UndoToast):
   *   1. Component owner snapshots the state being destroyed
   *   2. Toast appears with "Undo" button and 5s countdown
   *   3. If user clicks Undo → onUndo() restores, toast hides
   *   4. If 5s elapses → toast dismisses, deletion permanent
   *   5. Second Clear within window: last-write-wins (snapshot replaced)
   *
   * Editorial-minimal styling matches JC's existing aesthetic; no icons.
   */
  import { onMount } from 'svelte';
  import { t } from '../i18n/common';
  import type { Lang } from '../i18n/index';

  type Props = {
    visible: boolean;
    message: string;
    onUndo: () => void;
    onDismiss: () => void;
    timeoutMs?: number;
    lang?: Lang;
    /** Identity token (typically the undoSnapshot reference). Bind a fresh
     *  reference on each new Clear so the timer effect re-runs and resets
     *  the 5s window — without this, a Clear→Undo→Clear within 5s would
     *  inherit the first delete's remaining time. Round-2 review fix
     *  2026-04-30. */
    key?: unknown;
  };

  let { visible, message, onUndo, onDismiss, timeoutMs = 5000, lang = 'en' as Lang, key }: Props = $props();

  let timerId: ReturnType<typeof setTimeout> | null = null;
  let progressStart = $state(0);
  let now = $state(0);
  let rafId: number | null = null;

  const progress = $derived.by(() => {
    if (!visible || progressStart === 0) return 1;
    const elapsed = now - progressStart;
    return Math.max(0, 1 - elapsed / timeoutMs);
  });

  function tick() {
    now = performance.now();
    if (visible) rafId = requestAnimationFrame(tick);
  }

  function startTimer() {
    clearTimer();
    progressStart = performance.now();
    now = progressStart;
    rafId = requestAnimationFrame(tick);
    timerId = setTimeout(() => onDismiss(), timeoutMs);
  }

  function clearTimer() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function handleUndo() {
    clearTimer();
    onUndo();
  }

  function handleDismiss() {
    clearTimer();
    onDismiss();
  }

  $effect(() => {
    void key; // dependency tracker — see Props comment
    if (visible && message) startTimer();
    else clearTimer();
    return clearTimer;
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!visible) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      handleDismiss();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if visible}
  <div
    class="undo-toast"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div class="undo-toast__inner">
      <span class="undo-toast__message">{message}</span>
      <button
        type="button"
        class="undo-toast__undo"
        onclick={handleUndo}
        aria-label={t(lang, 'undo')}
      >{t(lang, 'undo')}</button>
      <button
        type="button"
        class="undo-toast__close"
        onclick={handleDismiss}
        aria-label={t(lang, 'dismiss')}
      >×</button>
    </div>
    <div
      class="undo-toast__progress"
      style="transform: scaleX({progress});"
      aria-hidden="true"
    ></div>
  </div>
{/if}

<style>
  .undo-toast {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    min-width: min(360px, calc(100vw - 2rem));
    max-width: calc(100vw - 2rem);
    background: var(--color-bg-secondary, #1a1a1a);
    border: 1px solid var(--color-border, #2a2a2a);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: undoToastSlideIn 180ms ease-out;
    font-family: inherit;
  }

  @keyframes undoToastSlideIn {
    from { transform: translate(-50%, 8px); opacity: 0; }
    to   { transform: translate(-50%, 0);   opacity: 1; }
  }

  .undo-toast__inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
  }

  .undo-toast__message {
    flex: 1 1 auto;
    font-size: 13px;
    color: var(--color-text-primary, #e8e8e8);
  }

  .undo-toast__undo {
    flex: 0 0 auto;
    background: var(--color-accent, #3ecf8e);
    color: var(--color-bg-primary, #0a0a0a);
    border: none;
    border-radius: 4px;
    padding: 0.3125rem 0.75rem;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: filter 120ms;
  }

  .undo-toast__undo:hover,
  .undo-toast__undo:focus-visible {
    filter: brightness(1.1);
    outline: 2px solid var(--color-accent, #3ecf8e);
    outline-offset: 2px;
  }

  .undo-toast__close {
    flex: 0 0 auto;
    background: transparent;
    color: var(--color-text-secondary, #888);
    border: 1px solid var(--color-border, #2a2a2a);
    border-radius: 4px;
    width: 24px;
    height: 24px;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .undo-toast__close:hover,
  .undo-toast__close:focus-visible {
    color: var(--color-text-primary, #e8e8e8);
    border-color: var(--color-text-secondary, #888);
    outline: 2px solid var(--color-accent, #3ecf8e);
    outline-offset: 2px;
  }

  .undo-toast__progress {
    height: 2px;
    background: var(--color-accent, #3ecf8e);
    transform-origin: left center;
    transition: transform 80ms linear;
  }

  @media (prefers-reduced-motion: reduce) {
    .undo-toast { animation: none; }
    .undo-toast__progress { transition: none; }
  }
</style>
