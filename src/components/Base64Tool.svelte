<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import { copyAndNotify } from "../lib/notify";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let output = "";
  let mode: "encode" | "decode" = "encode";
  let urlSafe = $state(false);
  let error = "";

  const fireToolComplete = useToolComplete("base64");

  function encodeText(text: string): string {
    const std = btoa(unescape(encodeURIComponent(text)));
    if (urlSafe) {
      return std.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return std;
  }

  function decodeText(b64: string): string {
    let s = b64.replace(/\s/g, "");
    // Auto-detect URL-safe: if input contains - or _, treat as URL-safe.
    // Otherwise, honor the user's toggle for ambiguous input.
    const hasUrlSafeChars = /[-_]/.test(s);
    const hasStdChars = /[+/]/.test(s);
    const treatAsUrlSafe = hasUrlSafeChars || (!hasStdChars && urlSafe);
    if (treatAsUrlSafe) {
      s = s.replace(/-/g, "+").replace(/_/g, "/");
    }
    // Pad if missing
    while (s.length % 4) s += "=";
    return decodeURIComponent(escape(atob(s)));
  }

  function process() {
    error = "";
    if (!input.trim()) { output = ""; return; }
    try {
      output = mode === "encode" ? encodeText(input) : decodeText(input);
      if (output) fireToolComplete();
    } catch (e: any) {
      error = mode === "decode" ? tt("base64", lang, "invalidBase64") : e.message;
      output = "";
    }
  }

  function handleInput(val: string) {
    input = val;
    process();
  }

  function toggleUrlSafe() {
    urlSafe = !urlSafe;
    process();
  }

  function swap() {
    const tmp = output;
    mode = mode === "encode" ? "decode" : "encode";
    input = tmp;
    process();
  }

  function copy() {
    if (output) copyAndNotify(output, t(lang, "copied"), t(lang, "copyFailed"));
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button
      onclick={() => { mode = "encode"; process(); }}
      class="px-3 py-1 rounded text-sm {mode === 'encode' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'}"
    >{t(lang, "encode")}</button>
    <button
      onclick={() => { mode = "decode"; process(); }}
      class="px-3 py-1 rounded text-sm {mode === 'decode' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'}"
    >{t(lang, "decode")}</button>
    <span class="w-px h-5 bg-[var(--color-border)]"></span>
    <label class="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] cursor-pointer select-none" title={tt("base64", lang, "urlSafeHint")}>
      <input type="checkbox" checked={urlSafe} onchange={toggleUrlSafe} class="accent-[var(--color-accent)]" />
      {tt("base64", lang, "urlSafe")}
    </label>
    <button onclick={swap} class="px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" title={lang === "es" ? "Intercambiar entrada/salida" : "Swap input/output"}>
      {t(lang, "swap")}
    </button>
    <button onclick={copy} class="ml-auto px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      {t(lang, "copy")}
    </button>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]" aria-live="polite">
      {error}
    </div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {mode === "encode" ? tt("base64", lang, "text") : "Base64"}
      </div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="text" placeholder={mode === "encode" ? tt("base64", lang, "encodePlaceholder") : tt("base64", lang, "decodePlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {mode === "encode" ? "Base64" : tt("base64", lang, "text")}
      </div>
      <div class="flex-1 p-2">
        <CodeEditor value={output} lang="text" readonly={true} placeholder={tt("base64", lang, "resultPlaceholder")} />
      </div>
    </div>
  </div>
</div>
