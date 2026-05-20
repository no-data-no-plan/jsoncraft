import { test, expect } from "@playwright/test";
import { collectConsoleErrors } from "./_helpers";

// NOTE: Pre-2026-04 the home page (`/`) mounted JsonFormatter directly.
// Post-refactor the home is a landing page (`HomeLanding.astro`) with a hero
// + tool-groups grid mirroring the sidebar. The actual JsonFormatter lives
// at `/formatter/`. These tests now verify the landing renders correctly;
// formatter-specific assertions live in tools.spec.ts.

test.describe("Home + i18n", () => {
  test("EN home loads without console errors", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/");
    // Title evolved post-2026-04 from "JSON Formatter — JSONCraft" to broader
    // "JSONCraft — Free JSON, YAML, CSV & TOML Tools in Your Browser". Anchor
    // on brand name only; specific tool claims drift with the homepage copy.
    await expect(page).toHaveTitle(/JSONCraft/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Landing renders: hero h1 + tool-groups landmark + at least one group h2.
    // `<section aria-label="JSONCraft tools">` is a region (not navigation —
    // a <section> with aria-label takes role="region", not "navigation").
    await expect(page.locator("h1.hero-heading").first()).toBeVisible();
    await expect(page.getByRole("region", { name: "JSONCraft tools" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Core" })).toBeVisible();

    // LangToggle landmark is rendered (aria-label is "Language" on EN locale).
    await expect(page.getByRole("navigation", { name: "Language" })).toBeVisible();

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("ES home loads with Spanish UI + hreflang alternate to EN", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/es/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    // Landing renders in Spanish: hero h1 has localized copy.
    await expect(page.locator("h1.hero-heading").first()).toBeVisible();

    // LangToggle landmark is "Idioma" on ES locale (per LangToggle.astro
    // navLabel = lang === "es" ? "Idioma" : "Language").
    await expect(page.getByRole("navigation", { name: "Idioma" })).toBeVisible();

    // hreflang EN alternate points to root.
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute("href", /jsoncraft\.dev\/$/);

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("Language switch from EN home → /es/ and UI becomes Spanish", async ({ page }) => {
    await page.goto("/");

    // The ES link lives inside the Language nav landmark (EN locale labels it
    // "Language"; the link inside has Spanish aria-label "Cambiar a español").
    const langNav = page.getByRole("navigation", { name: "Language" });
    await langNav.getByRole("link", { name: "Cambiar a español" }).click();

    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    // Confirm we landed on the ES landing (hero h1 visible + nav landmark relabeled).
    await expect(page.locator("h1.hero-heading").first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Idioma" })).toBeVisible();
  });
});
