<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";

  let { label, value, lang, placeholder, readonly = false, copyLabel, copyTitle, downloadLabel, downloadTitle, onchange, onCopy, onDownload }: {
    label: string;
    value: string;
    lang: "json" | "yaml" | "text";
    placeholder: string;
    readonly?: boolean;
    copyLabel: string;
    copyTitle: string;
    downloadLabel?: string;
    downloadTitle?: string;
    onchange?: (value: string) => void;
    onCopy: () => void;
    onDownload?: () => void;
  } = $props();
</script>

<div class="flex-1 flex flex-col min-h-0 p-2">
  <div class="flex items-center justify-between mb-1 px-1">
    <span class="text-xs text-[var(--color-text-muted)]">{label}</span>
    <div class="flex items-center gap-2">
      <button
        onclick={onCopy}
        class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        title={copyTitle}
      >
        {copyLabel}
      </button>
      {#if onDownload && downloadLabel}
        <button
          onclick={onDownload}
          class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          title={downloadTitle}
        >
          {downloadLabel}
        </button>
      {/if}
    </div>
  </div>
  <div class="flex-1 min-h-0">
    <CodeEditor
      {value}
      {lang}
      {placeholder}
      {readonly}
      {onchange}
    />
  </div>
</div>
