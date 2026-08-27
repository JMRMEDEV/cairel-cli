/**
 * Pure helpers for turning Node.js filesystem errors into friendly, user-facing
 * messages. Kept free of console/process side effects so it can be unit tested.
 *
 * Used by `cairel validate` to avoid leaking raw ENOENT/EACCES stack traces to
 * users when a path does not exist or cannot be read.
 */

/** Minimal shape of a Node.js filesystem error. */
export interface FsLikeError {
  code?: string;
  message?: string;
}

/** Type guard: is this value an Error-like object with a `code`/`message`? */
export function isFsError(err: unknown): err is FsLikeError {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('code' in err || 'message' in err)
  );
}

/**
 * Map a filesystem error to a friendly, single-line message. Never includes a
 * stack trace.
 *
 * - ENOENT  → "⚠ File not found: <path>" (or "Directory not found" when the
 *              path was expected to be a directory)
 * - EACCES / EPERM → "⚠ Permission denied: <path>"
 * - anything else  → "⚠ Cannot read <path>: <message>"
 *
 * @param err       The caught error (typically a NodeJS.ErrnoException).
 * @param targetPath The path the operation was attempted on.
 * @param expected  Hint used to phrase ENOENT ("file" | "directory" | "path").
 */
export function formatFsError(
  err: unknown,
  targetPath: string,
  expected: 'file' | 'directory' | 'path' = 'path'
): string {
  const code = isFsError(err) ? err.code : undefined;
  const message = isFsError(err) && err.message ? err.message : String(err);

  switch (code) {
    case 'ENOENT': {
      const noun =
        expected === 'directory'
          ? 'Directory not found'
          : expected === 'file'
            ? 'File not found'
            : 'Path not found';
      return `⚠ ${noun}: ${targetPath}`;
    }
    case 'EACCES':
    case 'EPERM':
      return `⚠ Permission denied: ${targetPath}`;
    default:
      return `⚠ Cannot read ${targetPath}: ${message}`;
  }
}
