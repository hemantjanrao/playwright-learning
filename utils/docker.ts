import { execFileSync } from 'node:child_process';

/**
 * Returns `true` when the Docker daemon is reachable.
 *
 * Used to skip Testcontainers specs gracefully when Docker is unavailable.
 * Set `SKIP_DOCKER_TESTS=true` to force a skip without probing Docker.
 */
export function isDockerAvailable(): boolean {
  if (process.env.SKIP_DOCKER_TESTS === 'true') {
    return false;
  }
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore', timeout: 10_000, killSignal: 'SIGKILL' });
    return true;
  } catch {
    if (process.env.CI)
      throw new Error('Docker is required in CI; container coverage must not silently skip.');
    return false;
  }
}
