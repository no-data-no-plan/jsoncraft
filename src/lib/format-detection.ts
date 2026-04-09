import type { Format } from "./converter-config";
import { formatLabels } from "./converter-config";
import type { Lang } from "../i18n/index";

export function detectFormat(text: string): Format | null {
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

// Maps detected format → target format → converter page
const suggestPaths: Record<string, Record<string, string>> = {
  json: { yaml: "/json-to-yaml", toml: "/json-to-toml", csv: "/json-to-csv" },
  yaml: { json: "/yaml-to-json" },
  toml: { json: "/toml-to-json" },
  csv: { json: "/csv-to-json" },
};

export interface WrongFormatHint {
  message: string;
  linkHref?: string;
  linkText?: string;
}

export function checkWrongFormat(
  text: string,
  fromFormat: Format,
  toFormat: Format,
  lang: Lang,
): WrongFormatHint | null {
  const detected = detectFormat(text);
  if (!detected || detected === fromFormat) return null;

  const es = lang === "es";
  const base = es
    ? `Esto parece ${formatLabels[detected]}, no ${formatLabels[fromFormat]}.`
    : `This looks like ${formatLabels[detected]}, not ${formatLabels[fromFormat]}.`;
  const tryWord = es ? " Prueba" : " Try";

  const exactPath = suggestPaths[detected]?.[toFormat];
  const toJsonPath = suggestPaths[detected]?.json;
  const fallbackPath = suggestPaths[detected]?.json;

  if (exactPath) {
    return { message: base + tryWord, linkHref: exactPath, linkText: `${formatLabels[detected]} a ${formatLabels[toFormat]}` };
  } else if (toJsonPath && toFormat === "json") {
    return { message: base + tryWord, linkHref: toJsonPath, linkText: `${formatLabels[detected]} a JSON` };
  } else if (fallbackPath) {
    return { message: base + tryWord, linkHref: fallbackPath, linkText: `${formatLabels[detected]} a JSON` };
  }
  return { message: base };
}
