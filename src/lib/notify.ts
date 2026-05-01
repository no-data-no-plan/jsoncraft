/** Lightweight toast helper. Dispatches a CustomEvent on `window`; the
 * <NotifyToast> component listens and renders an aria-live region.
 *
 * Use for one-shot success messages — copy, download, format applied. Not
 * for errors (those need inline UX next to the failed action).
 */
export type ToastKind = "success" | "info";

export function notify(message: string, kind: ToastKind = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("jc-toast", { detail: { message, kind } }));
}

/** Convenience: copy + toast in one call. Returns the same boolean as
 *  navigator.clipboard.writeText resolves with (true on success). */
export async function copyAndNotify(text: string, label: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    notify(label);
    return true;
  } catch {
    return false;
  }
}
