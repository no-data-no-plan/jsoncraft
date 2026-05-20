/**
 * [PW-GUARD-V1] Test fixture that flags every browser context as Playwright.
 *
 * Sets `window.__PW_TEST__ = true` before any page script runs, so the gtag
 * init in Layout.astro / 404.astro skips GA4 firing entirely.
 *
 * The site's gtag guard also checks `navigator.webdriver`, which Playwright
 * sets to true by default — so existing tests that still import directly
 * from `@playwright/test` are already protected. This fixture is belt-and-
 * suspenders for the case where a test disables the webdriver flag (e.g.
 * `launchOptions: { args: ['--disable-blink-features=AutomationControlled'] }`
 * to test against anti-bot sites).
 *
 * Usage: replace `import { test, expect } from '@playwright/test'` with
 * `import { test, expect } from './test-base'`. No other changes needed.
 *
 * Why this exists: diagnosis 2026-05-20 in CompoundVision — 6047 fake
 * pageviews on /pro/ in April were our own e2e tests, geoIP'd to "Parla"
 * (Madrid POP). The same fix is applied portfolio-wide to keep all sites'
 * GA4 metrics clean.
 */
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (window as Window & { __PW_TEST__?: boolean }).__PW_TEST__ = true;
    });
    await use(page);
  },
});

export { expect };
