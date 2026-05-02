<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import UndoToast from "./UndoToast.svelte";
  import { diffJson } from "diff";
  import { friendlyError, debounce, stripBom } from "../lib/fileutils";
  import { shouldUseWorker, diffInWorker } from "../lib/worker-api";
  import { alignDiff, type AlignSummary } from "../lib/diff-align";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let left = $state("");
  let right = $state("");
  let diffResult = $state<Array<{ added?: boolean; removed?: boolean; value: string }>>([]);
  let error = $state("");
  let hasDifferences = $state(false);
  // Side-by-side is the new default — line numbers + paired changes are
  // far easier to read for JSON. Users who liked the inline-coloured
  // unified output can flip the toolbar toggle.
  let viewMode = $state<"side" | "unified">("side");

  // Alignment runs cheap and synchronously, so derive it from the existing
  // diff parts rather than re-running the worker.
  const aligned = $derived<AlignSummary>(alignDiff(diffResult));

  let processing = $state(false);

  async function compare(opts: { manual?: boolean } = {}) {
    error = "";
    hasDifferences = false;
    if (!left.trim() && !right.trim()) {
      diffResult = [];
      if (opts.manual) error = tt("diff", lang, "enterBoth");
      return;
    }
    if (!left.trim() || !right.trim()) {
      diffResult = [];
      if (opts.manual) {
        error = !left.trim() ? tt("diff", lang, "enterLeft") : tt("diff", lang, "enterRight");
      }
      return;
    }

    if (shouldUseWorker(left) || shouldUseWorker(right)) {
      processing = true;
      try {
        const result = await diffInWorker(left, right);
        diffResult = JSON.parse(result.output);
        hasDifferences = diffResult.some((part) => part.added || part.removed);
      } catch (e: any) {
        error = friendlyError(e.message);
        diffResult = [];
      } finally {
        processing = false;
      }
      return;
    }

    let parsedLeft: unknown;
    let parsedRight: unknown;
    try {
      parsedLeft = JSON.parse(stripBom(left));
    } catch (e: any) {
      error = tt("diff", lang, "leftOriginal") + ": " + friendlyError(e.message);
      diffResult = [];
      return;
    }
    try {
      parsedRight = JSON.parse(stripBom(right));
    } catch (e: any) {
      error = tt("diff", lang, "rightModified") + ": " + friendlyError(e.message);
      diffResult = [];
      return;
    }

    diffResult = diffJson(parsedLeft as object, parsedRight as object);
    hasDifferences = diffResult.some((part) => part.added || part.removed);
  }

  const debouncedCompare = debounce(() => compare(), 300);

  function handleLeft(value: string) {
    left = value;
    debouncedCompare();
  }

  function handleRight(value: string) {
    right = value;
    debouncedCompare();
  }

  function loadSample() {
    left = JSON.stringify(
      { name: "JSONCraft", version: "1.0.0", features: ["format", "validate"] },
      null,
      2
    );
    right = JSON.stringify(
      { name: "JSONCraft", version: "2.0.0", features: ["format", "validate", "diff", "convert"] },
      null,
      2
    );
    compare();
  }

  // Undo-toast state for destructive Clear (Nielsen audit 2026-04-30, F2).
  let undoSnapshot = $state<{ left: string; right: string } | null>(null);
  let toastVisible = $state(false);

  function clear() {
    if (!left && !right) {
      left = "";
      right = "";
      diffResult = [];
      error = "";
      hasDifferences = false;
      return;
    }
    undoSnapshot = { left, right };
    left = "";
    right = "";
    diffResult = [];
    error = "";
    hasDifferences = false;
    toastVisible = true;
  }

  function undoClear() {
    if (!undoSnapshot) return;
    left = undoSnapshot.left;
    right = undoSnapshot.right;
    undoSnapshot = null;
    toastVisible = false;
    // Use the debounced variant (Nielsen audit code-review 2026-04-30): if
    // the user starts typing within 300ms of clicking Undo, the in-flight
    // worker compare() from this restore would race and overwrite their
    // new input with stale snapshot-based diff data.
    debouncedCompare();
  }

  function dismissUndo() {
    undoSnapshot = null;
    toastVisible = false;
  }

  function swap() {
    const tmp = left;
    left = right;
    right = tmp;
    compare();
  }
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div
    class="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <button
      onclick={() => compare({ manual: true })}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {t(lang, "compare")}
    </button>
    <button
      onclick={swap}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "swap")}
    </button>
    <button
      onclick={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "clear")}
    </button>
    <button
      onclick={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    <div class="ml-auto inline-flex rounded overflow-hidden border border-[var(--color-border)]" role="group" aria-label="View mode">
      <button
        type="button"
        onclick={() => (viewMode = "side")}
        aria-pressed={viewMode === "side"}
        class="px-2.5 py-1 text-xs {viewMode === 'side' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}"
      >{tt("diff", lang, "sideBySide")}</button>
      <button
        type="button"
        onclick={() => (viewMode = "unified")}
        aria-pressed={viewMode === "unified"}
        class="px-2.5 py-1 text-xs {viewMode === 'unified' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}"
      >{tt("diff", lang, "unified")}</button>
    </div>
    <span aria-live="polite">
    {#if processing}
      <span class="text-xs text-[var(--color-accent-fg)] ml-auto animate-pulse">{t(lang, "comparing")}</span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
    </span>
  </div>

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Left editor -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{tt("diff", lang, "leftOriginal")}</div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={left} lang="json" placeholder={tt("diff", lang, "leftPlaceholder")} onchange={handleLeft} />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <!-- Right editor -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{tt("diff", lang, "rightModified")}</div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={right} lang="json" placeholder={tt("diff", lang, "rightPlaceholder")} onchange={handleRight} />
      </div>
    </div>
  </div>

  <!-- Diff output -->
  {#if diffResult.length > 0}
    <div
      class="border-t border-[var(--color-border)] max-h-80 overflow-auto bg-[var(--color-bg-secondary)]"
      aria-live="polite"
      aria-label={tt("diff", lang, "aria_diffOutput")}
    >
      <div class="text-xs text-[var(--color-text-muted)] px-4 py-1 border-b border-[var(--color-border)] flex items-center gap-3 flex-wrap">
        {#if hasDifferences}
          <span>{tt("diff", lang, "differences")}</span>
          {#if aligned.added > 0}
            <span class="text-[var(--color-success)]">+{aligned.added} {tt("diff", lang, "summaryAdded")}</span>
          {/if}
          {#if aligned.removed > 0}
            <span class="text-[var(--color-error)]">−{aligned.removed} {tt("diff", lang, "summaryRemoved")}</span>
          {/if}
          {#if aligned.changed > 0}
            <span class="text-[var(--color-warning)]">±{aligned.changed} {tt("diff", lang, "summaryChanged")}</span>
          {/if}
        {:else}
          <span class="text-[var(--color-success)]">{tt("diff", lang, "noDifferences")}</span>
        {/if}
      </div>

      {#if hasDifferences}
        {#if viewMode === "side"}
          <!-- Side-by-side: paired left/right rows with per-side line numbers.
               Background tints: removed = red, added = green, changed = both
               with their respective tint, placeholder = muted strip so the
               eye can still locate the row in the column. -->
          <div class="text-sm font-mono">
            {#each aligned.rows as row}
              <div class="grid grid-cols-2 border-b border-[var(--color-border)]/40">
                <div class="flex border-r border-[var(--color-border)]/40 {row.left.kind === 'removed' ? 'bg-red-900/30' : row.left.kind === 'placeholder' ? 'bg-[var(--color-bg-tertiary)]/40' : ''}">
                  <span class="w-10 px-2 text-right text-xs text-[var(--color-text-muted)] select-none flex-shrink-0">{row.left.lineNumber ?? ''}</span>
                  <span class="px-2 whitespace-pre overflow-x-auto flex-1 {row.left.kind === 'removed' ? 'text-[var(--color-error)]' : row.left.kind === 'placeholder' ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}">{row.left.text}</span>
                </div>
                <div class="flex {row.right.kind === 'added' ? 'bg-green-900/30' : row.right.kind === 'placeholder' ? 'bg-[var(--color-bg-tertiary)]/40' : ''}">
                  <span class="w-10 px-2 text-right text-xs text-[var(--color-text-muted)] select-none flex-shrink-0">{row.right.lineNumber ?? ''}</span>
                  <span class="px-2 whitespace-pre overflow-x-auto flex-1 {row.right.kind === 'added' ? 'text-[var(--color-success)]' : row.right.kind === 'placeholder' ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}">{row.right.text}</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Unified: the original inline output, kept for users who prefer
               compact view-source-style coloured spans. -->
          <pre class="px-4 py-2 text-sm font-mono">{#each diffResult as part}<span
                class={part.added
                  ? "bg-green-900/40 text-[var(--color-success)]"
                  : part.removed
                    ? "bg-red-900/40 text-[var(--color-error)]"
                    : "text-[var(--color-text-secondary)]"}>{part.value}</span>{/each}</pre>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<UndoToast
  visible={toastVisible}
  message={t(lang, "clearedAll")}
  key={undoSnapshot}
  onUndo={undoClear}
  onDismiss={dismissUndo}
  {lang}
/>
