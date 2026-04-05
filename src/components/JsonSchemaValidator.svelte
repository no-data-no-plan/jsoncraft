<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import Ajv from "ajv";

  let { lang = "en" as Lang } = $props();

  let jsonInput = "";
  let schemaInput = "";
  let results: { valid: boolean; errors: string[] } | null = null;
  let parseError = "";

  function validate() {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      results = null;
      parseError = "";
      return;
    }

    let data: unknown;
    let schema: unknown;

    try {
      data = JSON.parse(stripBom(jsonInput));
    } catch (e: any) {
      parseError = `JSON: ${e.message}`;
      results = null;
      return;
    }

    try {
      schema = JSON.parse(stripBom(schemaInput));
    } catch (e: any) {
      parseError = `Schema: ${e.message}`;
      results = null;
      return;
    }

    parseError = "";

    try {
      const ajv = new Ajv({ allErrors: true, verbose: true });
      const validateFn = ajv.compile(schema as object);
      const valid = validateFn(data);

      if (valid) {
        results = { valid: true, errors: [] };
      } else {
        const errors = (validateFn.errors || []).map((err) => {
          const path = err.instancePath || "/";
          return `${path}: ${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ""}`;
        });
        results = { valid: false, errors };
      }
    } catch (e: any) {
      parseError = `Schema error: ${e.message}`;
      results = null;
    }
  }

  function handleJsonInput(val: string) {
    jsonInput = val;
    validate();
  }

  function handleSchemaInput(val: string) {
    schemaInput = val;
    validate();
  }

  function copySample() {
    jsonInput = JSON.stringify({
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      tags: ["admin", "user"],
    }, null, 2);

    schemaInput = JSON.stringify({
      type: "object",
      required: ["name", "age", "email"],
      properties: {
        name: { type: "string", minLength: 1 },
        age: { type: "integer", minimum: 0, maximum: 150 },
        email: { type: "string", format: "email" },
        tags: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
        },
      },
      additionalProperties: false,
    }, null, 2);

    validate();
  }

  function clear() {
    jsonInput = "";
    schemaInput = "";
    results = null;
    parseError = "";
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button onclick={copySample} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "sample")}</button>
    <button onclick={clear} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "clear")}</button>
    {#if results}
      {#if results.valid}
        <span class="ml-2 text-xs text-green-400">{tt("jsonSchemaValidator", lang, "valid")}</span>
      {:else}
        <span class="ml-2 text-xs text-red-400">{tt("jsonSchemaValidator", lang, "invalid")} ({results.errors.length} {results.errors.length === 1 ? tt("jsonSchemaValidator", lang, "error") : tt("jsonSchemaValidator", lang, "errors")})</span>
      {/if}
    {/if}
  </div>

  {#if parseError}
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]">{parseError}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">JSON</div>
      <div class="flex-1 p-2">
        <CodeEditor value={jsonInput} onchange={handleJsonInput} lang="json" placeholder={tt("jsonSchemaValidator", lang, "jsonPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">JSON Schema</div>
      <div class="flex-1 p-2">
        <CodeEditor value={schemaInput} onchange={handleSchemaInput} lang="json" placeholder={tt("jsonSchemaValidator", lang, "schemaPlaceholder")} />
      </div>
    </div>
  </div>

  {#if results && !results.valid && results.errors.length > 0}
    <div class="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 max-h-40 overflow-auto">
      <div class="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">{tt("jsonSchemaValidator", lang, "validationErrors")}</div>
      <ul class="space-y-1">
        {#each results.errors as err}
          <li class="text-xs text-red-400 font-mono">{err}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
