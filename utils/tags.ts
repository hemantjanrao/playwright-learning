/** Playwright test tags — used for CI tiering (PR smoke vs nightly regression). */
export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  quarantine: '@quarantine',
} as const satisfies Record<string, `@${string}`>;
