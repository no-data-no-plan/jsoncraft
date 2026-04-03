<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let htmlOutput = "";
  let error = "";
  let showPreview = true;

  function escapeHtml(str: string): string {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function jsonToTable(data: unknown): string {
    if (!Array.isArray(data)) {
      if (typeof data === "object" && data !== null) {
        data = [data];
      } else {
        throw new Error(tt("jsonToHtmlTable", lang, "needsArrayOrObject"));
      }
    }

    if (data.length === 0) throw new Error(tt("jsonToHtmlTable", lang, "emptyArray"));

    const headers = new Set<string>();
    for (const item of data) {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        for (const key of Object.keys(item)) headers.add(key);
      }
    }

    if (headers.size === 0) {
      throw new Error(tt("jsonToHtmlTable", lang, "needsObjects"));
    }

    const cols = [...headers];
    let html = "<table>\n  <thead>\n    <tr>\n";
    for (const h of cols) {
      html += `      <th>${escapeHtml(h)}</th>\n`;
    }
    html += "    </tr>\n  </thead>\n  <tbody>\n";

    for (const row of data as Record<string, unknown>[]) {
      html += "    <tr>\n";
      for (const col of cols) {
        const val = row[col];
        const display = val === null || val === undefined ? "" :
          typeof val === "object" ? JSON.stringify(val) : String(val);
        html += `      <td>${escapeHtml(display)}</td>\n`;
      }
      html += "    </tr>\n";
    }

    html += "  </tbody>\n</table>";
    return html;
  }

  function convert() {
    if (!input.trim()) { htmlOutput = ""; error = ""; return; }
    try {
      const parsed = JSON.parse(input);
      htmlOutput = jsonToTable(parsed);
      error = "";
    } catch (e: any) {
      error = e.message;
      htmlOutput = "";
    }
  }

  function handleInput(val: string) {
    input = val;
    convert();
  }

  function copySample() {
    input = JSON.stringify([
      { name: "Alice", age: 30, role: "Engineer", city: "Berlin" },
      { name: "Bob", age: 25, role: "Designer", city: "London" },
      { name: "Carol", age: 35, role: "Manager", city: "Paris" },
    ], null, 2);
    convert();
  }

  function copyOutput() {
    if (htmlOutput) navigator.clipboard.writeText(htmlOutput);
  }

  function download() {
    if (!htmlOutput) return;
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<style>\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\nth { background-color: #f2f2f2; font-weight: bold; }\ntr:nth-child(even) { background-color: #f9f9f9; }\n</style>\n</head>\n<body>\n${htmlOutput}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.html";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button onclick={copySample} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "sample")}</button>
    <button onclick={() => { input = ""; htmlOutput = ""; error = ""; }} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "clear")}</button>
    {#if htmlOutput}
      <button onclick={() => showPreview = !showPreview} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
        {showPreview ? tt("jsonToHtmlTable", lang, "showCode") : tt("jsonToHtmlTable", lang, "showPreview")}
      </button>
    {/if}
    <div class="ml-auto flex items-center gap-2">
      {#if htmlOutput}
        <button onclick={copyOutput} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "copy")}</button>
        <button onclick={download} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "download")}</button>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]">{error}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">JSON {t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="json" placeholder={tt("jsonToHtmlTable", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0 overflow-auto">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">HTML {t(lang, "output")}</div>
      {#if htmlOutput && showPreview}
        <div class="flex-1 p-3 overflow-auto">
          <div class="rounded border border-[var(--color-border)] overflow-auto">
            {@html `<style>
              .jc-preview table { border-collapse: collapse; width: 100%; font-size: 13px; }
              .jc-preview th, .jc-preview td { border: 1px solid var(--color-border); padding: 6px 10px; text-align: left; }
              .jc-preview th { background: var(--color-bg-tertiary); font-weight: 600; color: var(--color-text-primary); }
              .jc-preview td { color: var(--color-text-secondary); }
            </style>`}
            <div class="jc-preview">{@html htmlOutput}</div>
          </div>
        </div>
      {:else if htmlOutput}
        <div class="flex-1 p-2">
          <CodeEditor value={htmlOutput} lang="text" readonly />
        </div>
      {:else}
        <div class="flex-1 flex items-center justify-center p-3">
          <p class="text-sm text-[var(--color-text-muted)]">{tt("jsonToHtmlTable", lang, "emptyHint")}</p>
        </div>
      {/if}
    </div>
  </div>
</div>
