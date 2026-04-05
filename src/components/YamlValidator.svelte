<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { uploadFile, stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import * as yaml from "js-yaml";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let status: "idle" | "valid" | "error" = "idle";
  let errorMsg = "";
  let docCount = 0;
  let parsedPreview = "";

  function validate(text: string) {
    if (!text.trim()) {
      status = "idle";
      errorMsg = "";
      parsedPreview = "";
      docCount = 0;
      return;
    }

    try {
      const docs = yaml.loadAll(stripBom(text));
      docCount = docs.length;
      parsedPreview = docs.length === 1
        ? JSON.stringify(docs[0], null, 2)
        : JSON.stringify(docs, null, 2);
      status = "valid";
      errorMsg = "";
    } catch (e: any) {
      status = "error";
      const mark = e.mark;
      if (mark) {
        errorMsg = `${e.reason || e.message} (${tt("yamlValidator", lang, "line")} ${mark.line + 1}, ${tt("yamlValidator", lang, "column")} ${mark.column + 1})`;
      } else {
        errorMsg = e.message;
      }
      parsedPreview = "";
      docCount = 0;
    }
  }

  function handleInput(val: string) {
    input = val;
    validate(val);
  }

  async function upload() {
    const text = await uploadFile(".yaml,.yml");
    if (text) { input = text; validate(text); }
  }

  function copySample() {
    input = `# Server configuration
server:
  host: localhost
  port: 8080
  ssl: true

database:
  driver: postgres
  host: db.example.com
  port: 5432
  name: myapp
  credentials:
    user: admin
    password: secret123

logging:
  level: info
  format: json
  outputs:
    - stdout
    - file: /var/log/app.log`;
    validate(input);
  }

  function copyParsed() {
    if (parsedPreview) navigator.clipboard.writeText(parsedPreview);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button onclick={upload} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "upload")}</button>
    <button onclick={copySample} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "sample")}</button>
    <button onclick={() => { input = ""; status = "idle"; errorMsg = ""; parsedPreview = ""; docCount = 0; }} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "clear")}</button>
    {#if status === "valid"}
      <span class="ml-2 text-xs text-green-400">{tt("yamlValidator", lang, "validYaml")} ({docCount} {docCount === 1 ? tt("yamlValidator", lang, "document") : tt("yamlValidator", lang, "documents")})</span>
    {:else if status === "error"}
      <span class="ml-2 text-xs text-red-400">{tt("yamlValidator", lang, "invalidYaml")}</span>
    {/if}
    <div class="ml-auto flex items-center gap-2">
      {#if parsedPreview}
        <button onclick={copyParsed} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "copy")} JSON</button>
      {/if}
    </div>
  </div>

  {#if errorMsg}
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]">{errorMsg}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">YAML {t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="yaml" placeholder={tt("yamlValidator", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">JSON {t(lang, "output")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={parsedPreview} lang="json" readonly placeholder={tt("yamlValidator", lang, "outputPlaceholder")} />
      </div>
    </div>
  </div>
</div>
