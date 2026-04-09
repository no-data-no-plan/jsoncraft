const MAX_FILE_SIZE_MB = 50;

/** Strip UTF-8 BOM if present at start of string. Safe no-op otherwise. */
export function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

export function uploadFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error("No file selected"));
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return reject(new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_FILE_SIZE_MB} MB`));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };
    input.click();
  });
}

export function isLargeInput(text: string): boolean {
  return text.length > 5 * 1024 * 1024; // > 5MB
}

export function downloadFile(content: string, filename: string) {
  const mimeMap: Record<string, string> = {
    json: "application/json",
    yaml: "text/yaml",
    toml: "text/plain",
    csv: "text/csv",
  };
  const ext = filename.split(".").pop() || "txt";
  const mime = mimeMap[ext] || "text/plain";
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as unknown as T;
}

export function friendlyError(raw: string): string {
  // JSON parse errors — modern Chrome/V8 format
  let match = raw.match(/at position (\d+)(?: \(line (\d+) column (\d+)\))?/);
  if (match) {
    const line = match[2];
    const col = match[3];
    if (line && col) {
      return `Syntax error at line ${line}, column ${col}`;
    }
    return `Syntax error at position ${match[1]}`;
  }

  // Chrome: "Expected ',' or ']' after array element in JSON at position N"
  match = raw.match(/Expected (.+?) in JSON at position (\d+)/);
  if (match) {
    return `Expected ${match[1]} at position ${match[2]}`;
  }

  match = raw.match(/Unexpected token (.+?) /);
  if (match) {
    const lineMatch = raw.match(/line (\d+)/);
    const line = lineMatch ? ` (line ${lineMatch[1]})` : "";
    return `Unexpected character "${match[1]}"${line}`;
  }

  match = raw.match(/Unexpected end of JSON/);
  if (match) {
    return "Unexpected end of input — missing closing bracket, brace, or quote?";
  }

  // YAML errors
  match = raw.match(/at line (\d+), column (\d+)/);
  if (match) {
    return `YAML error at line ${match[1]}, column ${match[2]}`;
  }

  // TOML errors — smol-toml format
  match = raw.match(/Invalid TOML document:\s*(.+?)(?:\s+at line (\d+))?$/i);
  if (match) {
    const detail = match[1].trim();
    const line = match[2] ? ` (line ${match[2]})` : "";
    return `TOML error: ${detail}${line}`;
  }

  // Fallback: truncate if too long
  if (raw.length > 120) {
    return raw.slice(0, 117) + "...";
  }
  return raw;
}
