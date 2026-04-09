import * as yaml from "js-yaml";
import * as toml from "smol-toml";
import Papa from "papaparse";
import { stripBom } from "./fileutils";
import type { Format } from "./converter-config";
import type { Lang } from "../i18n/index";

const warnMap: Record<string, string> = {
  "Primitive value wrapped as single-cell CSV": "Valor primitivo envuelto como CSV de una celda",
  "Single object converted to one-row CSV (nested keys flattened)": "Objeto convertido a CSV de una fila (claves anidadas aplanadas)",
  "Empty array produces empty CSV": "Array vacío produce CSV vacío",
  "Array of primitives converted to single-column CSV": "Array de primitivos convertido a CSV de una columna",
  "Array of arrays: first row used as headers (if strings), otherwise indexed columns": "Array de arrays: primera fila usada como encabezados (si son strings), o columnas indexadas",
  "Nested objects flattened with dot notation (e.g. server.host)": "Objetos anidados aplanados con notación de punto (ej. server.host)",
  "Tab-separated values detected": "Valores separados por tabulación detectados",
  "Semicolon-separated values detected": "Valores separados por punto y coma detectados",
  "Null/empty value converted to YAML null": "Valor nulo/vacío convertido a YAML null",
  "Root array wrapped in 'items' key": "Array raíz envuelto en clave 'items'",
  "...and more null values": "...y más valores nulos",
};

export interface ConversionResult {
  output: string;
  warning: string;
}

export class ConversionEngine {
  private warnings: string[] = [];
  private lang: Lang;
  private tomlNullCount = 0;

  constructor(lang: Lang) {
    this.lang = lang;
  }

  convert(input: string, fromFormat: Format, toFormat: Format): ConversionResult {
    this.warnings = [];
    if (!input.trim()) return { output: "", warning: "" };

    const data = this.parseInput(input, fromFormat);
    const output = this.formatOutput(data, toFormat);
    return { output, warning: this.warnings.join(". ") };
  }

  // --- warnings ---

  private addWarning(msg: string) {
    this.warnings.push(msg);
  }

  private tw(en: string): string {
    return this.lang === "es" ? (warnMap[en] ?? en) : en;
  }

  // --- flatten ---

  private flatten(obj: unknown, prefix = ""): Record<string, unknown> {
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
        Object.assign(result, this.flatten(val, fullKey));
      } else if (Array.isArray(val)) {
        result[fullKey] = JSON.stringify(val);
      } else {
        result[fullKey] = val;
      }
    }
    return result;
  }

  // --- parse ---

  private parseInput(text: string, format: Format): unknown {
    const clean = stripBom(text);
    switch (format) {
      case "json": return JSON.parse(clean);
      case "yaml": return this.parseYaml(clean);
      case "toml": return toml.parse(clean);
      case "csv": return this.parseCsv(clean);
      default: throw new Error(`Unsupported input format: ${format}`);
    }
  }

  private parseYaml(text: string): unknown {
    if (text.includes("\n---")) {
      const docs: unknown[] = [];
      yaml.loadAll(text, (doc: unknown) => docs.push(doc));
      const valid = docs.filter((d) => d !== undefined && d !== null);
      if (valid.length > 1) {
        this.addWarning(
          this.lang === "es"
            ? `YAML multi-documento: ${valid.length} documentos fusionados en un array`
            : `Multi-document YAML: ${valid.length} documents merged into an array`,
        );
        return valid;
      }
      if (valid.length === 1) return valid[0];
      return null;
    }
    const result = yaml.load(text);
    if (result !== null && typeof result !== "object") {
      this.addWarning(
        this.lang === "es"
          ? `YAML interpretado como valor primitivo (${typeof result})`
          : `YAML parsed as primitive value (${typeof result})`,
      );
    }
    return result;
  }

  private parseCsv(text: string): unknown {
    const firstLine = text.split("\n")[0] || "";
    let delimiter = ",";
    if (firstLine.includes("\t") && !firstLine.includes(",")) {
      delimiter = "\t";
      this.addWarning(this.tw("Tab-separated values detected"));
    } else if (firstLine.includes(";") && !firstLine.includes(",")) {
      delimiter = ";";
      this.addWarning(this.tw("Semicolon-separated values detected"));
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
        this.addWarning(
          this.lang === "es"
            ? "Encabezados numéricos — parseado sin encabezados, columnas col1, col2, etc."
            : "Headers look numeric — parsed without headers, columns named col1, col2, etc.",
        );
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
      this.addWarning(
        this.lang === "es"
          ? `${withHeaders.errors.length} fila(s) con advertencias de parseo`
          : `${withHeaders.errors.length} row(s) had parse warnings`,
      );
    }

    let rows = withHeaders.data as Record<string, unknown>[];
    const fields = withHeaders.meta.fields || [];

    if (rows.length === 1 && fields.length === 1) {
      const val = rows[0][fields[0]];
      if (typeof val === "string" && /^\s*[\{\[]/.test(val)) {
        try {
          const parsed = JSON.parse(val);
          this.addWarning(
            this.lang === "es"
              ? "Celda contenía JSON embebido — extraído y parseado"
              : "Cell contained embedded JSON — extracted and parsed",
          );
          return parsed;
        } catch {}
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
      this.addWarning(
        this.lang === "es"
          ? `${jsonCellCount} celda(s) contenían JSON embebido — parseado automáticamente`
          : `${jsonCellCount} cell(s) contained embedded JSON — parsed automatically`,
      );
    }
    return rows;
  }

  // --- format output ---

  private formatOutput(data: unknown, format: Format): string {
    switch (format) {
      case "json": return JSON.stringify(data, null, 2);
      case "yaml": return this.formatToYaml(data);
      case "toml": return this.formatToToml(data);
      case "csv": return this.jsonToCsv(data);
      default: throw new Error(`Unsupported output format: ${format}`);
    }
  }

  private formatToYaml(data: unknown): string {
    if (data === undefined || data === null) {
      this.addWarning(this.tw("Null/empty value converted to YAML null"));
      return "null\n";
    }
    if (typeof data !== "object") {
      this.addWarning(
        this.lang === "es"
          ? `Valor primitivo (${typeof data}) convertido a YAML`
          : `Primitive value (${typeof data}) converted to YAML`,
      );
    }
    return yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true });
  }

  private sanitizeForToml(obj: unknown, path = "", isRoot = true): unknown {
    if (isRoot) this.tomlNullCount = 0;

    if (obj === null || obj === undefined) {
      this.tomlNullCount++;
      if (this.tomlNullCount <= 3) {
        this.addWarning(
          this.lang === "es"
            ? `null reemplazado con ""${path ? ` (en ${path})` : ""}`
            : `null replaced with ""${path ? ` (at ${path})` : ""}`,
        );
      } else if (this.tomlNullCount === 4) {
        this.addWarning(this.tw("...and more null values"));
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
      if (types.size > 1) {
        this.addWarning(
          this.lang === "es"
            ? `Array de tipos mixtos convertido a strings${path ? ` (en ${path})` : ""}`
            : `Mixed-type array converted to strings${path ? ` (at ${path})` : ""}`,
        );
        return obj.map((item) => {
          if (item === null || item === undefined) return "";
          if (typeof item === "object") return JSON.stringify(item);
          return String(item);
        });
      }
      return obj.map((item, i) => this.sanitizeForToml(item, `${path}[${i}]`, false));
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = this.sanitizeForToml(val, path ? `${path}.${key}` : key, false);
    }
    return result;
  }

  private formatToToml(data: unknown): string {
    if (data === null || data === undefined) {
      this.addWarning(
        this.lang === "es"
          ? 'Valor nulo envuelto como value = ""'
          : 'Null value wrapped as value = ""',
      );
      return 'value = ""\n';
    }
    if (typeof data !== "object") {
      this.addWarning(
        this.lang === "es"
          ? `Primitivo ${typeof data} envuelto en clave [value]`
          : `Primitive ${typeof data} wrapped in [value] key`,
      );
      return toml.stringify({ value: data } as Record<string, unknown>);
    }

    let prefix = "";
    let tomlData: unknown;
    if (Array.isArray(data)) {
      prefix = this.lang === "es"
        ? "# Array envuelto en [items] (TOML requiere un objeto raíz)\n\n"
        : "# Array wrapped in [items] (TOML requires a root object)\n\n";
      this.addWarning(this.tw("Root array wrapped in 'items' key"));
      tomlData = { items: this.sanitizeForToml(data) };
    } else {
      tomlData = this.sanitizeForToml(data);
    }

    return prefix + toml.stringify(tomlData as Record<string, unknown>);
  }

  private jsonToCsv(data: unknown): string {
    if (data === null || typeof data !== "object") {
      this.addWarning(this.tw("Primitive value wrapped as single-cell CSV"));
      return Papa.unparse([{ value: data }]);
    }

    if (!Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length === 1 && Array.isArray(obj[keys[0]])) {
        const inner = obj[keys[0]] as unknown[];
        if (inner.length > 0 && inner.some((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
          this.addWarning(
            this.lang === "es"
              ? `Array extraído de la clave "${keys[0]}"`
              : `Array extracted from "${keys[0]}" key`,
          );
          return this.jsonToCsv(inner);
        }
      }
      this.addWarning(this.tw("Single object converted to one-row CSV (nested keys flattened)"));
      return Papa.unparse([this.flatten(data)]);
    }

    if (data.length === 0) {
      this.addWarning(this.tw("Empty array produces empty CSV"));
      return "";
    }

    if (data.every((item: unknown) => item === null || typeof item !== "object")) {
      this.addWarning(this.tw("Array of primitives converted to single-column CSV"));
      return Papa.unparse(data.map((v: unknown) => ({ value: v })));
    }

    if (data.every((item: unknown) => Array.isArray(item))) {
      this.addWarning(this.tw("Array of arrays: first row used as headers (if strings), otherwise indexed columns"));
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
      return this.flatten(item);
    });

    const hasNested = data.some((item: unknown) =>
      item !== null && typeof item === "object" && !Array.isArray(item) &&
      Object.values(item as Record<string, unknown>).some(
        (v) => v !== null && typeof v === "object",
      ),
    );
    if (hasNested) {
      this.addWarning(this.tw("Nested objects flattened with dot notation (e.g. server.host)"));
    }

    return Papa.unparse(flattened);
  }
}
