/** Playwright test tags — single source for CI tiering (PR smoke vs nightly regression vs mock). */
export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  mock: '@mock',
  quarantine: '@quarantine',
} as const satisfies Record<string, `@${string}`>;

export type TestTag = (typeof TAGS)[keyof typeof TAGS];
