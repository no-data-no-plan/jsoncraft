<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";

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

  function handleInput(value: string) {
    input = value;
    if (!value.trim()) {
      parsed = null;
      error = "";
      return;
    }
    try {
      parsed = JSON.parse(value);
      error = "";
      allExpanded = false;
      expandedPaths = collectFirstLevelPaths(parsed);
    } catch (e: any) {
      error = e.message;
      parsed = null;
    }
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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->

{#snippet renderNode(key: string, value: unknown, path: string, depth: number)}
  {@const type = getType(value)}
  {@const isExpandable = type === "object" || type === "array"}
  {@const expanded = isExpandable && isExpanded(path)}

  <div style="padding-left: {depth * 16}px">
    <div
      class="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-[var(--color-bg-tertiary)] group cursor-default"
      on:click={() => isExpandable && togglePath(path)}
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
        title="Copy path"
      >
        copy path
      </button>
    </div>

    {#if expanded}
      {#if type === "array"}
        {#each value as item, i}
          {@render renderNode(String(i), item, `${path}[${i}]`, depth + 1)}
        {/each}
      {:else if type === "object"}
        {#each Object.entries(value as object) as [k, v]}
          {@render renderNode(k, v, `${path}.${k}`, depth + 1)}
        {/each}
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
      Expand All
    </button>
    <button
      on:click={collapseAll}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Collapse All
    </button>
    <button
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Sample
    </button>
    {#if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
  </div>

  <!-- Content -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Input</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder="Paste JSON to explore as tree..."
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Tree</div>
      <div
        class="flex-1 min-h-0 overflow-auto rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 font-mono"
      >
        {#if parsed !== null}
          {#if typeof parsed === "object" && parsed !== null}
            {#if Array.isArray(parsed)}
              {#if parsed.length === 0}
                <span class="text-sm text-[var(--color-text-muted)]">Empty array []</span>
              {:else}
                {#each parsed as item, i}
                  {@render renderNode(String(i), item, `$[${i}]`, 0)}
                {/each}
              {/if}
            {:else}
              {#if Object.keys(parsed).length === 0}
                <span class="text-sm text-[var(--color-text-muted)]">Empty object {"{}"}</span>
              {:else}
                {#each Object.entries(parsed) as [k, v]}
                  {@render renderNode(k, v, `$.${k}`, 0)}
                {/each}
              {/if}
            {/if}
          {:else}
            <span class="text-sm text-[var(--color-text-secondary)]">{JSON.stringify(parsed)}</span>
          {/if}
        {:else if !error}
          <span class="text-sm text-[var(--color-text-muted)]">Paste JSON on the left to see the tree view.</span>
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
