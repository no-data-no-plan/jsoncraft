<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";

  let { lang = "en" as Lang } = $props();

  let input = "";
  let hashes: { algo: string; value: string }[] = [];
  let computing = false;

  const algorithms = [
    { name: "MD5", algo: null },
    { name: "SHA-1", algo: "SHA-1" },
    { name: "SHA-256", algo: "SHA-256" },
    { name: "SHA-384", algo: "SHA-384" },
    { name: "SHA-512", algo: "SHA-512" },
  ];

  async function computeHash(text: string, algo: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Simple MD5 (no Web Crypto support for MD5)
  function md5(str: string): string {
    function rotl(v: number, s: number) { return (v << s) | (v >>> (32 - s)); }
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(2**32 * Math.abs(Math.sin(i + 1)));
    const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    const bytes = new TextEncoder().encode(str);
    const bitLen = bytes.length * 8;
    const padLen = ((bytes.length + 8) >>> 6 << 6) + 64;
    const buf = new Uint8Array(padLen);
    buf.set(bytes);
    buf[bytes.length] = 0x80;
    new DataView(buf.buffer).setUint32(padLen - 8, bitLen, true);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const view = new DataView(buf.buffer);
    for (let off = 0; off < padLen; off += 64) {
      const M = new Uint32Array(16);
      for (let j = 0; j < 16; j++) M[j] = view.getUint32(off + j * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F: number, g: number;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5*i+1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3*i+5) % 16; }
        else { F = C ^ (B | ~D); g = (7*i) % 16; }
        F = (F + A + K[i] + M[g]) | 0;
        A = D; D = C; C = B; B = (B + rotl(F, S[i])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    const hex = (v: number) => {
      const b = new Uint8Array(4);
      new DataView(b.buffer).setUint32(0, v, true);
      return Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("");
    };
    return hex(a0) + hex(b0) + hex(c0) + hex(d0);
  }

  async function handleInput(val: string) {
    input = val;
    if (!val) { hashes = []; return; }
    computing = true;
    const results: { algo: string; value: string }[] = [];
    results.push({ algo: "MD5", value: md5(val) });
    for (const a of algorithms) {
      if (a.algo) {
        results.push({ algo: a.name, value: await computeHash(val, a.algo) });
      }
    }
    hashes = results;
    computing = false;
  }

  function copy(val: string) {
    navigator.clipboard.writeText(val);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
    <span class="text-sm text-[var(--color-text-secondary)]">{tt("hash", lang, "pasteToHash")}</span>
    {#if computing}
      <span class="text-xs text-[var(--color-accent)] ml-auto">{t(lang, "computing")}</span>
    {/if}
  </div>

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{t(lang, "input")}</div>
      <div class="flex-1 p-2">
        <CodeEditor value={input} onchange={handleInput} lang="text" placeholder={tt("hash", lang, "inputPlaceholder")} />
      </div>
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0 overflow-auto">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{tt("hash", lang, "hashes")}</div>
      <div class="p-3 space-y-3">
        {#each hashes as h}
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[var(--color-text-secondary)]">{h.algo}</span>
              <button onclick={() => copy(h.value)} class="text-xs text-[var(--color-accent)] hover:underline">{t(lang, "copy")}</button>
            </div>
            <div class="p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs text-[var(--color-text-primary)] break-all select-all">
              {h.value}
            </div>
          </div>
        {/each}
        {#if hashes.length === 0}
          <p class="text-sm text-[var(--color-text-muted)]">{tt("hash", lang, "emptyHint")}</p>
        {/if}
      </div>
    </div>
  </div>
</div>
