// Web Worker for MD5 hashing (RFC 1321). Moves sync MD5 off the main thread.
function md5(str: string): string {
  function rotl(v: number, s: number) { return (v << s) | (v >>> (32 - s)); }
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(2 ** 32 * Math.abs(Math.sin(i + 1)));
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
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + K[i] + M[g]) | 0;
      A = D; D = C; C = B; B = (B + rotl(F, S[i])) | 0;
    }
    a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
  }
  const hex = (v: number) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, v, true);
    return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

self.addEventListener("message", (e: MessageEvent) => {
  const { text } = e.data as { text: string };
  try {
    (self as unknown as Worker).postMessage({ ok: true, hash: md5(text) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    (self as unknown as Worker).postMessage({ ok: false, error: msg });
  }
});
