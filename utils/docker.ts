import { execSync } from 'node:child_process';

/** Returns true when Docker daemon is reachable (required for Testcontainers). */
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
