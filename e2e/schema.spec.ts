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
  test("/privacy/ has WebPage schema + single h1", async ({ page }) => {
    await page.goto("/privacy/");

    const schemas = await getSchemas(page);
    expect(schemas["WebPage"]?.length).toBeGreaterThanOrEqual(1);
    // Should NOT be emitted as SoftwareApplication on legal page
    expect(schemas["SoftwareApplication"] ?? []).toHaveLength(0);

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("/vs-json-crack/ has Article schema + single h1", async ({ page }) => {
    await page.goto("/vs-json-crack/");

    const schemas = await getSchemas(page);
    expect(schemas["Article"]?.length).toBeGreaterThanOrEqual(1);
    expect(schemas["WebPage"]?.length).toBeGreaterThanOrEqual(1);

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });
});
