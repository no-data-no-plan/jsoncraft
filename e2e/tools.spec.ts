import { test, expect } from "@playwright/test";
import { typeIntoCodeMirror } from "./_helpers";

test.describe("Tool flows", () => {
  test("Formatter: paste → Format → validates → copy button present", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

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

    // The diff output region is conditional; it should appear after loadSample → compare.
    // Summary line format: "Differences: +X lines, -Y lines"
    await expect(page.getByText(/Differences:/)).toBeVisible({ timeout: 5_000 });

    // The colored diff block renders inside a <pre>; we expect at least one line
    // showing the changed "version" field (1.0.0 vs 2.0.0).
    const pre = page.locator("pre").first();
    await expect(pre).toContainText("2.0.0");
    await expect(pre).toContainText("1.0.0");
  });
});
