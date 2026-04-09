<script lang="ts">
  import { t } from "../i18n/common";
  import type { Lang } from "../i18n/index";
  import type { WrongFormatHint } from "../lib/format-detection";

  export let lang: Lang;
  export let processing: boolean;
  export let error: string;
  export let warning: string;
  export let wrongFormatHint: WrongFormatHint | null;
  export let onConvert: () => void;
  export let onUpload: () => void;
  export let onClear: () => void;
  export let onLoadSample: () => void;
</script>

<div
  class="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
>
  <button
    on:click={onConvert}
    class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
  >
    {t(lang, "convert")}
  </button>
  <button
    on:click={onUpload}
    class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
  >
    {t(lang, "upload")}
  </button>
  <button
    on:click={onClear}
    class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
  >
    {t(lang, "clear")}
  </button>
  <button
    on:click={onLoadSample}
    class="px-3 py-1.5 rounded text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
  >
    {t(lang, "sample")}
  </button>
  {#if processing}
    <span class="text-xs text-[var(--color-accent)] ml-auto animate-pulse">{t(lang, "processingLarge")}</span>
  {:else if wrongFormatHint}
    <span class="text-xs text-[var(--color-warning)] ml-auto">
      {wrongFormatHint.message}
      {#if wrongFormatHint.linkHref}
        <a href={wrongFormatHint.linkHref} class="underline">{wrongFormatHint.linkText}</a>{lang === "es" ? "." : " instead."}
      {/if}
    </span>
  {:else if error}
    <span class="text-xs text-[var(--color-error)] ml-auto">{error}</span>
  {:else if warning}
    <span class="text-xs text-[var(--color-warning)] ml-auto">{warning}</span>
  {/if}
</div>
