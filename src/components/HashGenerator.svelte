<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import { t } from "../i18n/common";
  import { tt } from "../i18n/tools";
  import type { Lang } from "../i18n/index";
  import Md5Worker from "../workers/md5-worker.ts?worker";
  import { copyAndNotify } from "../lib/notify";
  import { useToolComplete } from "../lib/tool-complete.svelte";

  let { lang = "en" as Lang } = $props();

  const fireToolComplete = useToolComplete("hash");

  type Mode = "text" | "file" | "hmac";
  type HmacAlgo = "SHA-1" | "SHA-256" | "SHA-512";

  let mode = $state<Mode>("text");
  let input = $state("");
  let secretKey = $state("");
  let hmacAlgo = $state<HmacAlgo>("SHA-256");
  let fileName = $state("");
  let fileSize = $state(0);
  let hashes = $state<{ algo: string; value: string }[]>([]);
  let computing = $state(false);
  let errorMsg = $state("");

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const textAlgorithms: { name: string; algo: string | null }[] = [
    { name: "MD5", algo: null },
    { name: "SHA-1", algo: "SHA-1" },
    { name: "SHA-256", algo: "SHA-256" },
    { name: "SHA-384", algo: "SHA-384" },
    { name: "SHA-512", algo: "SHA-512" },
  ];

  const fileAlgorithms: { name: string; algo: string }[] = [
    { name: "SHA-1", algo: "SHA-1" },
    { name: "SHA-256", algo: "SHA-256" },
    { name: "SHA-384", algo: "SHA-384" },
    { name: "SHA-512", algo: "SHA-512" },
  ];

  let md5Worker: Worker | null = null;
  let md5Timeout: ReturnType<typeof setTimeout> | null = null;

  function cleanupMd5Worker() {
    if (md5Timeout) { clearTimeout(md5Timeout); md5Timeout = null; }
    if (md5Worker) { md5Worker.terminate(); md5Worker = null; }
  }

  function md5Async(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cleanupMd5Worker();
      md5Worker = new Md5Worker();
      md5Worker.onmessage = (e: MessageEvent) => {
        if (md5Timeout) { clearTimeout(md5Timeout); md5Timeout = null; }
        const data = e.data as { ok: true; hash: string } | { ok: false; error: string };
        if (md5Worker) { md5Worker.terminate(); md5Worker = null; }
        if (data.ok) resolve(data.hash);
        else reject(new Error(data.error));
      };
      md5Worker.onerror = (ev) => {
        if (md5Timeout) { clearTimeout(md5Timeout); md5Timeout = null; }
        if (md5Worker) { md5Worker.terminate(); md5Worker = null; }
        reject(new Error(ev.message || "Worker error"));
      };
      md5Timeout = setTimeout(() => {
        if (md5Worker) { md5Worker.terminate(); md5Worker = null; }
        md5Timeout = null;
        reject(new Error(tt("hash", lang, "workerTimeout")));
      }, 10000);
      md5Worker.postMessage({ text });
    });
  }

  async function digestHex(algorithm: string, bytes: BufferSource): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
    const arr = Array.from(new Uint8Array(hashBuffer));
    return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function computeTextHash(text: string, algo: string): Promise<string> {
    const encoder = new TextEncoder();
    return digestHex(algo, encoder.encode(text));
  }

  async function hmac(algorithm: HmacAlgo, key: string, message: string): Promise<string> {
    const keyBytes = new TextEncoder().encode(key);
    const msgBytes = new TextEncoder().encode(message);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: algorithm },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
    return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function errorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return tt("hash", lang, "unknownError");
  }

  async function computeAllTextHashes(val: string) {
    errorMsg = "";
    if (!val) { hashes = []; return; }
    computing = true;
    try {
      const results: { algo: string; value: string }[] = [];
      // MD5 via worker
      try {
        const md5Hex = await md5Async(val);
        results.push({ algo: "MD5", value: md5Hex });
      } catch (e: unknown) {
        results.push({ algo: "MD5", value: "(" + errorMessage(e) + ")" });
      }
      for (const a of textAlgorithms) {
        if (a.algo) {
          results.push({ algo: a.name, value: await computeTextHash(val, a.algo) });
        }
      }
      hashes = results;
      fireToolComplete();
    } finally {
      computing = false;
    }
  }

  async function computeHmac() {
    errorMsg = "";
    if (!secretKey || !input) { hashes = []; return; }
    computing = true;
    try {
      const value = await hmac(hmacAlgo, secretKey, input);
      hashes = [{ algo: `HMAC-${hmacAlgo}`, value }];
      fireToolComplete();
    } catch (e: unknown) {
      errorMsg = errorMessage(e);
      hashes = [];
      fireToolComplete('error');
    } finally {
      computing = false;
    }
  }

  async function computeFileHashes(file: File) {
    errorMsg = "";
    if (file.size > MAX_FILE_SIZE) {
      errorMsg = tt("hash", lang, "fileTooLarge");
      hashes = [];
      return;
    }
    computing = true;
    try {
      const buffer = await file.arrayBuffer();
      const results: { algo: string; value: string }[] = [];
      results.push({ algo: "MD5", value: "(" + tt("hash", lang, "md5FileUnsupported") + ")" });
      for (const a of fileAlgorithms) {
        results.push({ algo: a.name, value: await digestHex(a.algo, buffer) });
      }
      hashes = results;
      fireToolComplete();
    } catch (e: unknown) {
      errorMsg = errorMessage(e);
      hashes = [];
      fireToolComplete('error');
    } finally {
      computing = false;
    }
  }

  function handleTextInput(val: string) {
    input = val;
    if (mode === "text") computeAllTextHashes(val);
    else if (mode === "hmac") computeHmac();
  }

  function handleSecretKeyInput(e: Event) {
    secretKey = (e.target as HTMLInputElement).value;
    if (mode === "hmac") computeHmac();
  }

  function handleHmacAlgoChange(e: Event) {
    hmacAlgo = (e.target as HTMLSelectElement).value as HmacAlgo;
    if (mode === "hmac") computeHmac();
  }

  function handleFileInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) { fileName = ""; fileSize = 0; hashes = []; return; }
    fileName = file.name;
    fileSize = file.size;
    computeFileHashes(file);
  }

  function switchMode(newMode: Mode) {
    mode = newMode;
    hashes = [];
    errorMsg = "";
    if (newMode === "text" && input) computeAllTextHashes(input);
    else if (newMode === "hmac" && input && secretKey) computeHmac();
  }

  function copy(val: string) {
    copyAndNotify(val, t(lang, "copied"), t(lang, "copyFailed"));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-wrap">
    <button
      onclick={() => switchMode("text")}
      class="px-3 py-1 rounded text-sm {mode === 'text' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'}"
    >{tt("hash", lang, "modeText")}</button>
    <button
      onclick={() => switchMode("file")}
      class="px-3 py-1 rounded text-sm {mode === 'file' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'}"
    >{tt("hash", lang, "modeFile")}</button>
    <button
      onclick={() => switchMode("hmac")}
      class="px-3 py-1 rounded text-sm {mode === 'hmac' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'}"
    >{tt("hash", lang, "modeHmac")}</button>

    {#if mode === "hmac"}
      <span class="w-px h-5 bg-[var(--color-border)]"></span>
      <label class="text-xs text-[var(--color-text-muted)]">{tt("hash", lang, "hmacAlgorithm")}:</label>
      <select
        value={hmacAlgo}
        onchange={handleHmacAlgoChange}
        class="px-2 py-1 rounded text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
      >
        <option value="SHA-1">HMAC-SHA1</option>
        <option value="SHA-256">HMAC-SHA256</option>
        <option value="SHA-512">HMAC-SHA512</option>
      </select>
    {/if}

    <span aria-live="polite">
    {#if computing}
      <span class="text-xs text-[var(--color-accent-fg)] ml-auto">{tt("hash", lang, "hashing")}</span>
    {/if}
    </span>
  </div>

  {#if mode === "hmac"}
    <div class="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <label class="block text-xs text-[var(--color-text-muted)] mb-1">{tt("hash", lang, "secretKey")}</label>
      <input
        type="text"
        value={secretKey}
        oninput={handleSecretKeyInput}
        placeholder={tt("hash", lang, "secretKeyPlaceholder")}
        class="w-full px-2 py-1 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-mono"
      />
    </div>
  {/if}

  {#if errorMsg}
    <div class="px-3 py-1 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border-b border-[var(--color-border)]" aria-live="polite">{errorMsg}</div>
  {/if}

  <div class="flex-1 flex flex-col lg:flex-row min-h-0">
    <div class="flex-1 flex flex-col min-h-0">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{t(lang, "input")}</div>
      {#if mode === "file"}
        <div class="flex-1 p-3 flex flex-col gap-2">
          <label class="inline-flex items-center gap-2 px-3 py-2 rounded text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-secondary)] w-fit">
            {tt("hash", lang, "chooseFile")}
            <input type="file" onchange={handleFileInput} class="hidden" />
          </label>
          {#if fileName}
            <div class="text-xs text-[var(--color-text-secondary)] font-mono break-all">
              {fileName} <span class="text-[var(--color-text-muted)]">({formatSize(fileSize)})</span>
            </div>
          {:else}
            <div class="text-xs text-[var(--color-text-muted)]">{tt("hash", lang, "noFile")}</div>
          {/if}
        </div>
      {:else}
        <div class="flex-1 p-2">
          <CodeEditor value={input} onchange={handleTextInput} lang="text" placeholder={tt("hash", lang, "inputPlaceholder")} />
        </div>
      {/if}
    </div>
    <div class="w-px bg-[var(--color-border)] hidden lg:block"></div>
    <div class="flex-1 flex flex-col min-h-0 overflow-auto">
      <div class="px-3 py-1 text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">{tt("hash", lang, "hashes")}</div>
      <div class="p-3 space-y-3" aria-live="polite">
        {#each hashes as h}
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[var(--color-text-secondary)]">{h.algo}</span>
              <button onclick={() => copy(h.value)} class="text-xs text-[var(--color-accent-fg)] hover:underline">{t(lang, "copy")}</button>
            </div>
            <div class="p-2 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs text-[var(--color-text-primary)] break-all select-all">
              {h.value}
            </div>
          </div>
        {/each}
        {#if hashes.length === 0 && !computing}
          <p class="text-sm text-[var(--color-text-muted)]">
            {#if mode === "hmac"}{tt("hash", lang, "enterKeyAndMessage")}{:else}{tt("hash", lang, "emptyHint")}{/if}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
