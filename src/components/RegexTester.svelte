<script lang="ts">
  import { onDestroy } from "svelte";
  import { debounce } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import RegexWorker from "../workers/regex-worker.ts?worker";
  import RegexVisualizer from "./RegexVisualizer.svelte";
  import { parseRegex, type ParseOutcome } from "../lib/regex-parse";

  let { lang = "en" as Lang } = $props();

  let pattern = $state("");
  let flags = $state("g");
  let testString = $state("");
  let matches = $state<{ full: string; index: number; groups: string[] }[]>([]);
  let error = $state("");
  let highlighted = $state("");
  let showVisualizer = $state(false);
  // CW-JC-10 (2026-05-02): Hover/focus on a visualizer node reports its
  // pos/end so the pattern preview can highlight the matching slice — turns
  // the AST tree into an interactive teaching surface.
  let hoveredRange = $state<{ pos: number; end: number } | null>(null);
  function setHovered(r: { pos: number; end: number } | null) { hoveredRange = r; }

  // Re-parse the pattern whenever it (or the flags) change. Cheap because
  // the parser is single-pass over the pattern; no debounce needed.
  const visualizerOutcome = $derived<ParseOutcome>(parseRegex(pattern, flags));

  let worker: Worker | null = null;
  let workerTimeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedTest = debounce(runTest, 200);

  function toggleFlag(f: string) {
    flags = flags.includes(f) ? flags.replace(f, "") : flags + f;
    runTest();
  }

  function cleanupWorker() {
    if (workerTimeout) { clearTimeout(workerTimeout); workerTimeout = null; }
    if (worker) { worker.terminate(); worker = null; }
  }

  function runTest() {
    error = "";
    if (!pattern || !testString) {
      matches = [];
      highlighted = escapeHtml(testString);
      cleanupWorker();
      return;
    }
    // Validate regex syntax synchronously so we fail fast for obvious errors
    try {
      new RegExp(pattern, flags);
    } catch (e: any) {
      error = e.message;
      matches = [];
      highlighted = escapeHtml(testString);
      cleanupWorker();
      return;
    }

    cleanupWorker();
    worker = new RegexWorker();
    const currentText = testString;
    worker.onmessage = (e: MessageEvent) => {
      if (workerTimeout) { clearTimeout(workerTimeout); workerTimeout = null; }
      const data = e.data as
        | { ok: true; matches: typeof matches; highlightRanges: { index: number; length: number }[] }
        | { ok: false; error: string };
      if (data.ok) {
        matches = data.matches;
        highlighted = buildHighlightedHtmlFromRanges(currentText, data.highlightRanges);
        error = "";
      } else {
        error = data.error;
        matches = [];
        highlighted = escapeHtml(currentText);
      }
      if (worker) { worker.terminate(); worker = null; }
    };
    worker.onerror = (ev) => {
      if (workerTimeout) { clearTimeout(workerTimeout); workerTimeout = null; }
      error = ev.message || "Worker error";
      matches = [];
      highlighted = escapeHtml(currentText);
      if (worker) { worker.terminate(); worker = null; }
    };
    workerTimeout = setTimeout(() => {
      if (worker) {
        worker.terminate();
        worker = null;
        error = lang === "es"
          ? "La regex tardó demasiado (posible backtracking catastrófico)."
          : "Regex timed out (possible catastrophic backtracking).";
        matches = [];
        highlighted = escapeHtml(currentText);
      }
      workerTimeout = null;
    }, 3000);
    worker.postMessage({ pattern, flags, testString: currentText });
  }

  function buildHighlightedHtmlFromRanges(text: string, ranges: { index: number; length: number }[]): string {
    if (!text) return "";
    if (!ranges.length) return escapeHtml(text);
    let result = "";
    let lastIndex = 0;
    for (const r of ranges) {
      if (r.index < lastIndex) continue;
      result += escapeHtml(text.slice(lastIndex, r.index));
      const seg = text.slice(r.index, r.index + r.length);
      if (seg) {
        result += `<mark class="bg-[var(--color-warning)]/40 text-[var(--color-text-primary)] rounded px-0.5">${escapeHtml(seg)}</mark>`;
      }
      lastIndex = r.index + r.length;
    }
    result += escapeHtml(text.slice(lastIndex));
    return result;
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  onDestroy(() => cleanupWorker());
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <label for="regex-pattern" class="text-sm text-[var(--color-text-muted)] font-mono">/</label>
    <input
      id="regex-pattern"
      type="text"
      bind:value={pattern}
      oninput={() => debouncedTest()}
      placeholder={tt("regex", lang, "enterPattern")}
      aria-label={lang === "es" ? "Patrón de regex" : "Regex pattern"}
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      class="flex-1 min-w-[200px] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2 py-1 rounded text-sm font-mono"
    />
    <span class="text-sm text-[var(--color-text-muted)] font-mono" aria-hidden="true">/</span>
    <!--
      Flag buttons need aria-pressed (toggle state) + an accessible name
      that goes beyond the visible single character. WCAG 4.1.2 + 1.3.1
      (manual audit 2026-05-01, JC F4) — without this, SR users hear
      "g, button" without knowing what "g" means or whether it's enabled.
    -->
    <div class="flex gap-1" role="group" aria-label={lang === "es" ? "Flags de la regex" : "Regex flags"}>
      {#each [
        { f: "g", label: lang === "es" ? "Global (todas las coincidencias)" : "Global (all matches)" },
        { f: "i", label: lang === "es" ? "Insensible a mayúsculas" : "Case insensitive" },
        { f: "m", label: lang === "es" ? "Multilínea" : "Multiline" },
        { f: "s", label: lang === "es" ? 'Punto coincide con saltos de línea' : "Dot matches newlines" },
        { f: "u", label: lang === "es" ? "Modo Unicode" : "Unicode mode" },
      ] as { f, label }}
        <button
          type="button"
          onclick={() => toggleFlag(f)}
          aria-pressed={flags.includes(f)}
          aria-label={label}
          title={label}
          class="w-7 h-7 rounded text-xs font-mono {flags.includes(f)
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'}"
        >{f}</button>
      {/each}
    </div>
    <button
      type="button"
      onclick={() => (showVisualizer = !showVisualizer)}
      aria-pressed={showVisualizer}
      class="ml-auto px-2 h-7 rounded text-xs {showVisualizer
        ? 'bg-[var(--color-accent)] text-white'
        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'}"
    >{tt("regex", lang, "visualize")}</button>
    <span class="text-xs text-[var(--color-text-muted)]" aria-live="polite">
      {matches.length} {matches.length !== 1 ? tt("regex", lang, "matches") : tt("regex", lang, "matchSingular")}
    </span>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]" aria-live="polite">
      {error}
    </div>
  {/if}

  {#if showVisualizer}
    <div class="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] max-h-[40vh] overflow-auto">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] flex items-center gap-2">
        <span>{tt("regex", lang, "visualization")}</span>
        <span class="text-[var(--color-text-muted)]">·</span>
        <span>{tt("regex", lang, "visualizeHint")}</span>
      </div>
      {#if pattern}
        <!-- Pattern preview with hover-highlight (CW-JC-10). When the user
             hovers an AST node the matching slice is wrapped in <mark>
             so the connection between tree node and source pattern is
             obvious. Falls back to the plain pattern when nothing hovered. -->
        <div class="px-3 pt-1 pb-2 text-sm font-mono whitespace-pre-wrap break-all" aria-live="polite">
          <span class="text-[var(--color-text-muted)] text-xs mr-1" aria-hidden="true">/</span>
          {#if hoveredRange && hoveredRange.pos < hoveredRange.end && hoveredRange.end <= pattern.length}
            <span class="text-[var(--color-text-secondary)]">{pattern.slice(0, hoveredRange.pos)}</span><mark style="background: var(--color-accent); color: white; padding: 0 2px; border-radius: 2px;">{pattern.slice(hoveredRange.pos, hoveredRange.end)}</mark><span class="text-[var(--color-text-secondary)]">{pattern.slice(hoveredRange.end)}</span>
          {:else}
            <span class="text-[var(--color-text-secondary)]">{pattern}</span>
          {/if}
          <span class="text-[var(--color-text-muted)] text-xs ml-1" aria-hidden="true">/{flags}</span>
        </div>
      {/if}
      <RegexVisualizer outcome={visualizerOutcome} {lang} onHover={setHovered} />
    </div>
  {/if}

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Test string -->
    <div class="flex-1 flex flex-col min-h-0">
      <label for="regex-test-string" class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] block">
        {tt("regex", lang, "testString")}
      </label>
      <div class="flex-1 p-3 overflow-auto">
        <textarea
          id="regex-test-string"
          bind:value={testString}
          oninput={() => debouncedTest()}
          rows="10"
          class="w-full h-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded p-3 font-mono text-sm resize-none"
          placeholder={tt("regex", lang, "enterTestString")}
        ></textarea>
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>

    <!-- Results -->
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {tt("regex", lang, "matchesHighlighted")}
      </div>
      <div class="flex-1 p-3 overflow-auto space-y-3">
        <div class="p-3 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
          {@html highlighted || `<span class="text-[var(--color-text-muted)]">${tt("regex", lang, "matchesPlaceholder")}</span>`}
        </div>

        {#if matches.length > 0}
          <div class="space-y-2">
            {#each matches as m, i}
              <div class="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-[var(--color-text-muted)] text-xs">#{i + 1}</span>
                  <span class="font-mono text-[var(--color-accent-fg)]">"{m.full}"</span>
                  <span class="text-xs text-[var(--color-text-muted)]">{tt("regex", lang, "atIndex")} {m.index}</span>
                </div>
                {#if m.groups.length > 0}
                  <div class="mt-1 flex flex-wrap gap-1">
                    {#each m.groups as g, gi}
                      <span class="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-xs font-mono">
                        ${gi + 1}: "{g ?? ""}"
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
