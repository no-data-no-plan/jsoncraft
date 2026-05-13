<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { JSONPath } from "jsonpath-plus";
  import { friendlyError, debounce, stripBom } from "../lib/fileutils";
  import { shouldUseWorker, jsonpathInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let query = $state("$.store.book[*].author");
  let result = $state("");
  let error = $state("");
  let matchCount = $state(0);

  const fireToolComplete = useToolComplete("jsonpath");
  $effect(() => {
    result; error;
    if (result && !error) fireToolComplete();
  });

  const examples = $derived([
    { label: tt("jsonpath", lang, "allAuthors"), path: "$.store.book[*].author" },
    { label: tt("jsonpath", lang, "allPrices"), path: "$..price" },
    { label: tt("jsonpath", lang, "firstBook"), path: "$.store.book[0]" },
    { label: tt("jsonpath", lang, "booksWithIsbn"), path: "$.store.book[?(@.isbn)]" },
    { label: tt("jsonpath", lang, "booksUnder10"), path: "$.store.book[?(@.price<10)]" },
    { label: tt("jsonpath", lang, "allItems"), path: "$..*" },
  ]);

  let processing = $state(false);

  async function evaluate() {
    error = "";
    result = "";
    matchCount = 0;
    if (!input.trim()) {
      if (query.trim()) error = tt("jsonpath", lang, "pasteFirst");
      return;
    }
    if (!query.trim()) return;

    if (shouldUseWorker(input)) {
      processing = true;
      try {
        const res = await jsonpathInWorker(input, query);
        result = res.output;
        matchCount = res.matchCount || 0;
      } catch (e: any) {
        error = friendlyError(e.message);
      } finally {
        processing = false;
      }
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripBom(input));
    } catch (e: any) {
      error = (lang === "es" ? "JSON inválido: " : "Invalid JSON: ") + friendlyError(e.message);
      return;
    }

    try {
      // eval defaults to 'safe' (jsep AST walker, CSP-compatible).
      const matches = JSONPath({ path: query, json: parsed });
      matchCount = matches.length;
      result = JSON.stringify(matches, null, 2);
    } catch (e: any) {
      error = (lang === "es" ? "Error JSONPath: " : "JSONPath error: ") + (e.message || (lang === "es" ? "Expresión inválida" : "Invalid expression"));
    }
  }

  const debouncedEvaluate = debounce(() => evaluate(), 300);

  function handleInput(value: string) {
    input = value;
    debouncedEvaluate();
  }

  function setQuery(path: string) {
    query = path;
    evaluate();
  }

  function loadSample() {
    input = JSON.stringify(
      {
        store: {
          book: [
            { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
            { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
            {
              category: "fiction",
              author: "Herman Melville",
              title: "Moby Dick",
              isbn: "0-553-21311-3",
              price: 8.99,
            },
            {
              category: "fiction",
              author: "J. R. R. Tolkien",
              title: "The Lord of the Rings",
              isbn: "0-395-19395-8",
              price: 22.99,
            },
          ],
          bicycle: { color: "red", price: 19.95 },
        },
      },
      null,
      2
    );
    evaluate();
  }
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <label for="jsonpath-input" class="text-sm text-[var(--color-text-secondary)] shrink-0">{tt("jsonpath", lang, "path")}</label>
      <input
        id="jsonpath-input"
        type="text"
        bind:value={query}
        oninput={debouncedEvaluate}
        class="flex-1 min-w-0 px-3 py-1.5 rounded text-sm font-mono bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:outline-none"
        placeholder="$.path.to.value"
      />
    </div>
    <button
      onclick={evaluate}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {t(lang, "evaluate")}
    </button>
    <button
      onclick={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    <span aria-live="polite">
    {#if processing}
      <span class="text-xs text-[var(--color-accent-fg)] animate-pulse">{t(lang, "evaluating")}</span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)]">{error}</span>
    {/if}
    </span>
  </div>

  <!-- Examples -->
  <div
    class="flex flex-wrap items-center gap-1 px-4 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <span class="text-xs text-[var(--color-text-muted)]">{tt("jsonpath", lang, "examples")}</span>
    {#each examples as ex}
      <button
        onclick={() => setQuery(ex.path)}
        class="px-2 py-0.5 rounded text-xs font-mono bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        {ex.label}
      </button>
    {/each}
  </div>

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{tt("jsonpath", lang, "jsonInput")}</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder={tt("jsonpath", lang, "inputPlaceholder")}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">
        {t(lang, "result")}
        {#if result}
          <span class="ml-1">({matchCount} {matchCount === 1 ? tt("jsonpath", lang, "match") : tt("jsonpath", lang, "matches")})</span>
        {/if}
      </div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={result} lang="json" placeholder={tt("jsonpath", lang, "resultPlaceholder")} readonly={true} />
      </div>
    </div>
  </div>
</div>
