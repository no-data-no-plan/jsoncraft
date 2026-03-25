<script lang="ts">
  import { onDestroy } from "svelte";

  let timestamp = Math.floor(Date.now() / 1000).toString();
  let dateInput = "";
  let liveTimestamp = Math.floor(Date.now() / 1000);
  let fromTs: { utc: string; local: string; iso: string; relative: string } | null = null;
  let fromDate: number | null = null;
  let error = "";

  const interval = setInterval(() => {
    liveTimestamp = Math.floor(Date.now() / 1000);
  }, 1000);

  onDestroy(() => clearInterval(interval));

  function convertTimestamp() {
    error = "";
    fromTs = null;
    const ts = parseInt(timestamp);
    if (isNaN(ts)) { error = "Invalid timestamp"; return; }
    // Handle ms vs s
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { error = "Invalid timestamp"; return; }
    fromTs = {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
      relative: getRelative(d),
    };
  }

  function convertDate() {
    error = "";
    fromDate = null;
    if (!dateInput) return;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) { error = "Invalid date"; return; }
    fromDate = Math.floor(d.getTime() / 1000);
  }

  function getRelative(d: Date): string {
    const diff = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diff);
    const suffix = diff > 0 ? "ago" : "from now";
    if (abs < 60) return `${Math.floor(abs)} seconds ${suffix}`;
    if (abs < 3600) return `${Math.floor(abs / 60)} minutes ${suffix}`;
    if (abs < 86400) return `${Math.floor(abs / 3600)} hours ${suffix}`;
    if (abs < 2592000) return `${Math.floor(abs / 86400)} days ${suffix}`;
    if (abs < 31536000) return `${Math.floor(abs / 2592000)} months ${suffix}`;
    return `${Math.floor(abs / 31536000)} years ${suffix}`;
  }

  function useNow() {
    timestamp = Math.floor(Date.now() / 1000).toString();
    convertTimestamp();
  }

  function copy(val: string) {
    navigator.clipboard.writeText(val);
  }

  // Auto-convert on load
  convertTimestamp();
</script>

<div class="flex flex-col h-full overflow-auto">
  <!-- Live clock -->
  <div class="flex items-center justify-center gap-3 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
    <span class="text-sm text-[var(--color-text-muted)]">Current Unix:</span>
    <button onclick={() => copy(liveTimestamp.toString())} class="font-mono text-lg text-[var(--color-accent)] hover:underline cursor-pointer">
      {liveTimestamp}
    </button>
  </div>

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Timestamp → Date -->
    <div class="flex-1 p-4 space-y-4">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Timestamp → Date</h3>
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={timestamp}
          oninput={convertTimestamp}
          class="flex-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-3 py-2 rounded font-mono text-sm"
          placeholder="1711234567"
        />
        <button onclick={useNow} class="px-3 py-2 rounded text-sm bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]">Now</button>
      </div>
      {#if fromTs}
        <div class="space-y-2">
          {#each [
            { label: "UTC", value: fromTs.utc },
            { label: "Local", value: fromTs.local },
            { label: "ISO 8601", value: fromTs.iso },
            { label: "Relative", value: fromTs.relative },
          ] as row}
            <div class="flex items-start gap-2">
              <span class="text-xs text-[var(--color-text-muted)] w-16 shrink-0 pt-1">{row.label}</span>
              <div class="flex-1 p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm text-[var(--color-text-primary)] select-all break-all">
                {row.value}
              </div>
              <button onclick={() => copy(row.value)} class="text-xs text-[var(--color-accent)] hover:underline shrink-0 pt-1">Copy</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>

    <!-- Date → Timestamp -->
    <div class="flex-1 p-4 space-y-4">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">Date → Timestamp</h3>
      <input
        type="datetime-local"
        bind:value={dateInput}
        oninput={convertDate}
        class="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-3 py-2 rounded text-sm"
      />
      {#if fromDate !== null}
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs text-[var(--color-text-muted)] w-16">Seconds</span>
            <div class="flex-1 p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm text-[var(--color-accent)] select-all">
              {fromDate}
            </div>
            <button onclick={() => copy(fromDate!.toString())} class="text-xs text-[var(--color-accent)] hover:underline">Copy</button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-[var(--color-text-muted)] w-16">Millis</span>
            <div class="flex-1 p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-sm text-[var(--color-text-primary)] select-all">
              {fromDate * 1000}
            </div>
            <button onclick={() => copy((fromDate! * 1000).toString())} class="text-xs text-[var(--color-accent)] hover:underline">Copy</button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-t border-[var(--color-border)]">{error}</div>
  {/if}
</div>
