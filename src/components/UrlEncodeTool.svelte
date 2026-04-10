<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let output = $state("");
  let mode = $state<"encode" | "decode">("encode");
  let encodeMode = $state<"component" | "uri" | "form">("component");
  let error = $state("");

  function formEncode(s: string): string {
    return encodeURIComponent(s).replace(/%20/g, "+");
  }

  function formDecode(s: string): string {
    return decodeURIComponent(s.replace(/\+/g, " "));
  }

  function process() {
    error = "";
    if (!input.trim()) { output = ""; return; }
    try {
      if (mode === "encode") {
        if (encodeMode === "component") output = encodeURIComponent(input);
        else if (encodeMode === "uri") output = encodeURI(input);
        else output = formEncode(input);
      } else {
        if (encodeMode === "component") output = decodeURIComponent(input);
        else if (encodeMode === "uri") output = decodeURI(input);
        else output = formDecode(input);
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
      title={tt("urlEncode", lang, "modeHint")}
      class="px-3 py-1 rounded text-xs {encodeMode === 'component' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}"
    >{tt("urlEncode", lang, "component")}</button>
    <button
      onclick={() => { encodeMode = "uri"; process(); }}
      title={tt("urlEncode", lang, "modeHint")}
      class="px-3 py-1 rounded text-xs {encodeMode === 'uri' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}"
    >{tt("urlEncode", lang, "fullUri")}</button>
    <button
      onclick={() => { encodeMode = "form"; process(); }}
      title={tt("urlEncode", lang, "modeHint")}
      class="px-3 py-1 rounded text-xs {encodeMode === 'form' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}"
    >{tt("urlEncode", lang, "form")}</button>
    <span
      class="text-xs text-[var(--color-text-muted)] cursor-help hidden md:inline"
      title={tt("urlEncode", lang, "modeHint")}
    >?</span>
    <button onclick={swap} class="px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      {t(lang, "swap")}
    </button>
    <button onclick={copy} class="ml-auto px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
      {t(lang, "copy")}
    </button>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]" aria-live="polite">{error}</div>
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
