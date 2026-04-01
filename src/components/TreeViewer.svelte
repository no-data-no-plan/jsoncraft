<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { debounce } from "../lib/fileutils";
  import { shouldUseWorker, parseInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let parsed: unknown = null;
  let error = "";

  function collectFirstLevelPaths(data: unknown): Set<string> {
    const paths = new Set<string>();
    if (Array.isArray(data)) {
      data.forEach((_, i) => paths.add(`$[${i}]`));
    } else if (typeof data === "object" && data !== null) {
      Object.keys(data).forEach((k) => paths.add(`$.${k}`));
    }
    return paths;
  }

  let processing = false;

  async function processInput(value: string) {
    if (!value.trim()) {
      parsed = null;
      error = "";
      return;
    }
    if (shouldUseWorker(value)) {
      processing = true;
      try {
        const result = await parseInWorker(value);
        parsed = JSON.parse(result.output);
        error = "";
        allExpanded = false;
        expandedPaths = collectFirstLevelPaths(parsed);
        visibleLimits = new Map();
      } catch (e: any) {
        error = e.message;
        parsed = null;
      } finally {
        processing = false;
      }
    } else {
      try {
        parsed = JSON.parse(value);
        error = "";
        allExpanded = false;
        expandedPaths = collectFirstLevelPaths(parsed);
        visibleLimits = new Map();
      } catch (e: any) {
        error = e.message;
        parsed = null;
      }
    }
  }

  const debouncedProcess = debounce((v: string) => processInput(v), 300);

  function handleInput(value: string) {
    input = value;
    debouncedProcess(value);
  }

  function loadSample() {
    const sample = JSON.stringify(
      {
        users: [
          { id: 1, name: "Alice", roles: ["admin", "user"], active: true },
          { id: 2, name: "Bob", roles: ["user"], active: false },
        ],
        metadata: { total: 2, page: 1, generated: null },
      },
      null,
      2
    );
    handleInput(sample);
    input = sample;
  }

  let expandedPaths = new Set<string>();
  let allExpanded = false;

  function togglePath(path: string) {
    if (expandedPaths.has(path)) {
      expandedPaths.delete(path);
    } else {
      expandedPaths.add(path);
    }
    expandedPaths = new Set(expandedPaths);
  }

  function expandAll() {
    allExpanded = true;
    expandedPaths = new Set<string>();
  }

  function collapseAll() {
    allExpanded = false;
    expandedPaths = new Set<string>();
  }

  function isExpanded(path: string): boolean {
    if (allExpanded) return !expandedPaths.has(path);
    return expandedPaths.has(path);
  }

  function getType(val: unknown): string {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    return typeof val;
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  const PAGE_SIZE = 100;
  let visibleLimits = new Map<string, number>();

  function getVisibleLimit(path: string): number {
    return visibleLimits.get(path) || PAGE_SIZE;
  }

  function showMore(path: string) {
    visibleLimits.set(path, getVisibleLimit(path) + PAGE_SIZE);
    visibleLimits = new Map(visibleLimits);
  }
</script>

{#snippet renderNode(key: string, value: unknown, path: string, depth: number)}
  {@const type = getType(value)}
  {@const isExpandable = type === "object" || type === "array"}
  {@const expanded = isExpandable && isExpanded(path)}

  <div style="padding-left: {depth * 16}px" role="treeitem" aria-expanded={isExpandable ? expanded : undefined}>
    <div
      class="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-[var(--color-bg-tertiary)] group cursor-default"
      tabindex={isExpandable ? 0 : -1}
      on:click={() => isExpandable && togglePath(path)}
      on:keydown={(e) => { if (isExpandable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); togglePath(path); } }}
    >
      {#if isExpandable}
        <span class="w-4 text-center text-xs text-[var(--color-text-muted)] select-none transition-transform"
          class:rotate-90={expanded}
        >
          >
        </span>
      {:else}
        <span class="w-4"></span>
      {/if}

      <span class="text-[var(--color-accent)] text-sm">"{key}"</span>
      <span class="text-[var(--color-text-muted)] text-sm">:</span>

      {#if type === "string"}
        <span class="tree-string text-sm">"{value}"</span>
      {:else if type === "number"}
        <span class="tree-number text-sm">{value}</span>
      {:else if type === "boolean"}
        <span class="tree-boolean text-sm">{value}</span>
      {:else if type === "null"}
        <span class="text-[var(--color-text-muted)] text-sm italic">null</span>
      {:else if type === "array"}
        <span class="text-[var(--color-text-muted)] text-xs">Array[{(value as unknown[]).length}]</span>
      {:else if type === "object"}
        <span class="text-[var(--color-text-muted)] text-xs"
          >Object{"{"}{Object.keys(value as object).length}{"}"}</span
        >
      {/if}

      <button
        class="ml-auto opacity-0 group-hover:opacity-100 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
        on:click|stopPropagation={() => copyPath(path)}
        title={tt("viewer", lang, "copyPath")}
      >
        {tt("viewer", lang, "copyPath")}
      </button>
    </div>

    {#if expanded}
      {@const limit = getVisibleLimit(path)}
      {#if type === "array"}
        {@const items = value as unknown[]}
        {#each items.slice(0, limit) as item, i}
          {@render renderNode(String(i), item, `${path}[${i}]`, depth + 1)}
        {/each}
        {#if items.length > limit}
          <div style="padding-left: {(depth + 1) * 16}px">
            <button
              class="text-xs text-[var(--color-accent)] hover:underline py-1"
              on:click|stopPropagation={() => showMore(path)}
            >
              {tt("viewer", lang, "showMore")} ({items.length - limit} {tt("viewer", lang, "remaining")})
            </button>
          </div>
        {/if}
      {:else if type === "object"}
        {@const entries = Object.entries(value as object)}
        {#each entries.slice(0, limit) as [k, v]}
          {@render renderNode(k, v, `${path}.${k}`, depth + 1)}
        {/each}
        {#if entries.length > limit}
          <div style="padding-left: {(depth + 1) * 16}px">
            <button
              class="text-xs text-[var(--color-accent)] hover:underline py-1"
              on:click|stopPropagation={() => showMore(path)}
            >
              {tt("viewer", lang, "showMore")} ({entries.length - limit} {tt("viewer", lang, "remaining")})
            </button>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
{/snippet}

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div
    class="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <button
      on:click={expandAll}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {tt("viewer", lang, "expandAll")}
    </button>
    <button
      on:click={collapseAll}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {tt("viewer", lang, "collapseAll")}
    </button>
    <button
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    {#if processing}
      <span class="text-xs text-[var(--color-accent)] ml-auto animate-pulse">{t(lang, "parsing")}</span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
  </div>

  <!-- Content -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{t(lang, "input")}</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder={tt("viewer", lang, "inputPlaceholder")}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{tt("viewer", lang, "tree")}</div>
      <div
        role="tree"
        class="flex-1 min-h-0 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 font-mono"
      >
        {#if parsed !== null}
          {#if typeof parsed === "object" && parsed !== null}
            {#if Array.isArray(parsed)}
              {#if parsed.length === 0}
                <span class="text-sm text-[var(--color-text-muted)]">{tt("viewer", lang, "emptyArray")}</span>
              {:else}
                {@const rootLimit = getVisibleLimit("$")}
                {#each parsed.slice(0, rootLimit) as item, i}
                  {@render renderNode(String(i), item, `$[${i}]`, 0)}
                {/each}
                {#if parsed.length > rootLimit}
                  <button
                    class="text-xs text-[var(--color-accent)] hover:underline py-1 ml-4"
                    on:click={() => showMore("$")}
                  >
                    {tt("viewer", lang, "showMore")} ({parsed.length - rootLimit} {tt("viewer", lang, "remaining")})
                  </button>
                {/if}
              {/if}
            {:else}
              {@const rootEntries = Object.entries(parsed)}
              {#if rootEntries.length === 0}
                <span class="text-sm text-[var(--color-text-muted)]">{tt("viewer", lang, "emptyObject")}</span>
              {:else}
                {@const rootLimit = getVisibleLimit("$")}
                {#each rootEntries.slice(0, rootLimit) as [k, v]}
                  {@render renderNode(k, v, `$.${k}`, 0)}
                {/each}
                {#if rootEntries.length > rootLimit}
                  <button
                    class="text-xs text-[var(--color-accent)] hover:underline py-1 ml-4"
                    on:click={() => showMore("$")}
                  >
                    {tt("viewer", lang, "showMore")} ({rootEntries.length - rootLimit} {tt("viewer", lang, "remaining")})
                  </button>
                {/if}
              {/if}
            {/if}
          {:else}
            <span class="text-sm text-[var(--color-text-secondary)]">{JSON.stringify(parsed)}</span>
          {/if}
        {:else if !error}
          <span class="text-sm text-[var(--color-text-muted)]">{tt("viewer", lang, "pasteHint")}</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .tree-string { color: #4ade80; }
  .tree-number { color: #fbbf24; }
  .tree-boolean { color: #a78bfa; }
  :global(html.light) .tree-string { color: #16a34a; }
  :global(html.light) .tree-number { color: #b45309; }
  :global(html.light) .tree-boolean { color: #7c3aed; }
</style>
