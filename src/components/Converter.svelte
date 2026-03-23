<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import * as yaml from "js-yaml";
  import * as toml from "smol-toml";
  import Papa from "papaparse";

  export let fromFormat: "json" | "yaml" | "toml" | "csv" = "json";
  export let toFormat: "json" | "yaml" | "toml" | "csv" = "yaml";

  let input = "";
  let output = "";
  let error = "";

  const formatLabels: Record<string, string> = {
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    csv: "CSV",
  };

  const langMap: Record<string, "json" | "yaml" | "text"> = {
    json: "json",
    yaml: "yaml",
    toml: "text",
    csv: "text",
  };

  function parseInput(text: string): unknown {
    if (!text.trim()) return undefined;
    switch (fromFormat) {
      case "json":
        return JSON.parse(text);
      case "yaml":
        return yaml.load(text);
      case "toml":
        return toml.parse(text);
      case "csv": {
        const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
        if (result.errors.length > 0) throw new Error(result.errors[0].message);
        return result.data;
      }
      default:
        throw new Error(`Unsupported input format: ${fromFormat}`);
    }
  }

  function formatOutput(data: unknown): string {
    switch (toFormat) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "yaml":
        return yaml.dump(data, { indent: 2, lineWidth: 120 });
      case "toml":
        return toml.stringify(data as Record<string, unknown>);
      case "csv": {
        if (!Array.isArray(data)) throw new Error("CSV output requires a JSON array of objects");
        return Papa.unparse(data);
      }
      default:
        throw new Error(`Unsupported output format: ${toFormat}`);
    }
  }

  function convert() {
    error = "";
    output = "";
    if (!input.trim()) return;
    try {
      const data = parseInput(input);
      output = formatOutput(data);
    } catch (e: any) {
      error = e.message;
    }
  }

  function handleInput(value: string) {
    input = value;
    convert();
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }

  function clear() {
    input = "";
    output = "";
    error = "";
  }

  function loadSample() {
    switch (fromFormat) {
      case "json":
        input = JSON.stringify(
          {
            server: { host: "localhost", port: 8080 },
            database: { url: "postgres://localhost/db", pool_size: 5 },
            features: ["auth", "logging", "cache"],
          },
          null,
          2
        );
        break;
      case "yaml":
        input = `server:
  host: localhost
  port: 8080
database:
  url: postgres://localhost/db
  pool_size: 5
features:
  - auth
  - logging
  - cache`;
        break;
      case "toml":
        input = `[server]
host = "localhost"
port = 8080

[database]
url = "postgres://localhost/db"
pool_size = 5

features = ["auth", "logging", "cache"]`;
        break;
      case "csv":
        input = `name,age,city,active
Alice,30,London,true
Bob,25,Paris,false
Charlie,35,Berlin,true`;
        break;
    }
    convert();
  }
</script>

<div class="flex flex-col h-full">
  <!-- Toolbar -->
  <div
    class="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
  >
    <button
      on:click={convert}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
    >
      Convert
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
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      Sample
    </button>
    {#if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {/if}
  </div>

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{formatLabels[fromFormat]} Input</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang={langMap[fromFormat]}
          placeholder={`Paste your ${formatLabels[fromFormat]} here...`}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="text-xs text-[var(--color-text-muted)] mb-1 px-1">{formatLabels[toFormat]} Output</div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={output}
          lang={langMap[toFormat]}
          placeholder={`${formatLabels[toFormat]} output will appear here...`}
          readonly={true}
        />
      </div>
    </div>
  </div>
</div>
