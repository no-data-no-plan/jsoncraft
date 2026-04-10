<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { uploadFile, downloadFile, stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = $state("");
  let output = $state("");
  let error = $state("");
  let indent = $state(2);

  function escXml(s: string) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function prettyPrint(xml: string, indentSize: number): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(stripBom(xml).trim(), "application/xml");

    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      const msg = parseError.textContent || "Invalid XML";
      throw new Error(msg.split("\n")[0]);
    }

    const pad = " ".repeat(indentSize);
    let result = "";
    const xmlDecl = xml.trim().match(/^<\?xml[^?]*\?>/);
    if (xmlDecl) result = xmlDecl[0] + "\n";

    function walk(node: Node, level: number) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) result += pad.repeat(level) + escXml(text) + "\n";
        return;
      }

      if (node.nodeType === Node.COMMENT_NODE) {
        result += pad.repeat(level) + `<!--${node.textContent}-->` + "\n";
        return;
      }

      if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
        const pi = node as ProcessingInstruction;
        result += pad.repeat(level) + `<?${pi.target} ${pi.data}?>` + "\n";
        return;
      }

      if (node.nodeType === Node.CDATA_SECTION_NODE) {
        result += pad.repeat(level) + `<![CDATA[${node.textContent}]]>` + "\n";
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      const tag = el.tagName;
      let attrs = "";
      for (let i = 0; i < el.attributes.length; i++) {
        const a = el.attributes[i];
        attrs += ` ${a.name}="${escXml(a.value)}"`;
      }

      if (!el.childNodes.length) {
        result += pad.repeat(level) + `<${tag}${attrs} />` + "\n";
        return;
      }

      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        const text = el.childNodes[0].textContent?.trim() || "";
        result += pad.repeat(level) + `<${tag}${attrs}>${escXml(text)}</${tag}>` + "\n";
        return;
      }

      result += pad.repeat(level) + `<${tag}${attrs}>` + "\n";
      for (let i = 0; i < el.childNodes.length; i++) {
        walk(el.childNodes[i], level + 1);
      }
      result += pad.repeat(level) + `</${tag}>` + "\n";
    }

    for (let i = 0; i < doc.childNodes.length; i++) {
      const node = doc.childNodes[i];
      if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) continue;
      walk(node, 0);
    }

    return result.trimEnd();
  }

  function minifyXml(xml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(stripBom(xml).trim(), "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      const msg = parseError.textContent || "Invalid XML";
      throw new Error(msg.split("\n")[0]);
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  }

  function format() {
    if (!input.trim()) { output = ""; error = ""; return; }
    try {
      output = prettyPrint(input, indent);
      error = "";
    } catch (e: any) {
      error = e.message;
      output = "";
    }
  }

  function minify() {
    if (!input.trim()) { output = ""; error = ""; return; }
    try {
      output = minifyXml(input);
      error = "";
    } catch (e: any) {
      error = e.message;
      output = "";
    }
  }

  function handleInput(val: string) {
    input = val;
    if (val.trim()) format();
    else { output = ""; error = ""; }
  }

  async function upload() {
    const text = await uploadFile(".xml");
    if (text) { input = text; format(); }
  }

  function download() {
    if (!output) return;
    downloadFile(output, "formatted.xml");
  }

  function copySample() {
    input = `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price></book></catalog>`;
    format();
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button onclick={format} class="px-2 py-1 text-xs rounded bg-[var(--color-accent)] text-white hover:opacity-90">{t(lang, "format")}</button>
    <button onclick={minify} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "minify")}</button>
    <label class="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
      {t(lang, "indent")}
      <select bind:value={indent} onchange={format} class="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-xs rounded px-1 py-0.5 border border-[var(--color-border)]">
        <option value={2}>{tt("xmlFormatter", lang, "spaces2")}</option>
        <option value={4}>{tt("xmlFormatter", lang, "spaces4")}</option>
      </select>
    </label>
    <button onclick={upload} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "upload")}</button>
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
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">XML {t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="text" placeholder={tt("xmlFormatter", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{t(lang, "output")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={output} lang="text" readonly placeholder={tt("xmlFormatter", lang, "outputPlaceholder")} />
      </div>
    </div>
  </div>
</div>
