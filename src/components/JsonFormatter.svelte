<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { uploadFile, downloadFile, friendlyError, debounce } from "../lib/fileutils";
  import { shouldUseWorker, parseInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let output = "";
  let status: "idle" | "valid" | "error" = "idle";
  let errorMsg = "";
  let indent: number | string = 2;

  function validate(text: string): { valid: boolean; error?: string; parsed?: unknown } {
    if (!text.trim()) return { valid: true };
    try {
      const parsed = JSON.parse(text);
      return { valid: true, parsed };
    } catch (e: any) {
      return { valid: false, error: friendlyError(e.message) };
    }
  }

  let processing = false;

  async function processInput(value: string) {
    if (!value.trim()) {
      status = "idle";
      output = "";
      errorMsg = "";
      return;
    }
    if (shouldUseWorker(value)) {
      processing = true;
      status = "idle";
      try {
        const result = await parseInWorker(value);
        const parsed = JSON.parse(result.output);
        status = "valid";
        errorMsg = "";
        output = JSON.stringify(parsed, null, indent);
      } catch (e: any) {
        status = "error";
        errorMsg = friendlyError(e.message);
        output = "";
      } finally {
        processing = false;
      }
    } else {
      const result = validate(value);
      if (result.valid) {
        status = "valid";
        errorMsg = "";
        output = JSON.stringify(result.parsed, null, indent);
      } else {
        status = "error";
        errorMsg = result.error || (lang === "es" ? "JSON inválido" : "Invalid JSON");
        output = "";
      }
    }
  }

  const debouncedProcess = debounce((v: string) => processInput(v), 300);

  function handleInput(value: string) {
    input = value;
    debouncedProcess(value);
  }

  function format() {
    if (!input.trim()) return;
    const result = validate(input);
    if (result.valid) {
      output = JSON.stringify(result.parsed, null, indent);
    }
  }

  function minify() {
    if (!input.trim()) return;
    const result = validate(input);
    if (result.valid) {
      output = JSON.stringify(result.parsed);
    }
  }

  function copyText(text: string) {
    if (text) navigator.clipboard.writeText(text);
  }

  function clear() {
    input = "";
    output = "";
    status = "idle";
    errorMsg = "";
  }

  function handleSample() {
    const sample = JSON.stringify(
      {
        name: "JSONCraft",
        version: "1.0.0",
        features: ["format", "validate", "convert", "diff"],
        config: {
          theme: "dark",
          indent: 2,
          clientSide: true,
        },
        stats: {
          tools: 10,
          ads: 0,
          tracking: false,
        },
      },
      null,
      2
    );
    handleInput(sample);
    input = sample;
  }

  async function handleUpload() {
    try {
      const text = await uploadFile(".json");
      handleInput(text);
      input = text;
    } catch (e: any) {
      if (e?.message && e.message !== "No file selected") {
        errorMsg = e.message;
        status = "error";
      }
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      errorMsg = tt("formatter", lang, "onlyJson");
      status = "error";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      handleInput(text);
      input = text;
    };
    reader.readAsText(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }
</script>

<div class="flex flex-col h-full" on:drop={handleDrop} on:dragover={handleDragOver} role="application">
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <button
      on:click={format}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      {t(lang, "format")}
    </button>
    <button
      on:click={minify}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "minify")}
    </button>
    <button
      on:click={handleUpload}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "upload")}
    </button>
    <button
      on:click={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "clear")}
    </button>
    <button
      on:click={handleSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>

    <div class="flex items-center gap-1 ml-auto">
      <label for="indent-select" class="text-xs text-[var(--color-text-muted)]">{t(lang, "indent")}</label>
      <select
        id="indent-select"
        bind:value={indent}
        on:change={() => handleInput(input)}
        class="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-xs rounded px-2 py-1 border border-[var(--color-border)]"
      >
        <option value={2}>{tt("formatter", lang, "spaces2")}</option>
        <option value={4}>{tt("formatter", lang, "spaces4")}</option>
        <option value={"\t"}>{tt("formatter", lang, "tab")}</option>
      </select>
    </div>

    <!-- Status indicator -->
    {#if processing}
      <span class="text-xs text-[var(--color-accent)] animate-pulse">{t(lang, "processing")}</span>
    {:else if status === "valid"}
      <span class="flex items-center gap-1 text-xs text-[var(--color-success)]">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        {t(lang, "validJson")}
      </span>
    {:else if status === "error"}
      <span class="flex items-center gap-1 text-xs text-[var(--color-error)]" title={errorMsg}>
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        {errorMsg}
      </span>
    {/if}
  </div>

  <!-- Editor panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Input panel -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="flex items-center justify-between mb-1 px-1">
        <span class="text-xs text-[var(--color-text-muted)]">{t(lang, "input")}</span>
        <button
          on:click={() => copyText(input)}
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          title={tt("formatter", lang, "copyInput")}
        >
          {t(lang, "copy")}
        </button>
      </div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder={tt("formatter", lang, "inputPlaceholder")}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <!-- Output panel -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="flex items-center justify-between mb-1 px-1">
        <span class="text-xs text-[var(--color-text-muted)]">{t(lang, "output")}</span>
        <div class="flex items-center gap-2">
          <button
            on:click={() => copyText(output)}
            class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={tt("formatter", lang, "copyOutput")}
          >
            {t(lang, "copy")}
          </button>
          <button
            on:click={() => output && downloadFile(output, "formatted.json")}
            class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={tt("formatter", lang, "downloadOutput")}
          >
            {t(lang, "download")}
          </button>
        </div>
      </div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={output} lang="json" placeholder={tt("formatter", lang, "outputPlaceholder")} readonly={true} />
      </div>
    </div>
  </div>
</div>
