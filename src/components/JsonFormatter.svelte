<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";

  let input = "";
  let output = "";
  let status: "idle" | "valid" | "error" = "idle";
  let errorMsg = "";
  let indent = 2;

  function validate(text: string): { valid: boolean; error?: string; parsed?: unknown } {
    if (!text.trim()) return { valid: true };
    try {
      const parsed = JSON.parse(text);
      return { valid: true, parsed };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  }

  function handleInput(value: string) {
    input = value;
    if (!value.trim()) {
      status = "idle";
      output = "";
      errorMsg = "";
      return;
    }
    const result = validate(value);
    if (result.valid) {
      status = "valid";
      errorMsg = "";
      output = JSON.stringify(result.parsed, null, indent);
    } else {
      status = "error";
      errorMsg = result.error || "Invalid JSON";
      output = "";
    }
  }

  function format() {
    if (!input.trim()) return;
    const result = validate(input);
    if (result.valid) {
      output = JSON.stringify(result.parsed, null, indent);
      input = output;
    }
  }

  function minify() {
    if (!input.trim()) return;
    const result = validate(input);
    if (result.valid) {
      const minified = JSON.stringify(result.parsed);
      output = minified;
      input = minified;
    }
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
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

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && (file.type === "application/json" || file.name.endsWith(".json"))) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        handleInput(text);
        input = text;
      };
      reader.readAsText(file);
    }
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
      Format
    </button>
    <button
      on:click={minify}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Minify
    </button>
    <button
      on:click={copyOutput}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Copy
    </button>
    <button
      on:click={clear}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Clear
    </button>
    <button
      on:click={handleSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Sample
    </button>

    <div class="flex items-center gap-1 ml-auto">
      <label for="indent-select" class="text-xs text-[var(--color-text-muted)]">Indent:</label>
      <select
        id="indent-select"
        bind:value={indent}
        on:change={() => handleInput(input)}
        class="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-xs rounded px-2 py-1 border border-[var(--color-border)]"
      >
        <option value={2}>2 spaces</option>
        <option value={4}>4 spaces</option>
        <option value={1}>1 tab</option>
      </select>
    </div>

    <!-- Status indicator -->
    {#if status === "valid"}
      <span class="flex items-center gap-1 text-xs text-[var(--color-success)]">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        Valid JSON
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
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Input</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang="json"
          placeholder="Paste your JSON here, or drag & drop a .json file..."
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">Output</div>
      <div class="flex-1 min-h-0">
        <CodeEditor value={output} lang="json" placeholder="Formatted output will appear here..." readonly={true} />
      </div>
    </div>
  </div>
</div>
