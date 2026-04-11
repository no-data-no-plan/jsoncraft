import type { Page, ConsoleMessage } from "@playwright/test";

// Collect console.error and page errors during a test. Noise-tolerant: ignores
// AdSense/Formspree network failures that are expected in preview mode because
// those origins aren't reachable without the CF middleware + production CSP.
//
// Returns an object with a live `errors` array plus a helper to assert cleanly
// at the end of a test.
const IGNORED_PATTERNS: RegExp[] = [
  /googlesyndication/i,
  /adtrafficquality/i,
  /doubleclick/i,
  /fundingchoices/i,
  /formspree/i,
  /adsbygoogle/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /net::ERR_/i,
  /Failed to load resource/i,
];

function shouldIgnore(text: string): boolean {
  return IGNORED_PATTERNS.some((re) => re.test(text));
}

export function collectConsoleErrors(page: Page): { errors: string[] } {
  const errors: string[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (shouldIgnore(text)) return;
    errors.push(text);
  };

  const onPageError = (err: Error) => {
    const text = err.message || String(err);
    if (shouldIgnore(text)) return;
    errors.push(`pageerror: ${text}`);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  return { errors };
}

// CodeMirror uses a contenteditable .cm-content div. `.fill()` does not work
// reliably on contenteditable; click-to-focus + keyboard.insertText is the
// recommended pattern and is 100× faster than per-character typing.
export async function typeIntoCodeMirror(page: Page, nth: number, text: string): Promise<void> {
  const editor = page.locator(".cm-content").nth(nth);
  await editor.click();
  await page.keyboard.insertText(text);
}
