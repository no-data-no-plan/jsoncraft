<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  type ToastEvent = CustomEvent<{ message: string; kind: "success" | "info" }>;

  let visible = $state(false);
  let message = $state("");
  let timer: ReturnType<typeof setTimeout> | null = null;

  function handle(e: Event) {
    const ev = e as ToastEvent;
    message = ev.detail.message;
    visible = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { visible = false; }, 1800);
  }

  onMount(() => {
    window.addEventListener("jc-toast", handle as EventListener);
  });
  onDestroy(() => {
    window.removeEventListener("jc-toast", handle as EventListener);
    if (timer) clearTimeout(timer);
  });
</script>

<div class="toast-region" role="status" aria-live="polite" aria-atomic="true">
  {#if visible}
    <div class="toast">{message}</div>
  {/if}
</div>

<style>
  .toast-region {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 950;
    pointer-events: none;
  }
  .toast {
    background: var(--color-bg-secondary, #1a1a1d);
    color: var(--color-text-primary, #e8e8e8);
    border: 1px solid var(--color-border, #2a2a2d);
    border-left: 3px solid var(--color-accent, #c8f04a);
    padding: 0.55rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    animation: toast-in 0.18s ease-out;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast { animation: none; }
  }
</style>
