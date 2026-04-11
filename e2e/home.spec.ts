import { test, expect } from "@playwright/test";
import { collectConsoleErrors } from "./_helpers";

test.describe("Home + i18n", () => {
  test("EN home loads without console errors", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/");
    await expect(page).toHaveTitle(/JSON Formatter.*JSONCraft/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1").first()).toBeVisible();

    // LangToggle landmark is rendered
    await expect(page.getByRole("navigation", { name: "Language" })).toBeVisible();

    // JsonFormatter mounted: Format button visible
    await expect(page.getByRole("button", { name: "Format", exact: true })).toBeVisible();

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("ES home loads with Spanish UI + hreflang alternate to EN", async ({ page }) => {
    const { errors } = collectConsoleErrors(page);

    await page.goto("/es/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    // Format button localized
    await expect(page.getByRole("button", { name: "Formatear", exact: true })).toBeVisible();

    // hreflang EN alternate points to root
    const hreflangEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(hreflangEn).toHaveAttribute("href", /jsoncraft\.dev\/$/);

    expect(errors, `unexpected console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("Language switch from EN home → /es/ and UI becomes Spanish", async ({ page }) => {
    await page.goto("/");

    // The ES link lives inside the Language nav landmark
    const langNav = page.getByRole("navigation", { name: "Language" });
    await langNav.getByRole("link", { name: "Cambiar a español" }).click();

    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("button", { name: "Formatear", exact: true })).toBeVisible();
  });
});
