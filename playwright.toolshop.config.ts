import { defineConfig } from '@playwright/test';

/** Toolshop API only. Artifacts stay out of the Sauce Demo run. */
export default defineConfig({
  testDir: './tests/toolshop/api',
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/toolshop' }]],
  outputDir: 'test-results/toolshop',
  projects: [{ name: 'toolshop-api' }],
});
