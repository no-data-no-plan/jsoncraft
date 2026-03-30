import * as yaml from "js-yaml";
import * as toml from "smol-toml";
import Papa from "papaparse";

type Format = "json" | "yaml" | "toml" | "csv";

interface ConvertMsg { type: "convert"; id: number; from: Format; to: Format; input: string }
interface ParseMsg { type: "parse"; id: number; input: string }
interface DiffMsg { type: "diff"; id: number; left: string; right: string }
interface JsonPathMsg { type: "jsonpath"; id: number; input: string; path: string }
type WorkerMsg = ConvertMsg | ParseMsg | DiffMsg | JsonPathMsg;

const warnings: string[] = [];

function addWarning(msg: string) {
  warnings.push(msg);
}

// --- FLATTEN ---

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

// --- PARSE ---

function parseInput(text: string, format: Format): unknown {
  switch (format) {
    case "json": return JSON.parse(text);
    case "yaml": return parseYaml(text);
    case "toml": return toml.parse(text);
    case "csv": return parseCsv(text);
  }
}

function parseYaml(text: string): unknown {
  if (text.includes("\n---")) {
    const docs: unknown[] = [];
    yaml.loadAll(text, (doc: unknown) => docs.push(doc));
    const valid = docs.filter((d) => d !== undefined && d !== null);
    if (valid.length > 1) {
      addWarning(`Multi-document YAML: ${valid.length} documents merged into an array`);
      return valid;
    }
    if (valid.length === 1) return valid[0];
    return null;
  }
  const result = yaml.load(text);
  if (result !== null && typeof result !== "object") {
    addWarning(`YAML parsed as primitive value (${typeof result})`);
  }
  return result;
}

function parseCsv(text: string): unknown {
  const firstLine = text.split("\n")[0] || "";
  let delimiter = ",";
  if (firstLine.includes("\t") && !firstLine.includes(",")) {
    delimiter = "\t";
    addWarning("Tab-separated values detected");
  } else if (firstLine.includes(";") && !firstLine.includes(",")) {
    delimiter = ";";
    addWarning("Semicolon-separated values detected");
  }

  const withHeaders = Papa.parse(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimiter,
  });

  if (withHeaders.meta.fields && withHeaders.meta.fields.length > 0) {
    const allNumericHeaders = withHeaders.meta.fields.every((f: string) => /^\d+(\.\d+)?$/.test(f.trim()));
    if (allNumericHeaders) {
      addWarning("Headers look numeric — parsed without headers, columns named col1, col2, etc.");
      const noHeaders = Papa.parse(text, { header: false, dynamicTyping: true, skipEmptyLines: true, delimiter });
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
  const fields = withHeaders.meta.fields || [];

  if (rows.length === 1 && fields.length === 1) {
    const val = rows[0][fields[0]];
    if (typeof val === "string" && /^\s*[\{\[]/.test(val)) {
      try {
        const parsed = JSON.parse(val);
        addWarning("Cell contained embedded JSON — extracted and parsed");
        return parsed;
      } catch { /* keep as string */ }
    }
  }

  let jsonCellCount = 0;
  rows = rows.map((row) => {
    const newRow: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(row)) {
      if (typeof val === "string" && /^\s*[\{\[]/.test(val)) {
        try { newRow[key] = JSON.parse(val); jsonCellCount++; } catch { newRow[key] = val; }
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

// --- FORMAT OUTPUT ---

function formatOutput(data: unknown, format: Format): string {
  switch (format) {
    case "json": return JSON.stringify(data, null, 2);
    case "yaml": return formatToYaml(data);
    case "toml": return formatToToml(data);
    case "csv": return jsonToCsv(data);
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
    if (_tomlNullCount <= 3) addWarning(`null replaced with ""${path ? ` (at ${path})` : ""}`);
    else if (_tomlNullCount === 4) addWarning("...and more null values");
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
    addWarning('Null value wrapped as value = ""');
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

function jsonToCsv(data: unknown): string {
  if (data === null || typeof data !== "object") {
    addWarning("Primitive value wrapped as single-cell CSV");
    return Papa.unparse([{ value: data }]);
  }
  if (!Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 1 && Array.isArray(obj[keys[0]])) {
      const inner = obj[keys[0]] as unknown[];
      if (inner.length > 0 && inner.some((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
        addWarning(`Array extracted from "${keys[0]}" key`);
        return jsonToCsv(inner);
      }
    }
    addWarning("Single object converted to one-row CSV (nested keys flattened)");
    return Papa.unparse([flatten(data)]);
  }
  if (data.length === 0) { addWarning("Empty array produces empty CSV"); return ""; }
  if (data.every((item: unknown) => item === null || typeof item !== "object")) {
    addWarning("Array of primitives converted to single-column CSV");
    return Papa.unparse(data.map((v: unknown) => ({ value: v })));
  }
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
  const flattened = data.map((item: unknown) => {
    if (item === null || typeof item !== "object") return { value: item };
    return flatten(item);
  });
  const hasNested = data.some((item: unknown) =>
    item !== null && typeof item === "object" && !Array.isArray(item) &&
    Object.values(item as Record<string, unknown>).some((v) => v !== null && typeof v === "object")
  );
  if (hasNested) addWarning("Nested objects flattened with dot notation (e.g. server.host)");
  return Papa.unparse(flattened);
}

// --- HANDLER ---

self.onmessage = async (e: MessageEvent<WorkerMsg>) => {
  const msg = e.data;
  warnings.length = 0;

  try {
    switch (msg.type) {
      case "convert": {
        const data = parseInput(msg.input, msg.from);
        if (data === undefined) {
          self.postMessage({ type: "result", id: msg.id, output: "", warnings: [] });
          return;
        }
        const output = formatOutput(data, msg.to);
        self.postMessage({ type: "result", id: msg.id, output, warnings: [...warnings] });
        break;
      }
      case "parse": {
        const parsed = JSON.parse(msg.input);
        self.postMessage({ type: "result", id: msg.id, output: JSON.stringify(parsed), warnings: [] });
        break;
      }
      case "diff": {
        const { diffJson } = await import("diff");
        const leftParsed = JSON.parse(msg.left);
        const rightParsed = JSON.parse(msg.right);
        const result = diffJson(leftParsed as object, rightParsed as object);
        self.postMessage({ type: "result", id: msg.id, output: JSON.stringify(result), warnings: [] });
        break;
      }
      case "jsonpath": {
        const { JSONPath } = await import("jsonpath-plus");
        const parsed = JSON.parse(msg.input);
        const matches = JSONPath({ path: msg.path, json: parsed });
        self.postMessage({ type: "result", id: msg.id, output: JSON.stringify(matches, null, 2), matchCount: matches.length, warnings: [] });
        break;
      }
    }
  } catch (err: any) {
    self.postMessage({ type: "error", id: msg.id, error: err.message || "Unknown error" });
  }
};
