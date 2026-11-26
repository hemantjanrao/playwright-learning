/**
 * Playwright test tags — single source for CI tiering.
 *
 * | Tag | Tier | Typical command |
 * |-----|------|-----------------|
 * | `@smoke` | PR fast path | `npm run test:pr` / `test:smoke` |
 * | `@regression` | Nightly full suite | `npm run test:regression` |
 * | `@mock` | MSW / Docker / page.route | `npm run test:mock` |
 * | `@quarantine` | Known flake — exclude from gating | filtered out of PR |
 *
 * @example
 * ```ts
 * test('should login…', { tag: [TAGS.smoke, TAGS.regression] }, async ({ … }) => { … });
 * ```
 */
export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  mock: '@mock',
  quarantine: '@quarantine',
} as const satisfies Record<string, `@${string}`>;

/** Union of all framework tag string literals. */
export type TestTag = (typeof TAGS)[keyof typeof TAGS];
