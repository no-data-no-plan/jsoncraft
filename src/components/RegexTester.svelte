<script lang="ts">
  import { onDestroy } from "svelte";
  import { debounce } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import RegexWorker from "../workers/regex-worker.ts?worker";

  let { lang = "en" as Lang } = $props();

  let pattern = $state("");
  let flags = $state("g");
  let testString = $state("");
  let matches = $state<{ full: string; index: number; groups: string[] }[]>([]);
  let error = $state("");
  let highlighted = $state("");

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
    <span class="text-sm text-[var(--color-text-muted)] font-mono">/</span>
    <input
      type="text"
      bind:value={pattern}
      oninput={() => debouncedTest()}
      placeholder={tt("regex", lang, "enterPattern")}
      aria-label={tt("regex", lang, "enterPattern")}
      class="flex-1 min-w-[200px] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2 py-1 rounded text-sm font-mono"
    />
    <span class="text-sm text-[var(--color-text-muted)] font-mono">/</span>
    <div class="flex gap-1">
      {#each ["g", "i", "m", "s", "u"] as f}
        <button
          onclick={() => toggleFlag(f)}
          class="w-7 h-7 rounded text-xs font-mono {flags.includes(f)
            ? 'bg-[var(--color-accent)] text-white'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'}"
        >{f}</button>
      {/each}
    </div>
    <span class="text-xs text-[var(--color-text-muted)] ml-auto" aria-live="polite">
      {matches.length} {matches.length !== 1 ? tt("regex", lang, "matches") : tt("regex", lang, "matchSingular")}
    </span>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]" aria-live="polite">
      {error}
    </div>
  {/if}

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Test string -->
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {tt("regex", lang, "testString")}
      </div>
      <div class="flex-1 p-3 overflow-auto">
        <textarea
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
