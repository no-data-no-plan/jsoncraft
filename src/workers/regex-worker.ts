// Web Worker for regex execution with timeout protection against catastrophic backtracking.
self.addEventListener("message", (e: MessageEvent) => {
  const { pattern, flags, testString } = e.data as {
    pattern: string;
    flags: string;
    testString: string;
  };
  try {
    const globalFlags = flags.includes("g") ? flags : flags + "g";
    const re = new RegExp(pattern, globalFlags);
    const serialized: { full: string; index: number; groups: string[] }[] = [];
    if (flags.includes("g")) {
      for (const m of testString.matchAll(re)) {
        serialized.push({
          full: m[0],
          index: m.index ?? 0,
          groups: Array.from(m).slice(1) as string[],
        });
      }
    } else {
      const singleRe = new RegExp(pattern, flags);
      const m = testString.match(singleRe);
      if (m) {
        serialized.push({
          full: m[0],
          index: m.index ?? 0,
          groups: Array.from(m).slice(1) as string[],
        });
      }
    }
    // For highlighted html, also return all global matches (index + length)
    const highlightRanges: { index: number; length: number }[] = [];
    for (const m of testString.matchAll(re)) {
      if (m.index === undefined) continue;
      if (!m[0]) continue;
      highlightRanges.push({ index: m.index, length: m[0].length });
    }
    (self as unknown as Worker).postMessage({ ok: true, matches: serialized, highlightRanges });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    (self as unknown as Worker).postMessage({ ok: false, error: msg });
  }
});
