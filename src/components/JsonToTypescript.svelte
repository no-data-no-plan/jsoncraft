<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let output = "";
  let error = "";

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

  function getType(value: unknown, key: string, interfaces: Map<string, string>): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
    if (typeof value === "boolean") return "boolean";

    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const types = new Set(value.map((item, i) => getType(item, `${key}Item`, interfaces)));
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

  function convert() {
    if (!input.trim()) {
      output = "";
      error = "";
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const interfaces = new Map<string, string>();

      if (Array.isArray(parsed)) {
        // NOTE: Interface is generated from the first element only. Objects with
        // different shapes later in the array are not merged. This is a known
        // design limitation — a full union/merge would add significant complexity.
        if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
          generateInterface(parsed[0] as Record<string, unknown>, "RootItem", interfaces);
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
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]">{error}</div>
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
