/** Lightweight toast helper. Dispatches a CustomEvent on `window`; the
 * <NotifyToast> component listens and renders an aria-live region.
 *
 * Three kinds:
 *   - "success" / "info": positive feedback (copy, download, format applied)
 *   - "error": failures that aren't tied to a specific input (clipboard
 *     denied, parse failed mid-flow). Inline-error UX is still preferred
 *     when you can attach context next to the failed control; reach for
 *     this when the failure has no anchor.
 */
export type ToastKind = "success" | "info" | "error";

const EVENT_NAME = "jc-toast";

export interface ToastOptions {
  /** Stable identity. If a toast with this id is still visible, the call
   *  refreshes it (resets timer, updates text) instead of stacking. Use to
   *  collapse rapid-fire identical events into a single visible toast. */
  id?: string;
  /** Override the default duration (ms). Defaults: success/info 5000,
   *  error 7000. Pass 0 to make sticky (close-button only). */
  durationMs?: number;
}

export function notify(message: string, kind: ToastKind = "success", opts: ToastOptions = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { message, kind, ...opts } }));
}

/** Convenience: copy + toast in one call. Returns true on success.
 *  On clipboard failure (browser denied permission, secure-context
 *  missing, etc.) surfaces an aria-live error toast instead of failing
 *  silently — closes the H9 gap from re-audit 2026-05-01. */
export async function copyAndNotify(text: string, label: string, errorLabel?: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    notify(errorLabel ?? "Clipboard not available", "error");
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    notify(label);
    return true;
  } catch {
    notify(errorLabel ?? "Copy failed", "error");
    return false;
  }
}

/** Convenience: trigger a Blob download + toast in one call. Returns true
 *  on success. Constructs the anchor + click + revoke inside so callers
 *  don't need to repeat the boilerplate. For text-based downloads that
 *  already go through `fileutils.downloadFile()`, just append a `notify()`
 *  after the existing call instead of switching to this helper. */
export async function downloadAndNotify(blob: Blob, filename: string, label: string, errorLabel?: string): Promise<boolean> {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    notify(errorLabel ?? "Download not available", "error");
    return false;
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify(label);
    return true;
  } catch {
    notify(errorLabel ?? "Download failed", "error");
    return false;
  }
}
