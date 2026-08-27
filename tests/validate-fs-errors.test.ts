import { describe, it, expect, beforeAll } from '@jest/globals';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * E2E: `cairel validate <nonexistent>` must fail gracefully — a friendly
 * message and exit code 1, never a raw Node.js ENOENT stack trace. (TASK-020)
 *
 * Spawns the built CLI (dist/index.js). Skips gracefully if the build output
 * is missing.
 */
const CLI = join(__dirname, '..', 'dist', 'index.js');

interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
  combined: string;
}

function runValidate(...args: string[]): RunResult {
  try {
    const stdout = execFileSync('node', [CLI, 'validate', ...args], {
      encoding: 'utf-8',
      cwd: __dirname, // a dir with no .kiro/.amazonq config
    });
    return { status: 0, stdout, stderr: '', combined: stdout };
  } catch (err: any) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const stderr = err.stderr ? err.stderr.toString() : '';
    return { status: err.status ?? null, stdout, stderr, combined: stdout + stderr };
  }
}

describe('validate — graceful error handling for non-existent paths (E2E)', () => {
  beforeAll(() => {
    if (!existsSync(CLI)) {
      throw new Error(`CLI build not found at ${CLI}. Run "npm run build" first.`);
    }
  });

  it('non-existent file shows a friendly "not found" message and exits 1', () => {
    const result = runValidate('/tmp/cairel-nonexistent-file.md');

    expect(result.status).toBe(1);
    expect(result.combined).toMatch(/not found/i);
    expect(result.combined).toContain('/tmp/cairel-nonexistent-file.md');
  });

  it('non-existent directory shows a friendly "not found" message and exits 1', () => {
    const result = runValidate('/tmp/cairel-nonexistent-dir-xyz');

    expect(result.status).toBe(1);
    expect(result.combined).toMatch(/not found/i);
    expect(result.combined).toContain('/tmp/cairel-nonexistent-dir-xyz');
  });

  it('never exposes a raw stack trace or ENOENT/TypeError', () => {
    const result = runValidate('/tmp/cairel-nonexistent-file.md');

    expect(result.combined).not.toContain('ENOENT');
    expect(result.combined).not.toContain('TypeError');
    expect(result.combined).not.toMatch(/^\s*at .+:\d+:\d+/m);
    expect(result.combined).not.toContain('node:internal');
  });

  it('non-existent path with --directives flag also fails gracefully', () => {
    const result = runValidate('--directives', '/tmp/cairel-nonexistent-dir-xyz');

    expect(result.status).toBe(1);
    expect(result.combined).toMatch(/not found/i);
    expect(result.combined).not.toContain('ENOENT');
    expect(result.combined).not.toMatch(/^\s*at .+:\d+:\d+/m);
  });
});
