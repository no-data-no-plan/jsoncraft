<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { uploadFile, downloadFile, friendlyError, debounce } from "../lib/fileutils";
  import { shouldUseWorker, convertInWorker } from "../lib/worker-api";
  import * as yaml from "js-yaml";
  import * as toml from "smol-toml";
  import Papa from "papaparse";

  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  export let lang: Lang = "en";
  export let fromFormat: "json" | "yaml" | "toml" | "csv" = "json";
  export let toFormat: "json" | "yaml" | "toml" | "csv" = "yaml";

  let input = "";
  let output = "";
  let error = "";
  let warning = "";
  let wrongFormatHint: { message: string; linkHref?: string; linkText?: string } | null = null;

  function flatten(obj: unknown, prefix = ""): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (obj === null || obj === undefined || typeof obj !== "object") {
      result[prefix || "value"] = obj;
      return result;
    }
    if (Array.isArray(obj)) {
      result[prefix || "value"] = JSON.stringify(obj);
      return result;
    }
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(result, flatten(val, fullKey));
      } else if (Array.isArray(val)) {
        result[fullKey] = JSON.stringify(val);
      } else {
        result[fullKey] = val;
      }
    }
    return result;
  }

  function addWarning(msg: string) {
    warning = warning ? warning + ". " + msg : msg;
  }

  function jsonToCsv(data: unknown): string {

    // Primitive value
    if (data === null || typeof data !== "object") {
      addWarning("Primitive value wrapped as single-cell CSV");
      return Papa.unparse([{ value: data }]);
    }

    // Single object (not array) — check if it wraps an array (common API pattern)
    if (!Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj);
      // If single key holding an array of objects, unwrap it
      if (keys.length === 1 && Array.isArray(obj[keys[0]])) {
        const inner = obj[keys[0]] as unknown[];
        if (inner.length > 0 && inner.some((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
          addWarning(`Array extracted from "${keys[0]}" key`);
          return jsonToCsv(inner);
        }
      }
      // Otherwise flatten as a single row
      addWarning("Single object converted to one-row CSV (nested keys flattened)");
      return Papa.unparse([flatten(data)]);
    }

    // Empty array
    if (data.length === 0) {
      addWarning("Empty array produces empty CSV");
      return "";
    }

    // Array of primitives
    if (data.every((item: unknown) => item === null || typeof item !== "object")) {
      addWarning("Array of primitives converted to single-column CSV");
      return Papa.unparse(data.map((v: unknown) => ({ value: v })));
    }

    // Array of arrays
    if (data.every((item: unknown) => Array.isArray(item))) {
      addWarning("Array of arrays: first row used as headers (if strings), otherwise indexed columns");
      const first = data[0] as unknown[];
      const isHeaderRow = first.every((v: unknown) => typeof v === "string");
      if (isHeaderRow) {
        const headers = first as string[];
        const rows = data.slice(1).map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          headers.forEach((h, i) => (obj[h] = row[i] ?? ""));
          return obj;
        });
        return Papa.unparse(rows);
      }
      return Papa.unparse(data as unknown[][], { header: false });
    }

    // Array of objects — flatten each, merge all keys
    const flattened = data.map((item: unknown) => {
      if (item === null || typeof item !== "object") {
        return { value: item };
      }
      return flatten(item);
    });

    const hasNested = data.some((item: unknown) =>
      item !== null && typeof item === "object" && !Array.isArray(item) &&
      Object.values(item as Record<string, unknown>).some(
        (v) => v !== null && typeof v === "object"
      )
    );
    if (hasNested) {
      addWarning("Nested objects flattened with dot notation (e.g. server.host)");
    }

    return Papa.unparse(flattened);
  }

  const formatLabels: Record<string, string> = {
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    csv: "CSV",
  };

  const extMap: Record<string, string> = {
    json: ".json",
    yaml: ".yaml,.yml",
    toml: ".toml",
    csv: ".csv",
  };

  const downloadExtMap: Record<string, string> = {
    json: "output.json",
    yaml: "output.yaml",
    toml: "output.toml",
    csv: "output.csv",
  };

  const langMap: Record<string, "json" | "yaml" | "text"> = {
    json: "json",
    yaml: "yaml",
    toml: "text",
    csv: "text",
  };

  // --- FORMAT DETECTION ---

  function detectFormat(text: string): "json" | "yaml" | "toml" | "csv" | null {
    const trimmed = text.trim();
    // TOML: check BEFORE JSON because [section] starts with [ like JSON arrays
    if (/^\s*\[[\w.-]+\]\s*$/m.test(trimmed) && /^\s*\w[\w.-]*\s*=\s*.+/m.test(trimmed)) return "toml";
    if (/^\s*\w[\w.-]*\s*=\s*.+/m.test(trimmed) && !/^\s*[\{\[]/.test(trimmed)) return "toml";
    // JSON: starts with { or [
    if (/^\s*[\{\[]/.test(trimmed)) return "json";
    // YAML: has key: value patterns or starts with ---
    if (/^---\s*$/m.test(trimmed) || /^\s*[\w-]+:\s+.+/m.test(trimmed)) return "yaml";
    // CSV: multiple lines with consistent comma/semicolon/tab separation
    const lines = trimmed.split("\n").filter((l) => l.trim());
    if (lines.length >= 2) {
      const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
      const counts = lines.slice(0, 5).map((l) => l.split(sep).length);
      if (counts[0] >= 2 && counts.every((c) => c === counts[0])) return "csv";
    }
    return null;
  }

  const formatNames: Record<string, string> = {
    json: "JSON",
    yaml: "YAML",
    toml: "TOML",
    csv: "CSV",
  };

  // Maps detected format → target format → converter page
  const suggestPaths: Record<string, Record<string, string>> = {
    json: { yaml: "/json-to-yaml", toml: "/json-to-toml", csv: "/json-to-csv" },
    yaml: { json: "/yaml-to-json" },
    toml: { json: "/toml-to-json" },
    csv: { json: "/csv-to-json" },
  };

  function checkWrongFormat(text: string): void {
    const detected = detectFormat(text);
    if (!detected || detected === fromFormat) return;
    // Find the best converter page to suggest
    const exactPath = suggestPaths[detected]?.[toFormat];
    const fallbackPath = suggestPaths[detected]?.json;
    // Also check reverse: if user wants toFormat=json and detected has a json path
    const toJsonPath = suggestPaths[detected]?.json;
    const es = lang === "es";
    const base = es
      ? `Esto parece ${formatNames[detected]}, no ${formatNames[fromFormat]}.`
      : `This looks like ${formatNames[detected]}, not ${formatNames[fromFormat]}.`;
    const tryWord = es ? " Prueba" : " Try";
    if (exactPath) {
      wrongFormatHint = { message: base + tryWord, linkHref: exactPath, linkText: `${formatNames[detected]} a ${formatNames[toFormat]}` };
    } else if (toJsonPath && toFormat === "json") {
      wrongFormatHint = { message: base + tryWord, linkHref: toJsonPath, linkText: `${formatNames[detected]} a JSON` };
    } else if (fallbackPath) {
      wrongFormatHint = { message: base + tryWord, linkHref: fallbackPath, linkText: `${formatNames[detected]} a JSON` };
    } else {
      wrongFormatHint = { message: base };
    }
  }

  // --- PARSE INPUT (robust) ---

  function parseInput(text: string): unknown {
    if (!text.trim()) return undefined;
    wrongFormatHint = null;
    switch (fromFormat) {
      case "json":
        return JSON.parse(text);
      case "yaml":
        return parseYaml(text);
      case "toml":
        return toml.parse(text);
      case "csv":
        return parseCsv(text);
      default:
        throw new Error(`Unsupported input format: ${fromFormat}`);
    }
  }

  function parseYaml(text: string): unknown {
    // Multi-document YAML (separated by ---)
    if (text.includes("\n---")) {
      const docs: unknown[] = [];
      yaml.loadAll(text, (doc: unknown) => docs.push(doc));
      const valid = docs.filter((d) => d !== undefined && d !== null);
      if (valid.length > 1) {
        warning = `Multi-document YAML: ${valid.length} documents merged into an array`;
        return valid;
      }
      if (valid.length === 1) return valid[0];
      return null;
    }
    const result = yaml.load(text);
    // YAML can parse bare strings/numbers as primitives
    if (result !== null && typeof result !== "object") {
      warning = `YAML parsed as primitive value (${typeof result})`;
    }
    return result;
  }

  function parseCsv(text: string): unknown {
    // Auto-detect delimiter: try tab, semicolon, comma
    const firstLine = text.split("\n")[0] || "";
    let delimiter = ",";
    if (firstLine.includes("\t") && !firstLine.includes(",")) {
      delimiter = "\t";
      warning = "Tab-separated values detected";
    } else if (firstLine.includes(";") && !firstLine.includes(",")) {
      delimiter = ";";
      warning = "Semicolon-separated values detected";
    }

    // Try with headers first
    const withHeaders = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter,
    });

    // Check if headers look like data (all numeric) -> might be headerless
    if (withHeaders.meta.fields && withHeaders.meta.fields.length > 0) {
      const allNumericHeaders = withHeaders.meta.fields.every((f: string) => /^\d+(\.\d+)?$/.test(f.trim()));
      if (allNumericHeaders) {
        warning = (warning ? warning + ". " : "") + "Headers look numeric — parsed without headers, columns named col1, col2, etc.";
        const noHeaders = Papa.parse(text, {
          header: false,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimiter,
        });
        return (noHeaders.data as unknown[][]).map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          row.forEach((val, i) => (obj[`col${i + 1}`] = val));
          return obj;
        });
      }
    }

    if (withHeaders.errors.length > 0 && withHeaders.data.length === 0) {
      throw new Error(withHeaders.errors[0].message);
    }
    if (withHeaders.errors.length > 0) {
      addWarning(`${withHeaders.errors.length} row(s) had parse warnings`);
    }

    let rows = withHeaders.data as Record<string, unknown>[];

    // Smart unwrap: if a single-column CSV cell contains a JSON array/object, parse it
    const fields = withHeaders.meta.fields || [];
    if (rows.length === 1 && fields.length === 1) {
      const val = rows[0][fields[0]];
      if (typeof val === "string" && /^\s*[\{\[]/.test(val)) {
        try {
          const parsed = JSON.parse(val);
          addWarning(`Cell contained embedded JSON — extracted and parsed`);
          return parsed;
        } catch {}
      }
    }

    // Also try to parse any string cell values that look like JSON arrays/objects
    let jsonCellCount = 0;
    rows = rows.map((row) => {
      const newRow: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(row)) {
        if (typeof val === "string" && /^\s*[\{\[]/.test(val)) {
          try {
            newRow[key] = JSON.parse(val);
            jsonCellCount++;
          } catch {
            newRow[key] = val;
          }
        } else {
          newRow[key] = val;
        }
      }
      return newRow;
    });
    if (jsonCellCount > 0) {
      addWarning(`${jsonCellCount} cell(s) contained embedded JSON — parsed automatically`);
    }

    return rows;
  }

  // --- FORMAT OUTPUT (robust) ---

  function formatOutput(data: unknown): string {
    switch (toFormat) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "yaml":
        return formatToYaml(data);
      case "toml":
        return formatToToml(data);
      case "csv":
        return jsonToCsv(data);
      default:
        throw new Error(`Unsupported output format: ${toFormat}`);
    }
  }

  function formatToYaml(data: unknown): string {
    if (data === undefined || data === null) {
      addWarning("Null/empty value converted to YAML null");
      return "null\n";
    }
    if (typeof data !== "object") {
      addWarning(`Primitive value (${typeof data}) converted to YAML`);
    }
    return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true });
  }

  let _tomlNullCount = 0;

  function sanitizeForToml(obj: unknown, path = "", isRoot = true): unknown {
    if (isRoot) _tomlNullCount = 0;

    if (obj === null || obj === undefined) {
      _tomlNullCount++;
      if (_tomlNullCount <= 3) {
        addWarning(`null replaced with ""${path ? ` (at ${path})` : ""}`);
      } else if (_tomlNullCount === 4) {
        addWarning("...and more null values");
      }
      return "";
    }
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
      if (obj.length === 0) return [];
      const types = new Set(obj.map((item) => {
        if (item === null || item === undefined) return "null";
        if (typeof item === "object" && !Array.isArray(item)) return "object";
        if (Array.isArray(item)) return "array";
        return typeof item;
      }));
      // Mixed types (including objects+primitives) → convert all to strings
      if (types.size > 1) {
        addWarning(`Mixed-type array converted to strings${path ? ` (at ${path})` : ""}`);
        return obj.map((item) => {
          if (item === null || item === undefined) return "";
          if (typeof item === "object") return JSON.stringify(item);
          return String(item);
        });
      }
      return obj.map((item, i) => sanitizeForToml(item, `${path}[${i}]`, false));
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeForToml(val, path ? `${path}.${key}` : key, false);
    }
    return result;
  }

  function formatToToml(data: unknown): string {
    if (data === null || data === undefined) {
      addWarning("Null value wrapped as value = \"\"");
      return 'value = ""\n';
    }
    if (typeof data !== "object") {
      addWarning(`Primitive ${typeof data} wrapped in [value] key`);
      return toml.stringify({ value: data } as Record<string, unknown>);
    }

    let prefix = "";
    let tomlData: unknown;
    if (Array.isArray(data)) {
      prefix = "# Array wrapped in [items] (TOML requires a root object)\n\n";
      addWarning("Root array wrapped in 'items' key");
      tomlData = { items: sanitizeForToml(data) };
    } else {
      tomlData = sanitizeForToml(data);
    }

    return prefix + toml.stringify(tomlData as Record<string, unknown>);
  }

  let processing = false;

  async function convert() {
    error = "";
    output = "";
    warning = "";
    wrongFormatHint = null;
    if (!input.trim()) return;

    // For lenient parsers, check if input looks like another format
    if (fromFormat === "csv" || fromFormat === "yaml") {
      checkWrongFormat(input);
      if (wrongFormatHint) return;
    }

    if (shouldUseWorker(input)) {
      processing = true;
      try {
        const result = await convertInWorker(input, fromFormat, toFormat);
        output = result.output;
        if (result.warnings.length) warning = result.warnings.join(". ");
      } catch (e: any) {
        error = friendlyError(e.message);
        checkWrongFormat(input);
      } finally {
        processing = false;
      }
    } else {
      try {
        const data = parseInput(input);
        output = formatOutput(data);
      } catch (e: any) {
        error = friendlyError(e.message);
        checkWrongFormat(input);
      }
    }
  }

  const debouncedConvert = debounce(() => convert(), 300);

  function handleInput(value: string) {
    input = value;
    debouncedConvert();
  }

  function copyText(text: string) {
    if (text) navigator.clipboard.writeText(text);
  }

  function clear() {
    input = "";
    output = "";
    error = "";
    warning = "";
    wrongFormatHint = null;
  }

  async function handleUpload() {
    try {
      const text = await uploadFile(extMap[fromFormat]);
      input = text;
      convert();
    } catch (e: any) {
      if (e?.message && e.message !== "No file selected") {
        error = e.message;
      }
    }
  }

  function handleDownload() {
    if (output) downloadFile(output, downloadExtMap[toFormat]);
  }

  function loadSample() {
    switch (fromFormat) {
      case "json":
        input = JSON.stringify(
          toFormat === "csv"
            ? [
                { name: "Alice", age: 30, city: "London", active: true },
                { name: "Bob", age: 25, city: "Paris", active: false },
                { name: "Charlie", age: 35, city: "Berlin", active: true },
              ]
            : {
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
      {t(lang, "convert")}
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
      on:click={loadSample}
      class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
    >
      {t(lang, "sample")}
    </button>
    {#if processing}
      <span class="text-xs text-[var(--color-accent)] ml-auto animate-pulse">{t(lang, "processingLarge")}</span>
    {:else if wrongFormatHint}
      <span class="text-xs text-[var(--color-warning)] ml-auto">
        {wrongFormatHint.message}
        {#if wrongFormatHint.linkHref}
          <a href={wrongFormatHint.linkHref} class="underline">{wrongFormatHint.linkText}</a>{lang === "es" ? "." : " instead."}
        {/if}
      </span>
    {:else if error}
      <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
    {:else if warning}
      <span class="text-xs text-[var(--color-warning)] ml-auto">{warning}</span>
    {/if}
  </div>

  <!-- Panels -->
  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="flex items-center justify-between mb-1 px-1">
        <span class="text-xs text-[var(--color-text-muted)]">{formatLabels[fromFormat]} {t(lang, "input")}</span>
        <button
          on:click={() => copyText(input)}
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          title={tt("converter", lang, "copyInput")}
        >
          {t(lang, "copy")}
        </button>
      </div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={input}
          lang={langMap[fromFormat]}
          placeholder={lang === "es" ? `Pega tu ${formatLabels[fromFormat]} aquí...` : `Paste your ${formatLabels[fromFormat]} here...`}
          onchange={handleInput}
        />
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <div class="flex-1 flex flex-col min-h-0 p-2">
      <div class="flex items-center justify-between mb-1 px-1">
        <span class="text-xs text-[var(--color-text-muted)]">{formatLabels[toFormat]} {t(lang, "output")}</span>
        <div class="flex items-center gap-2">
          <button
            on:click={() => copyText(output)}
            class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={tt("converter", lang, "copyOutput")}
          >
            {t(lang, "copy")}
          </button>
          <button
            on:click={handleDownload}
            class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title={tt("converter", lang, "downloadOutput")}
          >
            {t(lang, "download")}
          </button>
        </div>
      </div>
      <div class="flex-1 min-h-0">
        <CodeEditor
          value={output}
          lang={langMap[toFormat]}
          placeholder={lang === "es" ? `La salida ${formatLabels[toFormat]} aparecerá aquí...` : `${formatLabels[toFormat]} output will appear here...`}
          readonly={true}
        />
      </div>
    </div>
  </div>
</div>
