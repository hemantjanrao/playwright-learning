import { execSync } from 'node:child_process';

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
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
