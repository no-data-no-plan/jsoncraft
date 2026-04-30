import { defineConfig } from "vitest/config";

// Vitest runs unit tests under src/. Playwright owns e2e/ via
// playwright.config.ts (`testDir: "./e2e"`), but vitest's default
// pattern picks up `**/*.spec.ts` and tries to execute the Playwright
// specs as unit tests, producing "test.describe() not expected here"
// failures on every run. Exclude e2e/ explicitly.
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
});
