import { test, expect, type Page } from "@playwright/test";

// Extract every JSON-LD blob from <head> and flatten into a type-to-array map.
async function getSchemas(page: Page): Promise<Record<string, unknown[]>> {
  const blobs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const byType: Record<string, unknown[]> = {};
  for (const blob of blobs) {
    const parsed = JSON.parse(blob);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const t = (item as { "@type"?: string })["@type"];
      if (!t) continue;
      (byType[t] ??= []).push(item);
    }
  }
  return byType;
}

test.describe("Schema + heading hygiene", () => {
  test("/privacy/ has WebPage schema + visible page heading", async ({ page }) => {
    await page.goto("/privacy/");

    const schemas = await getSchemas(page);
    expect(schemas["WebPage"]?.length).toBeGreaterThanOrEqual(1);
    // Should NOT be emitted as SoftwareApplication on legal page
    expect(schemas["SoftwareApplication"] ?? []).toHaveLength(0);

    // Page uses <h2>Privacy Policy</h2> (the global Layout owns the only <h1>).
    // Assert the privacy heading is visible — that's the contract that matters
    // to readers + crawlers. Counting <h1> on the page is brittle because the
    // page heading hierarchy is layout-owned, not document-owned.
    await expect(page.getByRole("heading", { name: /Privacy Policy/i }).first()).toBeVisible();
  });

  // NOTE: /vs-json-crack/ page was removed pre-2026-05. The Article-schema
  // verification for that comparison page is no longer applicable. If a similar
  // comparison/competitor page is reintroduced, add the analogous assertion
  // (Article + WebPage + single visible heading).
});
