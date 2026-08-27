import * as path from 'path';

/**
 * Predicate used to test whether a candidate directory exists.
 * Injected so the resolution logic stays pure and testable.
 */
export type ExistsFn = (candidatePath: string) => boolean;

/**
 * A raw Commander flag value. For a boolean option with no value Commander
 * passes `true`; when a value is supplied it is a string. When the option is
 * absent it is `undefined`.
 */
export type FlagValue = boolean | string | undefined;

/**
 * Standard directories to scan for agent files when `--agents` is given with
 * no explicit path.
 */
export const STANDARD_AGENT_DIRS = [
  path.join('.kiro', 'agents'),
  path.join('.amazonq', 'cli-agents'),
];

/**
 * Standard directories to scan for directive/steering/rule files when
 * `--directives` (or its aliases) is given with no explicit path.
 */
export const STANDARD_DIRECTIVE_DIRS = [
  path.join('.kiro', 'steering'),
  path.join('.kiro', 'skills'),
  path.join('.claude', 'skills'),
  path.join('.github', 'skills'),
  path.join('.github', 'instructions'),
  path.join('.cursor', 'rules'),
  path.join('.amazonq', 'rules'),
];

/**
 * Returns true when the flag was supplied as a real (non-empty) string path,
 * as opposed to the boolean `true` Commander uses for a bare flag.
 */
export function isPathValue(value: FlagValue): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns true when the flag was supplied but as a bare boolean (no path).
 */
export function isBooleanFlag(value: FlagValue): boolean {
  return value === true;
}

/**
 * Given a flag value and a set of candidate standard directories, resolve the
 * list of absolute directories that actually exist and should be scanned.
 *
 * - If the value is a non-empty string, it is treated as an explicit path and
 *   returned resolved against `cwd` (existence is NOT filtered here; the caller
 *   validates and reports on it directly).
 * - If the value is the boolean `true`, every standard directory that exists is
 *   returned.
 * - Otherwise (undefined/false) an empty list is returned.
 */
export function resolveTargetDirs(
  value: FlagValue,
  standardDirs: string[],
  cwd: string,
  exists: ExistsFn
): string[] {
  if (isPathValue(value)) {
    return [path.resolve(cwd, value)];
  }

  if (isBooleanFlag(value)) {
    return standardDirs
      .map(dir => path.resolve(cwd, dir))
      .filter(dir => exists(dir));
  }

  return [];
}
