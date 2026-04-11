import { test, expect } from "@playwright/test";

test.describe("Theme persistence", () => {
  test("Toggling theme on home persists across navigation", async ({ page }) => {
    await page.goto("/");

    // Default is dark (localStorage key absent → no .light class on <html>)
    await expect(page.locator("html")).not.toHaveClass(/light/);

    // Toggle to light mode
    await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveClass(/light/);

    // localStorage key is set by the inline script
    const stored = await page.evaluate(() => localStorage.getItem("jsoncraft-theme"));
    expect(stored).toBe("light");

    // Navigate to another tool — the blocking script in <head> must re-apply
    // the class before first paint.
    await page.goto("/diff/");
    await expect(page.locator("html")).toHaveClass(/light/);
  });
});
