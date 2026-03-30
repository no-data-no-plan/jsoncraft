<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { diffJson } from "diff";
  import { friendlyError, debounce } from "../lib/fileutils";
  import { shouldUseWorker, diffInWorker } from "../lib/worker-api";

  let left = "";
  let right = "";
  let diffResult: Array<{ added?: boolean; removed?: boolean; value: string }> = [];
  let error = "";
  let hasDifferences = false;

  let processing = false;

  async function compare() {
    error = "";
    hasDifferences = false;
    if (!left.trim() && !right.trim()) {
      diffResult = [];
      return;
    }
    if (!left.trim() || !right.trim()) {
      diffResult = [];
      error = !left.trim() ? "Enter JSON in the left panel" : "Enter JSON in the right panel";
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
      parsedLeft = JSON.parse(left);
    } catch (e: any) {
      error = "Left: " + friendlyError(e.message);
      diffResult = [];
      return;
    }
    try {
      parsedRight = JSON.parse(right);
    } catch (e: any) {
      error = "Right: " + friendlyError(e.message);
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
      Compare
    </button>
    <button
      on:click={swap}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Swap
    </button>
    <button
      on:click={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Clear
    </button>
    <button
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Sample
    </button>
    {#if processing}
      <span class="text-xs text-[var(--color-accent)] ml-auto animate-pulse">Comparing...</span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
  </div>

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Left editor -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Left (Original)</div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={left} lang="json" placeholder="Paste first JSON..." onchange={handleLeft} />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <!-- Right editor -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Right (Modified)</div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={right} lang="json" placeholder="Paste second JSON..." onchange={handleRight} />
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
            Differences:
            +{diffResult.filter(p => p.added).reduce((n, p) => n + p.value.split('\n').length - 1, 0)} lines,
            -{diffResult.filter(p => p.removed).reduce((n, p) => n + p.value.split('\n').length - 1, 0)} lines
          </span>
        {:else}
          <span class="text-[var(--color-success)]">No differences — JSONs are identical</span>
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
