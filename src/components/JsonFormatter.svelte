<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import UndoToast from "./UndoToast.svelte";
  import { uploadFile, downloadFile, friendlyError, debounce, stripBom } from "../lib/fileutils";
  import { shouldUseWorker, parseInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let output = $state("");
  let status = $state<"idle" | "valid" | "error">("idle");
  let errorMsg = $state("");
  let indent = $state<number | string>(2);

  function validate(text: string): { valid: boolean; error?: string; parsed?: unknown } {
    if (!text.trim()) return { valid: true };
    try {
      const parsed = JSON.parse(stripBom(text));
      return { valid: true, parsed };
    } catch (e: any) {
      return { valid: false, error: friendlyError(e.message) };
    }
  }

  let processing = $state(false);

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

  // Undo-toast state for destructive Clear (Nielsen audit 2026-04-30, F2).
  // Snapshot of the editor state so undo can fully restore.
  let undoSnapshot = $state<{ input: string; output: string; status: typeof status; errorMsg: string } | null>(null);
  let toastVisible = $state(false);

  function clear() {
    // Skip the snapshot dance if there's nothing to lose.
    if (!input && !output) {
      input = "";
      output = "";
      status = "idle";
      errorMsg = "";
      return;
    }
    undoSnapshot = { input, output, status, errorMsg };
    input = "";
    output = "";
    status = "idle";
    errorMsg = "";
    toastVisible = true;
  }

  function undoClear() {
    if (!undoSnapshot) return;
    input = undoSnapshot.input;
    output = undoSnapshot.output;
    status = undoSnapshot.status;
    errorMsg = undoSnapshot.errorMsg;
    undoSnapshot = null;
    toastVisible = false;
  }

  function dismissUndo() {
    undoSnapshot = null;
    toastVisible = false;
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

  // Global Ctrl/Cmd+Enter accelerator (Nielsen audit Phase 6, JC F4):
  // expose the muscle-memory shortcut from JSONLint / JSON-Crack so power
  // users can format without reaching for the button. Mounted via $effect
  // with proper cleanup.
  $effect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        format();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Detect platform to render the right modifier glyph in <kbd> hints.
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const modKey = isMac ? "⌘" : "Ctrl";
</script>

<div class="flex flex-col h-full" ondrop={handleDrop} ondragover={handleDragOver}>
  <!-- Toolbar -->
  <div
    class="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <button
      onclick={format}
      title={`${t(lang, "format")} (${modKey}+Enter)`}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors inline-flex items-center gap-1.5"
    >
      <span>{t(lang, "format")}</span>
      <kbd class="hidden sm:inline px-1 py-0.5 rounded text-[10px] font-mono bg-white/20" aria-hidden="true">{modKey}+Enter</kbd>
    </button>
    <button
      onclick={minify}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "minify")}
    </button>
    <button
      onclick={handleUpload}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "upload")}
    </button>
    <button
      onclick={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "clear")}
    </button>
    <button
      onclick={handleSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>

    <div class="flex items-center gap-1 ml-auto">
      <label for="indent-select" class="text-xs text-[var(--color-text-muted)]">{t(lang, "indent")}</label>
      <select
        id="indent-select"
        bind:value={indent}
        onchange={() => handleInput(input)}
        class="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-xs rounded px-2 py-1 border border-[var(--color-border)]"
      >
        <option value={2}>{tt("formatter", lang, "spaces2")}</option>
        <option value={4}>{tt("formatter", lang, "spaces4")}</option>
        <option value={"\t"}>{tt("formatter", lang, "tab")}</option>
      </select>
    </div>

    <!-- Status indicator -->
    <span aria-live="polite">
    {#if processing}
      <span class="text-xs text-[var(--color-accent-fg)] animate-pulse">{t(lang, "processing")}</span>
    {:else if status === "valid"}
      <span class="flex items-center gap-1 text-xs text-[var(--color-success)]">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        {errorMsg}
      </span>
    {/if}
    </span>
  </div>

  <!-- Editor panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Input panel -->
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="flex items-center justify-between mb-1 px-1">
        <span class="text-xs text-[var(--color-text-muted)]">{t(lang, "input")}</span>
        <button
          onclick={() => copyText(input)}
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
            onclick={() => copyText(output)}
            class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={tt("formatter", lang, "copyOutput")}
          >
            {t(lang, "copy")}
          </button>
          <button
            onclick={() => output && downloadFile(output, "formatted.json")}
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

<UndoToast
  visible={toastVisible}
  message={t(lang, "cleared")}
  key={undoSnapshot}
  onUndo={undoClear}
  onDismiss={dismissUndo}
  {lang}
/>
