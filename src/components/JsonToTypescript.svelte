<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let output = $state("");
  let error = $state("");

  const fireToolComplete = useToolComplete("json-to-typescript");
  $effect(() => {
    output; error;
    if (output && !error) fireToolComplete();
  });

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function needsQuotes(key: string): boolean {
    return !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  }

  function toInterfaceName(key: string): string {
    const cleaned = key.replace(/[^a-zA-Z0-9_]/g, "_");
    return capitalize(cleaned.replace(/_([a-z])/g, (_, c) => c.toUpperCase()));
  }

  function isPlainObject(v: unknown): v is Record<string, unknown> {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function getType(value: unknown, key: string, interfaces: Map<string, string>): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
    if (typeof value === "boolean") return "boolean";

    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";

      // If all elements are plain objects, merge their shapes into one interface
      if (value.every(isPlainObject)) {
        const itemName = toInterfaceName(`${key}Item`);
        generateMergedInterface(value as Record<string, unknown>[], itemName, interfaces);
        return `${itemName}[]`;
      }

      const types = new Set(value.map((item) => getType(item, `${key}Item`, interfaces)));
      if (types.size === 1) return `${[...types][0]}[]`;
      return `(${[...types].join(" | ")})[]`;
    }

    if (typeof value === "object") {
      const interfaceName = toInterfaceName(key);
      generateInterface(value as Record<string, unknown>, interfaceName, interfaces);
      return interfaceName;
    }

    return "unknown";
  }

  function generateInterface(obj: Record<string, unknown>, name: string, interfaces: Map<string, string>): void {
    if (interfaces.has(name)) return;

    const lines: string[] = [];
    lines.push(`interface ${name} {`);

    for (const [key, value] of Object.entries(obj)) {
      const type = getType(value, key, interfaces);
      const prop = needsQuotes(key) ? `"${key}"` : key;
      lines.push(`  ${prop}: ${type};`);
    }

    lines.push("}");
    interfaces.set(name, lines.join("\n"));
  }

  /**
   * Generate an interface by merging the shapes of all objects in `objs`.
   * Keys missing from any element are marked optional with `?:`.
   * Types across elements are unioned when they differ.
   */
  function generateMergedInterface(
    objs: Record<string, unknown>[],
    name: string,
    interfaces: Map<string, string>
  ): void {
    if (interfaces.has(name)) return;
    // Reserve name to prevent recursion loops
    interfaces.set(name, "");

    const allKeys = new Set<string>();
    for (const obj of objs) for (const k of Object.keys(obj)) allKeys.add(k);

    const lines: string[] = [];
    lines.push(`interface ${name} {`);

    for (const key of allKeys) {
      const present = objs.filter((obj) => key in obj);
      const optional = present.length < objs.length;
      const typeSet = new Set(present.map((obj) => getType(obj[key], key, interfaces)));
      const type = typeSet.size === 1 ? [...typeSet][0] : [...typeSet].join(" | ");
      const prop = needsQuotes(key) ? `"${key}"` : key;
      lines.push(`  ${prop}${optional ? "?" : ""}: ${type};`);
    }

    lines.push("}");
    interfaces.set(name, lines.join("\n"));
  }

  function convert() {
    if (!input.trim()) {
      output = "";
      error = "";
      return;
    }

    try {
      const parsed = JSON.parse(stripBom(input));
      const interfaces = new Map<string, string>();

      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && parsed.every(isPlainObject)) {
          // Merge shapes across all elements: collect all keys, mark missing as optional,
          // union differing types.
          generateMergedInterface(parsed as Record<string, unknown>[], "RootItem", interfaces);
          const result = [...interfaces.values()].reverse().join("\n\n");
          output = `${result}\n\ntype Root = RootItem[];`;
        } else {
          const itemType = parsed.length > 0 ? getType(parsed[0], "item", interfaces) : "unknown";
          output = `type Root = ${itemType}[];`;
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        generateInterface(parsed as Record<string, unknown>, "Root", interfaces);
        output = [...interfaces.values()].reverse().join("\n\n");
      } else {
        output = `type Root = ${typeof parsed};`;
      }

      error = "";
    } catch (e: any) {
      error = e.message;
      output = "";
    }
  }

  function handleInput(val: string) {
    input = val;
    convert();
  }

  function copySample() {
    input = JSON.stringify({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      active: true,
      scores: [95, 87, 92],
      address: {
        street: "123 Main St",
        city: "Springfield",
        zip: "62701",
      },
      tags: ["admin", "user"],
    }, null, 2);
    convert();
  }

  function download() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "types.ts";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
    <button onclick={copySample} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "sample")}</button>
    <button onclick={() => { input = ""; output = ""; error = ""; }} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "clear")}</button>
    <div class="ml-auto flex items-center gap-2">
      {#if output}
        <button onclick={copyOutput} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "copy")}</button>
        <button onclick={download} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "download")}</button>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]" aria-live="polite">{error}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">JSON {t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="json" placeholder={tt("jsonToTypescript", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">TypeScript {t(lang, "output")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={output} lang="text" readonly placeholder={tt("jsonToTypescript", lang, "outputPlaceholder")} />
      </div>
    </div>
  </div>
</div>
