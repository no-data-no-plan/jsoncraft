<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import UndoToast from "./UndoToast.svelte";
  import { stripBom } from "../lib/fileutils";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  // Switched from `ajv` to `@cfworker/json-schema` (Nielsen audit 2026-04-30,
  // F1): Ajv's default `code:true` mode runtime-compiles validators via the
  // Function constructor, which the site's CSP forbids ('unsafe-eval' is not
  // an allowed source). The page surfaced ~400 chars of raw CSP error text to
  // users instead of validation results, making the tool functionally dead.
  // @cfworker/json-schema is a no-eval, draft-2020-12 capable validator —
  // safe under our CSP and ~15KB gzipped vs ajv's ~30KB.
  import { Validator } from "@cfworker/json-schema";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  let jsonInput = $state("");
  let schemaInput = $state("");
  let results = $state<{ valid: boolean; errors: string[] } | null>(null);
  let parseError = $state("");

  const fireToolComplete = useToolComplete("json-schema-validator");
  $effect(() => {
    results; parseError;
    if (results !== null && !parseError) fireToolComplete();
  });

  // Memoize the Validator by raw schema string (Round-2 review fix
  // 2026-04-30): without this, a new Validator was constructed on every
  // keystroke in either editor, re-parsing + re-dereferencing the schema
  // 3+ times per second. Negligible for tiny schemas, perceptible lag for
  // 500-field schemas with $ref.
  let lastSchemaStr = "";
  let cachedValidator: Validator | null = null;

  function getValidator(schemaStr: string, parsedSchema: unknown): Validator {
    if (schemaStr !== lastSchemaStr) {
      lastSchemaStr = schemaStr;
      cachedValidator = new Validator(parsedSchema as any, "2020-12");
    }
    return cachedValidator!;
  }

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
      // Default to draft 2020-12; @cfworker/json-schema also accepts 4/7/2019-09.
      // Validator is memoized by raw schema string above to avoid re-parse
      // and $ref-deref on every keystroke.
      const validator = getValidator(stripBom(schemaInput), schema);
      const result = validator.validate(data);

      if (result.valid) {
        results = { valid: true, errors: [] };
      } else {
        const errors = result.errors.map((err) => {
          const path = err.instanceLocation || "/";
          // err.error is the human-readable message; keywordLocation gives
          // the schema path (e.g. "#/properties/age/minimum") which helps
          // power users debug a complex schema.
          const keywordSuffix = err.keywordLocation && err.keywordLocation !== "#"
            ? ` [${err.keywordLocation}]`
            : "";
          return `${path}: ${err.error}${keywordSuffix}`;
        });
        results = { valid: false, errors };
      }
    } catch (e: any) {
      // Schema-shape errors (e.g. invalid $ref) bubble up here. Plain language
      // instead of raw stack — the previous Ajv path leaked CSP errors.
      //
      // `Unresolved $ref` errors from @cfworker/json-schema include a 200+
      // char "Known schemas: [...]" dump of internal identifiers. Replace
      // with a focused, actionable message instead of leaking library
      // internals (Nielsen audit code-review 2026-04-30).
      const msg: string = e?.message ?? "";
      const isRefError = msg.includes("Unresolved $ref");
      const friendly = isRefError
        ? (lang === "es"
            ? "Los esquemas con referencias `$ref` externas no se admiten en el navegador. Inserta cada esquema referenciado en línea antes de validar."
            : "Schemas with external `$ref` URIs are not supported in the browser. Inline all referenced schemas before validating.")
        : (lang === "es"
            ? "No se pudo procesar el esquema. Verifica que sea un JSON Schema válido."
            : "Could not process the schema. Check that it's a valid JSON Schema.");
      const detail = (!isRefError && msg) ? ` (${msg})` : "";
      parseError = `${friendly}${detail}`;
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

  // Undo-toast state for destructive Clear (Nielsen audit 2026-04-30, F2).
  let undoSnapshot = $state<{ jsonInput: string; schemaInput: string } | null>(null);
  let toastVisible = $state(false);

  function clear() {
    if (!jsonInput && !schemaInput) {
      jsonInput = "";
      schemaInput = "";
      results = null;
      parseError = "";
      return;
    }
    undoSnapshot = { jsonInput, schemaInput };
    jsonInput = "";
    schemaInput = "";
    results = null;
    parseError = "";
    toastVisible = true;
  }

  function undoClear() {
    if (!undoSnapshot) return;
    jsonInput = undoSnapshot.jsonInput;
    schemaInput = undoSnapshot.schemaInput;
    undoSnapshot = null;
    toastVisible = false;
    validate();
  }

  function dismissUndo() {
    undoSnapshot = null;
    toastVisible = false;
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button onclick={validate} class="px-3 py-1 text-xs rounded font-semibold bg-[var(--color-accent)] text-white hover:opacity-90">{tt("jsonSchemaValidator", lang, "validate")}</button>
    <button onclick={copySample} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "sample")}</button>
    <button onclick={clear} class="px-2 py-1 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "clear")}</button>
    <span aria-live="polite">
    {#if results}
      {#if results.valid}
        <span class="ml-2 text-xs text-green-400">{tt("jsonSchemaValidator", lang, "valid")}</span>
      {:else}
        <span class="ml-2 text-xs text-red-400">{tt("jsonSchemaValidator", lang, "invalid")} ({results.errors.length} {results.errors.length === 1 ? tt("jsonSchemaValidator", lang, "error") : tt("jsonSchemaValidator", lang, "errors")})</span>
      {/if}
    {:else if !jsonInput.trim() && !schemaInput.trim()}
      <span class="ml-2 text-xs text-[var(--color-text-muted)]">{tt("jsonSchemaValidator", lang, "awaitingBoth")}</span>
    {:else if !jsonInput.trim()}
      <span class="ml-2 text-xs text-[var(--color-text-muted)]">{tt("jsonSchemaValidator", lang, "awaitingJson")}</span>
    {:else if !schemaInput.trim()}
      <span class="ml-2 text-xs text-[var(--color-text-muted)]">{tt("jsonSchemaValidator", lang, "awaitingSchema")}</span>
    {/if}
    </span>
  </div>

  {#if parseError}
    <div class="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-[var(--color-border)]" aria-live="polite">{parseError}</div>
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

<UndoToast
  visible={toastVisible}
  message={t(lang, "clearedAll")}
  key={undoSnapshot}
  onUndo={undoClear}
  onDismiss={dismissUndo}
  {lang}
/>
