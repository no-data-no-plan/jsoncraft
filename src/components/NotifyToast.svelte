<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { t } from "../i18n/common";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  type ToastKind = "success" | "info" | "error";
  type ToastEvent = CustomEvent<{
    message: string;
    kind?: ToastKind;
    id?: string;
    durationMs?: number;
  }>;

  interface ActiveToast {
    id: string;
    message: string;
    kind: ToastKind;
    durationMs: number;
    /** Immutable creation timestamp. Used by the dedupe window so that
     *  rapid-fire identical events don't perpetually extend the same
     *  toast — the window measures from first creation, not from last
     *  timer reset. */
    createdAt: number;
    /** Mutable timer-start timestamp. Reset by scheduleDismiss every time
     *  the toast's expiry is rescheduled (pause→resume, refresh-by-id). */
    startedAt: number;
    pausedRemaining: number | null;
  }

  const MAX_STACK = 3;
  const DEFAULT_SUCCESS_MS = 5000;
  const DEFAULT_ERROR_MS = 7000;
  const DEDUPE_WINDOW_MS = 750;
  const RESUME_DEBOUNCE_MS = 100;

  let toasts = $state<ActiveToast[]>([]);
  let paused = $state(false);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let resumeHandle: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(id: string) {
    const handle = timers.get(id);
    if (handle) {
      clearTimeout(handle);
      timers.delete(id);
    }
  }

  function dismiss(id: string) {
    clearTimer(id);
    toasts = toasts.filter((tt) => tt.id !== id);
  }

  function scheduleDismiss(toast: ActiveToast, ms: number) {
    clearTimer(toast.id);
    toast.startedAt = performance.now();
    const handle = setTimeout(() => dismiss(toast.id), ms);
    timers.set(toast.id, handle);
  }

  function handle(e: Event) {
    const ev = e as ToastEvent;
    const { message, kind = "success", id, durationMs } = ev.detail;
    if (!message) return;
    const defaultMs = kind === "error" ? DEFAULT_ERROR_MS : DEFAULT_SUCCESS_MS;
    const ms = durationMs ?? defaultMs;

    if (id) {
      const existing = toasts.find((tt) => tt.id === id);
      if (existing) {
        existing.message = message;
        existing.kind = kind;
        existing.durationMs = ms;
        existing.pausedRemaining = null;
        if (!paused && ms > 0) scheduleDismiss(existing, ms);
        return;
      }
    }

    const now = performance.now();
    const dup = toasts.find(
      (tt) => tt.message === message && tt.kind === kind && now - tt.createdAt < DEDUPE_WINDOW_MS,
    );
    if (dup) {
      if (!paused && ms > 0) scheduleDismiss(dup, ms);
      return;
    }

    const newToast: ActiveToast = {
      id: id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      kind,
      durationMs: ms,
      createdAt: now,
      startedAt: now,
      pausedRemaining: null,
    };

    const next = [...toasts, newToast];
    while (next.length > MAX_STACK) {
      const evicted = next.shift();
      if (evicted) clearTimer(evicted.id);
    }
    toasts = next;

    if (!paused && ms > 0) scheduleDismiss(newToast, ms);
  }

  function pauseAll() {
    if (resumeHandle) {
      clearTimeout(resumeHandle);
      resumeHandle = null;
    }
    if (paused) return;
    paused = true;
    const now = performance.now();
    for (const tt of toasts) {
      const elapsed = now - tt.startedAt;
      tt.pausedRemaining = Math.max(0, tt.durationMs - elapsed);
      clearTimer(tt.id);
    }
  }

  function scheduleResume() {
    if (resumeHandle) clearTimeout(resumeHandle);
    resumeHandle = setTimeout(() => {
      resumeHandle = null;
      if (!paused) return;
      paused = false;
      for (const tt of toasts) {
        const remaining = tt.pausedRemaining ?? tt.durationMs;
        tt.pausedRemaining = null;
        if (remaining > 0) scheduleDismiss(tt, remaining);
      }
    }, RESUME_DEBOUNCE_MS);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== "Escape" || toasts.length === 0) return;
    const target = e.target;
    if (target instanceof Element && target.closest("[data-notify-toast-root]")) {
      e.preventDefault();
      const latest = toasts[toasts.length - 1];
      if (latest) dismiss(latest.id);
    }
  }

  onMount(() => {
    window.addEventListener("jc-toast", handle as EventListener);
    window.addEventListener("keydown", handleKeydown);
  });
  onDestroy(() => {
    window.removeEventListener("jc-toast", handle as EventListener);
    window.removeEventListener("keydown", handleKeydown);
    if (resumeHandle) clearTimeout(resumeHandle);
    for (const id of Array.from(timers.keys())) clearTimer(id);
  });

  const politeToasts = $derived(toasts.filter((tt) => tt.kind !== "error"));
  const assertiveToasts = $derived(toasts.filter((tt) => tt.kind === "error"));
</script>

<!-- Single fixed wrapper holds both live regions stacked column-reverse so
     assertive (errors) renders ABOVE polite (success/info) and the visual
     gap matches the actual stack height — no magic offset needed.
     Each inner region keeps its own role + aria-live so SRs treat them
     correctly. WAI-ARIA APG Alert pattern. -->
<div class="toast-stack">
  <div
    class="toast-region"
    role="status"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions"
  >
    {#each politeToasts as toast (toast.id)}
      <div
        class="toast toast-{toast.kind}"
        data-notify-toast-root
        onmouseenter={pauseAll}
        onmouseleave={scheduleResume}
        onfocusin={pauseAll}
        onfocusout={scheduleResume}
      >
        <span class="toast-msg">{toast.message}</span>
        <button
          type="button"
          class="toast-close"
          onclick={() => dismiss(toast.id)}
          aria-label={t(lang, "dismiss")}
        >×</button>
      </div>
    {/each}
  </div>

  <div
    class="toast-region"
    role="alert"
    aria-live="assertive"
    aria-atomic="false"
    aria-relevant="additions"
  >
    {#each assertiveToasts as toast (toast.id)}
      <div
        class="toast toast-error"
        data-notify-toast-root
        onmouseenter={pauseAll}
        onmouseleave={scheduleResume}
        onfocusin={pauseAll}
        onfocusout={scheduleResume}
      >
        <span class="toast-msg">{toast.message}</span>
        <button
          type="button"
          class="toast-close"
          onclick={() => dismiss(toast.id)}
          aria-label={t(lang, "dismiss")}
        >×</button>
      </div>
    {/each}
  </div>
</div>

<style>
  .toast-stack {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: var(--z-toast, 90);
    pointer-events: none;
    display: flex;
    /* Assertive declared second in DOM → renders ABOVE polite in
       column-reverse, matching "errors visually highest" intent. */
    flex-direction: column-reverse;
    gap: 0.5rem;
    max-width: min(420px, calc(100vw - 2.5rem));
  }
  .toast-region {
    display: flex;
    /* Newest toast (last in array) renders at top of its region. */
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  .toast {
    pointer-events: auto;
    background: var(--color-bg-secondary, #1a1a1d);
    color: var(--color-text-primary, #e8e8e8);
    border: 1px solid var(--color-border, #2a2a2d);
    border-left: 3px solid var(--color-accent-fg, var(--color-accent, #38bdf8));
    border-radius: 6px;
    padding: 0.55rem 0.25rem 0.55rem 1rem;
    font-size: 0.875rem;
    line-height: 1.4;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    /* Opacity-only fade — translate is suppressed for vestibular safety
       (WCAG 2.3.3 Animation from Interactions). Global reduced-motion
       contract collapses this to instant. */
    animation: notify-toast-in 0.18s ease-out;
  }
  .toast-success {
    border-left-color: var(--color-success, #4ade80);
  }
  .toast-error {
    border-left-color: var(--color-error, #f87171);
  }
  .toast-info {
    border-left-color: var(--color-accent-fg, var(--color-accent, #38bdf8));
  }
  .toast-msg {
    flex: 1 1 auto;
    overflow-wrap: anywhere;
  }
  .toast-close {
    flex: 0 0 auto;
    background: transparent;
    border: 0;
    color: var(--color-text-secondary, #888);
    cursor: pointer;
    /* 44×44 hit area (WCAG 2.5.5/2.5.8) with compact visual mark */
    width: 44px;
    height: 44px;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .toast-close:hover,
  .toast-close:focus-visible {
    color: var(--color-text-primary, #e8e8e8);
    outline: 2px solid var(--color-accent-fg, var(--color-accent, #38bdf8));
    outline-offset: -2px;
  }
  @keyframes notify-toast-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast { animation: none; }
  }
</style>
