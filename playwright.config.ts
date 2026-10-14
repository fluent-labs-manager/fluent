import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const PORT = isCI ? 4173 : 5180
const BASE_URL = `http://localhost:${PORT}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 4 : undefined,
  reporter: [
    ...(isCI ? [['github'] as const] : []),
    ['list'],
    ['html', { open: 'never' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: BASE_URL,

    /* Failure diagnostics: traces and screenshots are saved to test-results/ and included in the HTML report. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',

    /* Run headlessly; to watch the tests, use `npm run test:e2e -- --headed`. */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: isCI
      ? `npm run preview -- --port ${PORT} --strictPort`
      : `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    /* Reuse an existing local e2e server on port 5180; always start a fresh one in CI. */
    reuseExistingServer: !isCI,
    env: {
      VITE_API_URL: process.env.VITE_API_URL ?? '',
      VITE_API_SOCKET_URL: process.env.VITE_API_SOCKET_URL ?? '',
      VITE_SENTRY_DSN_URL: '',
    },
  },
})
