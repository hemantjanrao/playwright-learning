import { resolve } from 'node:path';

export interface WireMockContext {
  readonly baseUrl: string;
  stop(): Promise<void>;
}

/**
 * Starts a WireMock Docker container with stub mappings from `docker/wiremock/mappings/`.
 * Requires Docker daemon (local or CI).
 *
 * Uses dynamic import to avoid loading testcontainers until this runs (Node/undici compat).
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
