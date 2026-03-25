<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { debounce } from "../lib/fileutils";

  let pattern = "";
  let flags = "g";
  let testString = "";
  let matches: { full: string; index: number; groups: string[] }[] = [];
  let error = "";

  const debouncedTest = debounce(runTest, 200);

  function toggleFlag(f: string) {
    flags = flags.includes(f) ? flags.replace(f, "") : flags + f;
    runTest();
  }

  function runTest() {
    matches = [];
    error = "";
    if (!pattern || !testString) return;
    try {
      const re = new RegExp(pattern, flags);
      let m: RegExpExecArray | null;
      const results: typeof matches = [];
      if (flags.includes("g")) {
        // Use matchAll for global matching
        for (const match of testString.matchAll(new RegExp(pattern, flags))) {
          results.push({ full: match[0], index: match.index ?? 0, groups: Array.from(match).slice(1) });
        }
      } else {
        const match = testString.match(re);
        if (match) {
          results.push({ full: match[0], index: match.index ?? 0, groups: Array.from(match).slice(1) });
        }
      }
      matches = results;
      updateHighlight();
    } catch (e: any) {
      error = e.message;
      updateHighlight();
    }
  }

  function getHighlightedHtml(text: string, pat: string, fl: string): string {
    if (!pat || !text) return escapeHtml(text);
    try {
      const re = new RegExp(pat, fl.includes("g") ? fl : fl + "g");
      return text.replace(re, (m) =>
        m ? `<mark class="bg-[var(--color-warning)]/40 text-[var(--color-text-primary)] rounded px-0.5">${escapeHtml(m)}</mark>` : ""
      );
    } catch {
      return escapeHtml(text);
    }
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  let highlighted = "";
  function updateHighlight() {
    highlighted = getHighlightedHtml(testString, pattern, flags);
  }
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <span class="text-sm text-[var(--color-text-muted)] font-mono">/</span>
    <input
      type="text"
      bind:value={pattern}
      oninput={() => debouncedTest()}
      placeholder="Enter regex pattern..."
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
    <span class="text-xs text-[var(--color-text-muted)] ml-auto">
      {matches.length} match{matches.length !== 1 ? "es" : ""}
    </span>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]">
      {error}
    </div>
  {/if}

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Test string -->
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        Test String
      </div>
      <div class="flex-1 p-3 overflow-auto">
        <textarea
          bind:value={testString}
          oninput={() => debouncedTest()}
          rows="10"
          class="w-full h-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded p-3 font-mono text-sm resize-none"
          placeholder="Enter test string..."
        ></textarea>
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>

    <!-- Results -->
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        Matches &amp; Highlighted
      </div>
      <div class="flex-1 p-3 overflow-auto space-y-3">
        <div class="p-3 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
          {@html highlighted || '<span class="text-[var(--color-text-muted)]">Matches will be highlighted here</span>'}
        </div>

        {#if matches.length > 0}
          <div class="space-y-2">
            {#each matches as m, i}
              <div class="p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-[var(--color-text-muted)] text-xs">#{i + 1}</span>
                  <span class="font-mono text-[var(--color-accent)]">"{m.full}"</span>
                  <span class="text-xs text-[var(--color-text-muted)]">at index {m.index}</span>
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
