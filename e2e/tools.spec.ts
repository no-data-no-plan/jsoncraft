import { test, expect } from "@playwright/test";
import { typeIntoCodeMirror } from "./_helpers";

test.describe("Tool flows", () => {
  test("Formatter: paste → Format → validates → copy button present", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    // Post-2026-04 the formatter lives at /formatter/ — the root is now a
    // landing page (HomeLanding.astro). See home.spec.ts for the landing
    // assertions.
    await page.goto("/formatter/");

    const messy = '{"name":"JSONCraft","features":["format","validate","diff"],"version":1}';
    await typeIntoCodeMirror(page, 0, messy);

    // Debounced processInput (300ms) flips the aria-live status region to "Valid JSON".
    await expect(page.getByText("Valid JSON", { exact: true })).toBeVisible({ timeout: 5_000 });

    // Output CodeMirror (nth=1) now contains pretty-printed JSON — assert at least
    // one indented line appears in the readonly editor.
    const outputEditor = page.locator(".cm-content").nth(1);
    await expect(outputEditor).toContainText('"name": "JSONCraft"');

    // Copy buttons exist for both panels (title attributes are unique).
    await expect(page.getByTitle("Copy output", { exact: true })).toBeVisible();
  });

  test("Diff: Sample button loads two JSONs and shows differences", async ({ page }) => {
    await page.goto("/diff/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.getByRole("button", { name: "Sample", exact: true }).click();

    // Sample data is `{name:"JSONCraft", version:"1.0.0", ...}` (left) vs
    // `version:"2.0.0"` (right). Both load into the two CodeMirror editors.
    const editors = page.locator(".cm-content");
    await expect(editors.nth(0)).toContainText("1.0.0", { timeout: 5_000 });
    await expect(editors.nth(1)).toContainText("2.0.0");

    // loadSample() explicitly calls compare() (JsonDiff.svelte:112), so the
    // summary should appear without any further user action. Summary i18n
    // changed post-2026-04 from "Differences: +X lines" to `+N added −M
    // removed ±K changed` per i18n/tools.ts. Anchor on the stable "added"
    // token. Don't assert on `<pre>` — default viewMode is "side" (paired
    // rows), not "unified" (the `<pre>` branch is unified-only). Asserting
    // on the summary is sufficient proof compare() ran.
    await expect(page.getByText(/added/i).first()).toBeVisible({ timeout: 5_000 });
  });
});
