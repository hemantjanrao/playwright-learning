import { resolve } from 'node:path';

/**
 * Handle returned by {@link startWireMockContainer}.
 * Call `stop()` in fixture teardown so containers do not leak across workers.
 */
export interface WireMockContext {
  /** Base URL of the mapped WireMock HTTP port (e.g. `http://localhost:32768`). */
  readonly baseUrl: string;
  /** Stops and removes the Docker container. */
  stop(): Promise<void>;
}

/**
 * Starts a WireMock Docker container with stub mappings from `docker/wiremock/mappings/`.
 *
 * **Requirements**
 * - Docker daemon reachable (local or CI)
 * - Mappings directory present under the repo root
 *
 * Uses a dynamic import of `testcontainers` so the heavy dependency is only
 * loaded when container tests actually run (Node/undici compatibility).
 *
 * Prefer the `wireMock` / `mockApiClient` fixtures from `@fixtures/container.fixture`
 * instead of calling this directly from specs.
 *
 * @returns Context with `baseUrl` for {@link ApiClient} and a `stop` teardown.
 */
export async function startWireMockContainer(): Promise<WireMockContext> {
  const { GenericContainer, Wait } = await import('testcontainers');
  const mappingsDir = resolve(process.cwd(), 'docker/wiremock/mappings');

  const container = await new GenericContainer('wiremock/wiremock:3.9.1')
    .withExposedPorts(8080)
    .withCopyDirectoriesToContainer([{ source: mappingsDir, target: '/home/wiremock/mappings' }])
    .withWaitStrategy(Wait.forHttp('/__admin/mappings', 8080))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(8080);

  return {
    baseUrl: `http://${host}:${port}`,
    stop: async () => {
      await container.stop();
    },
  };
}
