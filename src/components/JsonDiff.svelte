<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { diffJson } from "diff";
  import { friendlyError, debounce, stripBom } from "../lib/fileutils";
  import { shouldUseWorker, diffInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let left = $state("");
  let right = $state("");
  let diffResult = $state<Array<{ added?: boolean; removed?: boolean; value: string }>>([]);
  let error = $state("");
  let hasDifferences = $state(false);

  let processing = $state(false);

  async function compare() {
    error = "";
    hasDifferences = false;
    if (!left.trim() && !right.trim()) {
      diffResult = [];
      return;
    }
    if (!left.trim() || !right.trim()) {
      diffResult = [];
      error = !left.trim() ? tt("diff", lang, "enterLeft") : tt("diff", lang, "enterRight");
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

  function clear() {
    left = "";
    right = "";
    diffResult = [];
    error = "";
    hasDifferences = false;
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
      on:click={compare}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {t(lang, "compare")}
    </button>
    <button
      on:click={swap}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "swap")}
    </button>
    <button
      on:click={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "clear")}
    </button>
    <button
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    {#if processing}
      <span class="text-xs text-[var(--color-accent)] ml-auto animate-pulse">{t(lang, "comparing")}</span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
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
    >
      <div class="text-xs text-[var(--color-text-muted)] px-4 py-1 border-b border-[var(--color-border)] flex items-center justify-between">
        {#if hasDifferences}
          <span>
            {tt("diff", lang, "differences")}
            +{diffResult.filter(p => p.added).reduce((n, p) => n + p.value.split('\n').length - 1, 0)} {tt("diff", lang, "lines")},
            -{diffResult.filter(p => p.removed).reduce((n, p) => n + p.value.split('\n').length - 1, 0)} {tt("diff", lang, "lines")}
          </span>
        {:else}
          <span class="text-[var(--color-success)]">{tt("diff", lang, "noDifferences")}</span>
        {/if}
      </div>
      {#if hasDifferences}
        <pre class="px-4 py-2 text-sm font-mono">{#each diffResult as part}<span
              class={part.added
                ? "bg-green-900/40 text-[var(--color-success)]"
                : part.removed
                  ? "bg-red-900/40 text-[var(--color-error)]"
                  : "text-[var(--color-text-secondary)]"}>{part.value}</span>{/each}</pre>
      {/if}
    </div>
  {/if}
</div>
