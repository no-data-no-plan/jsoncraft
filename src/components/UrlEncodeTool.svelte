<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let output = "";
  let mode: "encode" | "decode" = "encode";
  let encodeMode: "component" | "uri" = "component";
  let error = "";

  function process() {
    error = "";
    if (!input.trim()) { output = ""; return; }
    try {
      if (mode === "encode") {
        output = encodeMode === "component" ? encodeURIComponent(input) : encodeURI(input);
      } else {
        output = encodeMode === "component" ? decodeURIComponent(input) : decodeURI(input);
      }
    } catch (e: any) {
      error = (lang === "es" ? "Entrada inválida: " : "Invalid input: ") + e.message;
      output = "";
    }
  }

  function handleInput(val: string) {
    input = val;
    process();
  }

  function swap() {
    const tmp = output;
    mode = mode === "encode" ? "decode" : "encode";
    input = tmp;
    process();
  }

  function copy() {
    if (output) navigator.clipboard.writeText(output);
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
    <button
      onclick={() => { encodeMode = "component"; process(); }}
      class="px-3 py-1 rounded text-xs {encodeMode === 'component' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}"
    >{tt("urlEncode", lang, "component")}</button>
    <button
      onclick={() => { encodeMode = "uri"; process(); }}
      class="px-3 py-1 rounded text-xs {encodeMode === 'uri' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}"
    >{tt("urlEncode", lang, "fullUri")}</button>
    <button onclick={swap} class="px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      {t(lang, "swap")}
    </button>
    <button onclick={copy} class="ml-auto px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      {t(lang, "copy")}
    </button>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]">{error}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="text" placeholder={tt("urlEncode", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{t(lang, "output")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={output} lang="text" readonly={true} placeholder={tt("urlEncode", lang, "resultPlaceholder")} />
      </div>
    </div>
  </div>
</div>
