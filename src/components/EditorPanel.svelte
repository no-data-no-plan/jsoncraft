<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";

  export let label: string;
  export let value: string;
  export let lang: "json" | "yaml" | "text";
  export let placeholder: string;
  export let readonly: boolean = false;
  export let copyLabel: string;
  export let copyTitle: string;
  export let downloadLabel: string | undefined = undefined;
  export let downloadTitle: string | undefined = undefined;
  export let onchange: ((value: string) => void) | undefined = undefined;
  export let onCopy: () => void;
  export let onDownload: (() => void) | undefined = undefined;
</script>

<div class="flex-1 flex flex-col min-h-0 p-2">
  <div class="flex items-center justify-between mb-1 px-1">
    <span class="text-xs text-[var(--color-text-muted)]">{label}</span>
    <div class="flex items-center gap-2">
      <button
        on:click={onCopy}
        class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        title={copyTitle}
      >
        {copyLabel}
      </button>
      {#if onDownload && downloadLabel}
        <button
          on:click={onDownload}
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
