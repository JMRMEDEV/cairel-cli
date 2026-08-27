# TASK-020: Graceful error handling for non-existent paths in validate

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-020 |
| Priority | P0 |
| Scope | MVP |
| Type | bugfix |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-016 |
| Blocks | — |

## Description

`cairel validate /tmp/nonexistent.md` crashes with a raw Node.js `ENOENT` stack trace instead of showing a friendly error message. All file system operations in validate should be wrapped with proper error handling.

Found during E2E QA testing (cairel-qa repo, 2026-08-27).

## Implementation Guide

1. Wrap the `fs.statSync()` / `fs.readFileSync()` calls in `src/commands/validate.ts` with try/catch
2. On `ENOENT`: display `⚠ File not found: <path>` and exit with code 1
3. On `EACCES`: display `⚠ Permission denied: <path>` and exit with code 1
4. On other fs errors: display `⚠ Cannot read <path>: <error.message>` and exit with code 1
5. Never expose raw stack traces to users
6. Add tests: validate with nonexistent file, validate with nonexistent directory

## Acceptance Criteria

- [x] Non-existent file path shows friendly "File not found" message
- [x] Non-existent directory path shows friendly "Directory not found" message
- [x] No raw stack traces or TypeError exposed to user
- [x] Exit code is 1 on error
- [x] Tests cover non-existent file and directory paths
- [x] All tests pass

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. NEW `src/core/fs-error.ts` — pure, side-effect-free helper mapping Node.js fs
   errors to friendly single-line messages: `isFsError()` type guard and
   `formatFsError(err, path, expected)`. ENOENT → "File/Directory/Path not
   found: <path>" (phrased by the `expected` hint), EACCES/EPERM → "Permission
   denied: <path>", anything else → "Cannot read <path>: <message>". Never
   includes a stack trace.
2. `src/commands/validate.ts` — wrapped every unguarded `fs.statSync()` call in
   try/catch: the positional-path auto-detect branch, the positional-path
   `--directives` branch, the steering-validation block, and the rules-validation
   block. On error each prints `formatFsError(...)` (yellow) and exits code 1.
   The positional branches infer file-vs-directory from the path extension so
   ENOENT reads "File not found" for `foo.md` and "Directory not found" for a
   bare directory name. Spinners are stopped before printing.
3. NEW `tests/fs-error.test.ts` — 11 unit tests: ENOENT (file/directory/path),
   EACCES, EPERM, other codes, non-Error values, no-stack-trace guarantee,
   `isFsError` guard.
4. NEW `tests/validate-fs-errors.test.ts` — 4 E2E tests spawning the built
   `dist/index.js`: non-existent file, non-existent directory, no raw
   stack-trace/ENOENT/TypeError leak, and `--directives <nonexistent>`. All
   assert exit code 1 and a friendly "not found" message.

### Verification

- `npm run build` → passes (tsc clean).
- `npx jest tests/fs-error.test.ts tests/validate-fs-errors.test.ts` → 15/15 pass.
- `npm test` → 240/241 pass. The single failure
  (`tests/update.test.ts › should detect missing configuration`) is
  PRE-EXISTING and unrelated to validate — documented in TASK-018 and TASK-019
  with the identical assertion mismatch, and lives in the update command which
  this task did not touch.
- E2E vs built CLI: `validate /tmp/nonexistent.md` → "⚠ File not found:
  /tmp/nonexistent.md", exit 1; `validate /tmp/nonexistent-dir-xyz` →
  "⚠ Directory not found: /tmp/nonexistent-dir-xyz", exit 1. No stack trace.

### Deferred

- Pre-existing `update.test.ts` failure (separate task/domain).
- `readdirSync`/`readFileSync` inside validator methods run only after a
  successful `statSync` confirms the target exists, so they are not reachable
  ENOENT crash paths for the target itself and were left as-is.

## Comments

- **2026-08-27 10:34** — Created from E2E QA findings (Bug #4, MEDIUM severity). Raw ENOENT stack trace is unprofessional UX.
- **2026-08-27 11:13** — Started implementation. Read validate.ts; identified 4 unguarded `fs.statSync` crash sites (positional auto-detect, positional --directives, steering, rules).
- **2026-08-27 11:20** — Complete. Added pure `fs-error.ts` helper + guards in validate.ts; 15 new tests (11 unit + 4 E2E) pass; build clean; 240/241 suite pass (1 pre-existing unrelated update.test.ts failure). Files: src/core/fs-error.ts, src/commands/validate.ts, tests/fs-error.test.ts, tests/validate-fs-errors.test.ts.
