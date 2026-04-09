type Format = "json" | "yaml" | "toml" | "csv";

interface WorkerResult {
  output: string;
  warnings: string[];
  matchCount?: number;
}

let worker: Worker | null = null;
let idCounter = 0;
const pending = new Map<number, { resolve: (v: WorkerResult) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./convert-worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const { id, type, output, warnings, matchCount, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (type === "error") {
        p.reject(new Error(error));
      } else {
        p.resolve({ output, warnings: warnings || [], matchCount });
      }
    };
  }
  return worker;
}

const WORKER_TIMEOUT_MS = 30_000;

function send(msg: Record<string, unknown>): Promise<WorkerResult> {
  const id = ++idCounter;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      if (worker) { worker.terminate(); worker = null; }
      reject(new Error("Conversion timed out — input may be too large or complex"));
    }, WORKER_TIMEOUT_MS);
    pending.set(id, {
      resolve: (v) => { clearTimeout(timer); resolve(v); },
      reject: (e) => { clearTimeout(timer); reject(e); },
    });
    getWorker().postMessage({ ...msg, id });
  });
}

// Threshold: use worker for inputs larger than this
const WORKER_THRESHOLD = 512 * 1024; // 512 KB

export function shouldUseWorker(input: string): boolean {
  return input.length > WORKER_THRESHOLD;
}

export function convertInWorker(input: string, from: Format, to: Format): Promise<WorkerResult> {
  return send({ type: "convert", from, to, input });
}

export function parseInWorker(input: string): Promise<WorkerResult> {
  return send({ type: "parse", input });
}

export function diffInWorker(left: string, right: string): Promise<WorkerResult> {
  return send({ type: "diff", left, right });
}

export function jsonpathInWorker(input: string, path: string): Promise<WorkerResult> {
  return send({ type: "jsonpath", input, path });
}
