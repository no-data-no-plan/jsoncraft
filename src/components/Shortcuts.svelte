<script lang="ts">
  /**
   * Shortcuts.svelte — keyboard-shortcut help modal.
   *
   * Nielsen audit Phase 6 (JC F4): JSONCraft has zero discoverable
   * shortcuts even though Ctrl+Enter formats and CodeMirror's defaultKeymap
   * binds Tab/Shift+Tab/Ctrl+Z/Ctrl+Y inside the editor. This modal lists
   * what's available and is triggered by pressing `?` anywhere outside a
   * form field — same convention as MDN, GitHub, Linear.
   *
   * Owns its own `?` keydown listener at the global window level. Skips
   * activation when focus is inside an input/textarea/contenteditable so
   * the user can still type a literal "?" into JSON.
   *
   * A11y:
   *   - role="dialog" + aria-modal + aria-labelledby
   *   - Focus moves to the close button on open, returns to the opener on close
   *   - Tab is trapped inside the modal while open
   *   - Escape closes
   *   - Click on backdrop closes
   */
  import { onMount } from "svelte";
  import { t } from "../i18n/common";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang }: { lang?: Lang } = $props();

  let open = $state(false);
  let dialog = $state<HTMLDivElement | null>(null);
  let closeBtn = $state<HTMLButtonElement | null>(null);
  let lastFocused: HTMLElement | null = null;

  // Detect platform once for the right modifier glyph in <kbd>.
  // Prefer userAgentData (Chromium 90+); fall back to platform for
  // Safari/Firefox.
  const isMac = (() => {
    if (typeof navigator === "undefined") return false;
    const uad = (navigator as any).userAgentData;
    if (uad?.platform) return uad.platform === "macOS";
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  })();
  const modKey = isMac ? "⌘" : "Ctrl";

  function show() {
    if (open) return;
    lastFocused = document.activeElement as HTMLElement | null;
    open = true;
    // Focus the close button on next paint so screen readers announce
    // the dialog instead of the previously-focused element.
    setTimeout(() => closeBtn?.focus(), 0);
  }

  function close() {
    open = false;
    lastFocused?.focus();
    lastFocused = null;
  }

  function onWindowKeyDown(e: KeyboardEvent) {
    // ? trigger — ignore when typing into form fields or contenteditable
    if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const target = e.target;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      show();
      return;
    }
    if (!open) return;
    // Escape closes the modal.
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    // Trap focus inside the dialog while open.
    if (e.key === "Tab" && dialog) {
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  onMount(() => {
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });

  type Row = { label: string; chord: string[] };
  type Cat = { title: string; rows: Row[] };

  const cats = $derived<Cat[]>([
    {
      title: t(lang, "shortcutsCatActions"),
      rows: [
        { label: t(lang, "shortcutFormat"), chord: [modKey, "Enter"] },
      ],
    },
    {
      title: t(lang, "shortcutsCatEditor"),
      rows: [
        { label: t(lang, "shortcutEditorUndo"), chord: [modKey, "Z"] },
        { label: t(lang, "shortcutEditorRedo"), chord: [modKey, "Shift", "Z"] },
        { label: t(lang, "shortcutEditorIndent"), chord: ["Tab"] },
        { label: t(lang, "shortcutEditorOutdent"), chord: ["Shift", "Tab"] },
        { label: t(lang, "shortcutEditorEscape"), chord: ["Esc", "Tab"] },
      ],
    },
    {
      title: t(lang, "shortcutsCatHelp"),
      rows: [
        { label: t(lang, "shortcutOpenShortcuts"), chord: ["?"] },
      ],
    },
  ]);
</script>

{#if open}
  <div
    class="shortcuts-backdrop"
    onclick={close}
    role="presentation"
  ></div>
  <div
    class="shortcuts-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shortcuts-title"
    bind:this={dialog}
  >
    <header class="shortcuts-header">
      <h2 id="shortcuts-title" class="shortcuts-title">{t(lang, "keyboardShortcuts")}</h2>
      <button
        type="button"
        class="shortcuts-close"
        aria-label={t(lang, "closeDialog")}
        bind:this={closeBtn}
        onclick={close}
      >×</button>
    </header>
    <div class="shortcuts-body">
      {#each cats as cat}
        <section class="shortcuts-cat">
          <h3 class="shortcuts-cat-title">{cat.title}</h3>
          <ul class="shortcuts-list">
            {#each cat.rows as row}
              <li class="shortcuts-row">
                <span class="shortcuts-label">{row.label}</span>
                <span class="shortcuts-chord">
                  {#each row.chord as key, i}
                    {#if i > 0}<span class="shortcuts-sep" aria-hidden="true">+</span>{/if}
                    <kbd class="shortcuts-kbd">{key}</kbd>
                  {/each}
                </span>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
      <p class="shortcuts-hint">{t(lang, "shortcutsHint")}</p>
    </div>
  </div>
{/if}

<style>
  .shortcuts-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 80;
    animation: shortcuts-fade 120ms ease-out;
  }

  .shortcuts-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 81;
    width: min(540px, calc(100vw - 2rem));
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    background: var(--color-bg-secondary, #1a1a1a);
    color: var(--color-text-primary, #e8e8e8);
    border: 1px solid var(--color-border, #2a2a2a);
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: shortcuts-pop 140ms ease-out;
    font-family: inherit;
  }

  .shortcuts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--color-border, #2a2a2a);
  }

  .shortcuts-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary, #e8e8e8);
  }

  .shortcuts-close {
    background: transparent;
    border: 1px solid var(--color-border, #2a2a2a);
    border-radius: 4px;
    width: 28px;
    height: 28px;
    font-size: 16px;
    line-height: 1;
    color: var(--color-text-secondary, #888);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .shortcuts-close:hover,
  .shortcuts-close:focus-visible {
    color: var(--color-text-primary, #e8e8e8);
    border-color: var(--color-text-secondary, #888);
    outline: 2px solid var(--color-accent, #3ecf8e);
    outline-offset: 2px;
  }

  .shortcuts-body {
    padding: 6px 18px 18px;
  }

  .shortcuts-cat {
    margin-top: 14px;
  }

  .shortcuts-cat-title {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-secondary, #888);
    margin: 0 0 8px;
  }

  .shortcuts-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .shortcuts-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 0;
    border-bottom: 1px solid var(--color-border, #2a2a2a);
    font-size: 13px;
  }

  .shortcuts-row:last-child {
    border-bottom: none;
  }

  .shortcuts-label {
    color: var(--color-text-primary, #e8e8e8);
  }

  .shortcuts-chord {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .shortcuts-sep {
    color: var(--color-text-secondary, #888);
    font-size: 11px;
  }

  .shortcuts-kbd {
    display: inline-block;
    padding: 2px 7px;
    background: var(--color-bg-tertiary, #232323);
    border: 1px solid var(--color-border, #2a2a2a);
    border-bottom-width: 2px;
    border-radius: 4px;
    font-family: ui-monospace, "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    font-size: 11px;
    line-height: 1;
    color: var(--color-text-primary, #e8e8e8);
    min-width: 22px;
    text-align: center;
  }

  .shortcuts-hint {
    margin: 18px 0 0;
    padding-top: 12px;
    border-top: 1px solid var(--color-border, #2a2a2a);
    font-size: 11px;
    color: var(--color-text-secondary, #888);
    line-height: 1.55;
  }

  @keyframes shortcuts-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shortcuts-pop {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .shortcuts-backdrop, .shortcuts-dialog { animation: none; }
  }
</style>
