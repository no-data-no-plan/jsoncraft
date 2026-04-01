<script lang="ts">
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let count = 1;
  let uppercase = false;
  let noDashes = false;
  let uuids: string[] = [];

  generate();

  function generate() {
    const n = Math.max(1, Math.min(1000, count));
    uuids = [];
    for (let i = 0; i < n; i++) {
      let id = crypto.randomUUID();
      if (noDashes) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      uuids.push(id);
    }
    uuids = uuids;
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
  }

  function copySingle(uuid: string) {
    navigator.clipboard.writeText(uuid);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-3 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <div class="flex items-center gap-2">
      <label for="count" class="text-sm text-[var(--color-text-secondary)]">{tt("uuid", lang, "count")}</label>
      <input
        id="count"
        type="number"
        min="1"
        max="1000"
        bind:value={count}
        class="w-20 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2 py-1 rounded text-sm"
      />
    </div>
    <label class="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] cursor-pointer">
      <input type="checkbox" bind:checked={uppercase} class="accent-[var(--color-accent)]" />
      {tt("uuid", lang, "uppercase")}
    </label>
    <label class="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] cursor-pointer">
      <input type="checkbox" bind:checked={noDashes} class="accent-[var(--color-accent)]" />
      {tt("uuid", lang, "noDashes")}
    </label>
    <button
      onclick={generate}
      class="px-3 py-1 rounded text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
    >{t(lang, "generate")}</button>
    <button
      onclick={copyAll}
      class="ml-auto px-3 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    >{tt("uuid", lang, "copyAll")}</button>
  </div>

  <div class="flex-1 overflow-auto p-3">
    <div class="space-y-1">
      {#each uuids as uuid}
        <div class="flex items-center gap-2 group">
          <code class="flex-1 p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm text-[var(--color-text-primary)] select-all">
            {uuid}
          </code>
          <button
            onclick={() => copySingle(uuid)}
            class="opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-opacity"
          >{t(lang, "copy")}</button>
        </div>
      {/each}
    </div>
  </div>
</div>
