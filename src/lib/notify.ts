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

export function notify(message: string, kind: ToastKind = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("jc-toast", { detail: { message, kind } }));
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
