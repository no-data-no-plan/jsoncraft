<script lang="ts">
  import { uploadFile, downloadFile, friendlyError, debounce } from "../lib/fileutils";
  import { shouldUseWorker, convertInWorker } from "../lib/worker-api";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import type { Format } from "../lib/converter-config";
  import { formatLabels, extMap, downloadExtMap, langMap, sampleData } from "../lib/converter-config";
  import { checkWrongFormat, type WrongFormatHint } from "../lib/format-detection";
  import { ConversionEngine } from "../lib/conversion-engine";
  import ConverterToolbar from "./ConverterToolbar.svelte";
  import EditorPanel from "./EditorPanel.svelte";
  import UndoToast from "./UndoToast.svelte";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en", fromFormat = "json", toFormat = "yaml" }: {
    lang?: Lang;
    fromFormat?: Format;
    toFormat?: Format;
  } = $props();

  let input = $state("");
  let output = $state("");
  let error = $state("");
  let warning = $state("");
  let wrongFormatHint: WrongFormatHint | null = $state(null);
  let processing = $state(false);

  const fireToolComplete = useToolComplete(`${fromFormat}-to-${toFormat}`);
  $effect(() => {
    output; error;
    if (output && !error) fireToolComplete();
  });

  const engine = new ConversionEngine();

  async function convert() {
    error = "";
    output = "";
    warning = "";
    wrongFormatHint = null;
    if (!input.trim()) return;

    // For lenient parsers, check if input looks like another format
    if (fromFormat === "csv" || fromFormat === "yaml") {
      wrongFormatHint = checkWrongFormat(input, fromFormat, toFormat, lang);
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
        wrongFormatHint = checkWrongFormat(input, fromFormat, toFormat, lang);
      } finally {
        processing = false;
      }
    } else {
      try {
        const result = engine.convert(input, fromFormat, toFormat, lang);
        output = result.output;
        warning = result.warning;
      } catch (e: any) {
        error = friendlyError(e.message);
        wrongFormatHint = checkWrongFormat(input, fromFormat, toFormat, lang);
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

  // Undo-toast state for destructive Clear (Nielsen audit 2026-04-30, F2).
  let undoSnapshot = $state<{ input: string; output: string } | null>(null);
  let toastVisible = $state(false);

  function clear() {
    if (!input && !output) {
      input = "";
      output = "";
      error = "";
      warning = "";
      wrongFormatHint = null;
      return;
    }
    undoSnapshot = { input, output };
    input = "";
    output = "";
    error = "";
    warning = "";
    wrongFormatHint = null;
    toastVisible = true;
  }

  function undoClear() {
    if (!undoSnapshot) return;
    input = undoSnapshot.input;
    // output regenerates from input on next convert; just trigger it
    undoSnapshot = null;
    toastVisible = false;
    convert();
  }

  function dismissUndo() {
    undoSnapshot = null;
    toastVisible = false;
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
    input = sampleData[fromFormat](toFormat);
    convert();
  }
</script>

<div class="flex flex-col h-full">
  <ConverterToolbar
    {lang}
    {processing}
    {error}
    {warning}
    {wrongFormatHint}
    onConvert={convert}
    onUpload={handleUpload}
    onClear={clear}
    onLoadSample={loadSample}
  />

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <EditorPanel
      label="{formatLabels[fromFormat]} {t(lang, 'input')}"
      value={input}
      lang={langMap[fromFormat]}
      placeholder={lang === "es" ? `Pega tu ${formatLabels[fromFormat]} aquí...` : `Paste your ${formatLabels[fromFormat]} here...`}
      copyLabel={t(lang, "copy")}
      copyTitle={tt("converter", lang, "copyInput")}
      onchange={handleInput}
      onCopy={() => copyText(input)}
    />

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="h-px bg-[var(--color-border)] lg:hidden"></div>

    <EditorPanel
      label="{formatLabels[toFormat]} {t(lang, 'output')}"
      value={output}
      lang={langMap[toFormat]}
      placeholder={lang === "es" ? `La salida ${formatLabels[toFormat]} aparecerá aquí...` : `${formatLabels[toFormat]} output will appear here...`}
      readonly={true}
      copyLabel={t(lang, "copy")}
      copyTitle={tt("converter", lang, "copyOutput")}
      downloadLabel={t(lang, "download")}
      downloadTitle={tt("converter", lang, "downloadOutput")}
      onCopy={() => copyText(output)}
      onDownload={handleDownload}
    />
  </div>
</div>

<UndoToast
  visible={toastVisible}
  message={t(lang, "cleared")}
  key={undoSnapshot}
  onUndo={undoClear}
  onDismiss={dismissUndo}
  {lang}
/>
