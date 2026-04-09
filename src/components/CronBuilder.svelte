<script lang="ts">
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let expression = $state("* * * * *");
  let parts = $state(["*", "*", "*", "*", "*"]);
  let nextRuns = $state<string[]>([]);
  let error = $state("");
  let validationError = $state("");

  const fieldSpecs = [
    { name: "minute", min: 0, max: 59 },
    { name: "hour", min: 0, max: 23 },
    { name: "dayOfMonth", min: 1, max: 31 },
    { name: "month", min: 1, max: 12 },
    { name: "dayOfWeek", min: 0, max: 7 }, // 7 allowed as Sunday alias
  ];

  function validateField(fieldStr: string, spec: { min: number; max: number; name: string }): string | null {
    if (fieldStr === "*") return null;
    const stepMatch = fieldStr.match(/^\*\/(\d+)$/);
    if (stepMatch) {
      const step = parseInt(stepMatch[1], 10);
      if (step < 1) return `Step must be >= 1 in ${spec.name}`;
      return null;
    }
    for (const part of fieldStr.split(",")) {
      const rangeMatch = part.match(/^(\d+)(?:-(\d+))?(?:\/(\d+))?$/);
      if (!rangeMatch) return `Invalid ${spec.name}: "${part}"`;
      const a = parseInt(rangeMatch[1], 10);
      const b = rangeMatch[2] !== undefined ? parseInt(rangeMatch[2], 10) : a;
      if (a < spec.min || a > spec.max) return `${spec.name} out of range (${spec.min}-${spec.max}): ${a}`;
      if (b < spec.min || b > spec.max) return `${spec.name} out of range (${spec.min}-${spec.max}): ${b}`;
      if (b < a) return `Invalid range ${a}-${b} in ${spec.name}`;
      if (rangeMatch[3] !== undefined) {
        const step = parseInt(rangeMatch[3], 10);
        if (step < 1) return `Step must be >= 1 in ${spec.name}`;
      }
    }
    return null;
  }

  const fieldDefs = [
    { nameKey: "minute" as const, range: "0-59", presets: ["*", "0", "15", "30", "45", "*/5", "*/10", "*/15", "*/30"] },
    { nameKey: "hour" as const, range: "0-23", presets: ["*", "0", "6", "8", "12", "18", "*/2", "*/4", "*/6"] },
    { nameKey: "dayOfMonth" as const, range: "1-31", presets: ["*", "1", "15", "*/2"] },
    { nameKey: "month" as const, range: "1-12", presets: ["*", "1", "*/2", "*/3", "*/6"] },
    { nameKey: "dayOfWeek" as const, range: "0-6", presets: ["*", "0", "1-5", "6,0"] },
  ];

  const quickPresetDefs = [
    { labelKey: "everyMinute" as const, value: "* * * * *" },
    { labelKey: "every5min" as const, value: "*/5 * * * *" },
    { labelKey: "every15min" as const, value: "*/15 * * * *" },
    { labelKey: "every30min" as const, value: "*/30 * * * *" },
    { labelKey: "everyHour" as const, value: "0 * * * *" },
    { labelKey: "every2hours" as const, value: "0 */2 * * *" },
    { labelKey: "dailyMidnight" as const, value: "0 0 * * *" },
    { labelKey: "daily9am" as const, value: "0 9 * * *" },
    { labelKey: "weekdays9am" as const, value: "0 9 * * 1-5" },
    { labelKey: "weeklySunday" as const, value: "0 0 * * 0" },
    { labelKey: "monthly1st" as const, value: "0 0 1 * *" },
    { labelKey: "yearlyJan1" as const, value: "0 0 1 1 *" },
  ];

  function updateFromParts() {
    expression = parts.join(" ");
    computeNextRuns();
  }

  function updateFromExpression() {
    error = "";
    const p = expression.trim().split(/\s+/);
    if (p.length !== 5) { error = tt("cron", lang, "mustHave5"); nextRuns = []; return; }
    parts = [...p];
    computeNextRuns();
  }

  function runValidation(): boolean {
    validationError = "";
    for (let i = 0; i < 5; i++) {
      const err = validateField(parts[i], fieldSpecs[i]);
      if (err) {
        validationError = err;
        return false;
      }
    }
    return true;
  }

  function applyPreset(val: string) {
    expression = val;
    updateFromExpression();
  }

  function computeNextRuns() {
    error = "";
    nextRuns = [];
    if (!runValidation()) { return; }
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
    // Normalize day-of-week: POSIX cron allows 7 as Sunday (same as 0)
    const normalizedDow = p[4].replace(/\b7\b/g, "0");
    return (
      matchField(d.getMinutes(), p[0], 0, 59) &&
      matchField(d.getHours(), p[1], 0, 23) &&
      matchField(d.getDate(), p[2], 1, 31) &&
      matchField(d.getMonth() + 1, p[3], 1, 12) &&
      matchField(d.getDay(), normalizedDow, 0, 6)
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
    const [min, hr, dom, mon, dow] = parts;
    const es = lang === "es";
    if (parts.every(p => p === "*")) return es ? "Cada minuto" : "Every minute";
    const pieces: string[] = [];
    // Time
    if (min.startsWith("*/")) pieces.push(es ? `cada ${min.slice(2)} minutos` : `every ${min.slice(2)} minutes`);
    else if (hr.startsWith("*/")) pieces.push(es ? `cada ${hr.slice(2)} horas en el minuto ${min}` : `every ${hr.slice(2)} hours at minute ${min}`);
    else if (hr !== "*" && min !== "*") pieces.push(`${es ? "a las" : "at"} ${hr.padStart(2, "0")}:${min.padStart(2, "0")}`);
    else if (min !== "*") pieces.push(es ? `en el minuto ${min}` : `at minute ${min}`);
    else if (hr !== "*") pieces.push(es ? `durante la hora ${hr}` : `during hour ${hr}`);
    // Day
    if (dow === "1-5") pieces.push(es ? "entre semana" : "on weekdays");
    else if (dow === "6,0" || dow === "0,6") pieces.push(es ? "los fines de semana" : "on weekends");
    else if (dow !== "*") {
      const days = es ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const raw = parseInt(dow);
      // POSIX: 7 == 0 (Sunday)
      const d = raw === 7 ? 0 : raw;
      pieces.push(es ? `el ${days[d] ?? `día ${dow}`}` : `on ${days[d] ?? `day ${dow}`}`);
    }
    if (dom !== "*") pieces.push(es ? `el día ${dom} del mes` : `on day ${dom} of the month`);
    if (mon !== "*") {
      const months = es
        ? ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        : ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = parseInt(mon);
      pieces.push(es ? `en ${months[m] ?? `mes ${mon}`}` : `in ${months[m] ?? `month ${mon}`}`);
    }
    return pieces.join(", ").replace(/^./, c => c.toUpperCase());
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
    <button onclick={copy} class="px-3 py-2 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">{t(lang, "copy")}</button>
  </div>

  {#if error}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]">{error}</div>
  {/if}

  {#if validationError}
    <div class="px-3 py-2 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)] font-mono">{validationError}</div>
  {/if}

  <div class="p-3 text-sm text-[var(--color-text-secondary)] text-center border-b border-[var(--color-border)]">
    {describe()}
  </div>

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <!-- Builder -->
    <div class="flex-1 p-4 space-y-4 overflow-auto">
      <!-- Quick presets -->
      <div>
        <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">{tt("cron", lang, "quickPresets")}</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {#each quickPresetDefs as preset}
            <button
              onclick={() => applyPreset(preset.value)}
              class="px-2 py-1.5 rounded text-xs text-left {expression === preset.value
                ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'}"
            >
              <div class="font-medium">{tt("cron", lang, preset.labelKey)}</div>
              <div class="font-mono text-[10px] opacity-60">{preset.value}</div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Field editors -->
      <div>
        <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">{tt("cron", lang, "fields")}</h3>
        <div class="space-y-2">
          {#each fieldDefs as field, i}
            <div class="flex items-center gap-2">
              <span class="text-xs text-[var(--color-text-muted)] w-28 shrink-0">{tt("cron", lang, field.nameKey)} <span class="opacity-50">({field.range})</span></span>
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
      <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase">{tt("cron", lang, "next5Runs")}</h3>
      {#if nextRuns.length > 0}
        <div class="space-y-1.5">
          {#each nextRuns as run, i}
            <div class="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-tertiary)]">
              <span class="text-xs text-[var(--color-text-muted)]">#{i + 1}</span>
              <span class="text-sm text-[var(--color-text-primary)] font-mono">{run}</span>
            </div>
          {/each}
        </div>
      {:else if validationError}
        <p class="text-sm text-[var(--color-error)]">{validationError}</p>
      {:else}
        <p class="text-sm text-[var(--color-text-muted)]">{tt("cron", lang, "noUpcoming")}</p>
      {/if}
    </div>
  </div>
</div>
