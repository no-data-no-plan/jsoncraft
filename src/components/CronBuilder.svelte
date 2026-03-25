<script lang="ts">
  let expression = "* * * * *";
  let parts = ["*", "*", "*", "*", "*"];
  let nextRuns: string[] = [];
  let error = "";
  const fields = [
    { name: "Minute", range: "0-59", presets: ["*", "0", "15", "30", "45", "*/5", "*/10", "*/15", "*/30"] },
    { name: "Hour", range: "0-23", presets: ["*", "0", "6", "8", "12", "18", "*/2", "*/4", "*/6"] },
    { name: "Day of Month", range: "1-31", presets: ["*", "1", "15", "*/2"] },
    { name: "Month", range: "1-12", presets: ["*", "1", "*/2", "*/3", "*/6"] },
    { name: "Day of Week", range: "0-6", presets: ["*", "0", "1-5", "6,0"] },
  ];

  const quickPresets = [
    { label: "Every minute", value: "* * * * *" },
    { label: "Every 5 min", value: "*/5 * * * *" },
    { label: "Every 15 min", value: "*/15 * * * *" },
    { label: "Every 30 min", value: "*/30 * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Every 2 hours", value: "0 */2 * * *" },
    { label: "Daily midnight", value: "0 0 * * *" },
    { label: "Daily 9 AM", value: "0 9 * * *" },
    { label: "Weekdays 9 AM", value: "0 9 * * 1-5" },
    { label: "Weekly Sunday", value: "0 0 * * 0" },
    { label: "Monthly 1st", value: "0 0 1 * *" },
    { label: "Yearly Jan 1", value: "0 0 1 1 *" },
  ];

  function updateFromParts() {
    expression = parts.join(" ");
    computeNextRuns();
  }

  function updateFromExpression() {
    error = "";
    const p = expression.trim().split(/\s+/);
    if (p.length !== 5) { error = "Cron expression must have exactly 5 fields"; nextRuns = []; return; }
    parts = [...p];
    computeNextRuns();
  }

  function applyPreset(val: string) {
    expression = val;
    updateFromExpression();
  }

  function computeNextRuns() {
    error = "";
    nextRuns = [];
    try {
      const now = new Date();
      let current = new Date(now);
      current.setSeconds(0, 0);
      for (let runs = 0; runs < 5 && nextRuns.length < 5; runs++) {
        let found = false;
        for (let attempts = 0; attempts < 525960 && !found; attempts++) {
          if (matchesCron(current, parts)) {
            nextRuns.push(current.toLocaleString());
            found = true;
          }
          current = new Date(current.getTime() + 60000);
        }
      }
      nextRuns = nextRuns;
    } catch (e: any) {
      error = e.message;
    }
  }

  function matchesCron(d: Date, p: string[]): boolean {
    return (
      matchField(d.getMinutes(), p[0], 0, 59) &&
      matchField(d.getHours(), p[1], 0, 23) &&
      matchField(d.getDate(), p[2], 1, 31) &&
      matchField(d.getMonth() + 1, p[3], 1, 12) &&
      matchField(d.getDay(), p[4], 0, 6)
    );
  }

  function matchField(val: number, expr: string, min: number, max: number): boolean {
    return expr.split(",").some(part => {
      const [range, step] = part.split("/");
      const stepN = step ? parseInt(step) : 1;
      if (range === "*") return (val - min) % stepN === 0;
      if (range.includes("-")) {
        const [a, b] = range.split("-").map(Number);
        return val >= a && val <= b && (val - a) % stepN === 0;
      }
      return parseInt(range) === val;
    });
  }

  function copy() {
    navigator.clipboard.writeText(expression);
  }

  function describe(): string {
    const p = parts;
    const descs: string[] = [];
    if (p[0] !== "*") descs.push(`minute ${p[0]}`);
    if (p[1] !== "*") descs.push(`hour ${p[1]}`);
    if (p[2] !== "*") descs.push(`day ${p[2]}`);
    if (p[3] !== "*") descs.push(`month ${p[3]}`);
    if (p[4] !== "*") descs.push(`weekday ${p[4]}`);
    if (descs.length === 0) return "Every minute";
    return "At " + descs.join(", ");
  }

  updateFromExpression();
</script>

<div class="flex flex-col h-full overflow-auto">
  <!-- Expression bar -->
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
    <input
      type="text"
      bind:value={expression}
      oninput={updateFromExpression}
      class="flex-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-accent)] px-3 py-2 rounded font-mono text-lg text-center tracking-wider"
    />
    <button onclick={copy} class="px-3 py-2 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Copy</button>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]">{error}</div>
  {/if}

  <div class="p-3 text-sm text-[var(--color-text-secondary)] text-center border-b border-[var(--color-border)]">
    {describe()}
  </div>

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Builder -->
    <div class="flex-1 p-4 space-y-4 overflow-auto">
      <!-- Quick presets -->
      <div>
        <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Quick Presets</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {#each quickPresets as preset}
            <button
              onclick={() => applyPreset(preset.value)}
              class="px-2 py-1.5 rounded text-xs text-left {expression === preset.value
                ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'}"
            >
              <div class="font-medium">{preset.label}</div>
              <div class="font-mono text-[10px] opacity-60">{preset.value}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Field editors -->
      <div>
        <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Fields</h3>
        <div class="space-y-2">
          {#each fields as field, i}
            <div class="flex items-center gap-2">
              <span class="text-xs text-[var(--color-text-muted)] w-28 shrink-0">{field.name} <span class="opacity-50">({field.range})</span></span>
              <input
                type="text"
                bind:value={parts[i]}
                oninput={updateFromParts}
                class="w-20 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-2 py-1 rounded text-sm font-mono text-center"
              />
              <div class="flex gap-1 flex-wrap">
                {#each field.presets as p}
                  <button
                    onclick={() => { parts[i] = p; updateFromParts(); }}
                    class="px-1.5 py-0.5 rounded text-xs font-mono {parts[i] === p ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}"
                  >{p}</button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>

    <!-- Next runs -->
    <div class="lg:w-72 p-4 space-y-3">
      <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase">Next 5 Runs</h3>
      {#if nextRuns.length > 0}
        <div class="space-y-1.5">
          {#each nextRuns as run, i}
            <div class="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-tertiary)]">
              <span class="text-xs text-[var(--color-text-muted)]">#{i + 1}</span>
              <span class="text-sm text-[var(--color-text-primary)] font-mono">{run}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-[var(--color-text-muted)]">No upcoming runs found</p>
      {/if}
    </div>
  </div>
</div>
