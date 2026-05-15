<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import { copyAndNotify, downloadAndNotify } from "../lib/notify";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let htmlOutput = $state("");
  let error = $state("");
  let showPreview = $state(true);

  const fireToolComplete = useToolComplete("json-to-html-table");
  $effect(() => {
    htmlOutput; error;
    if (htmlOutput && !error) fireToolComplete();
  });

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
      const parsed = JSON.parse(stripBom(input));
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
    if (htmlOutput) copyAndNotify(htmlOutput, t(lang, "copied"), t(lang, "copyFailed"));
  }

  async function download() {
    if (!htmlOutput) return;
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<style>\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\nth { background-color: #f2f2f2; font-weight: bold; }\ntr:nth-child(even) { background-color: #f9f9f9; }\n</style>\n</head>\n<body>\n${htmlOutput}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    await downloadAndNotify(blob, "table.html", t(lang, "downloaded"), t(lang, "downloadFailed"));
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
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]" aria-live="polite">{error}</div>
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
          <div class="rounded border border-[var(--color-border)] overflow-hidden bg-white">
            <iframe
              srcdoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
                body { margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; color: #222; background: #fff; }
                table { border-collapse: collapse; width: 100%; font-size: 13px; }
                th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
                th { background: #f2f2f2; font-weight: 600; }
                tr:nth-child(even) td { background: #f9f9f9; }
              </style></head><body>${htmlOutput}</body></html>`}
              sandbox=""
              title={tt("jsonToHtmlTable", lang, "showPreview")}
              class="w-full h-full min-h-[300px] border-0"
            ></iframe>
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
