# TASK-021: Support .mdc files in validator for Cursor platform

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-021 |
| Priority | P1 |
| Scope | MVP |
| Type | bugfix |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-018 |
| Blocks | — |

## Description

`cairel validate .cursor/rules/` reports "No directive files found" despite 14 `.mdc` files existing. The validator only scans for `*.md` files, missing Cursor's `.mdc` extension entirely.

Found during E2E QA testing (cairel-qa repo, 2026-08-27).

## Implementation Guide

1. In `src/commands/validate.ts`, update file scanning to include `*.mdc` alongside `*.md`
2. Create a `CursorDirectiveSchema` (Zod) that validates `.mdc` frontmatter:
   - `description: string` (required)
   - `alwaysApply: boolean` (optional, maps to enforcement level)
   - `globs: string | string[]` (optional)
3. When validating `.mdc` files, use `CursorDirectiveSchema`
4. Validate enforcement mapping:
   - `alwaysApply: true` → enforced
   - `description` present, no `alwaysApply` → contextual
   - `alwaysApply: false` → available
5. Add tests: valid .mdc passes, invalid .mdc (missing description) fails

## Acceptance Criteria

- [x] `.mdc` files are detected when scanning directories
- [x] Cursor-specific schema validates YAML frontmatter correctly
- [x] Valid .mdc files pass validation
- [x] Invalid .mdc files get clear error messages
- [x] Tests cover valid and invalid .mdc scenarios
- [x] All tests pass

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. **`src/core/validator.ts`**
   - Added `CursorDirectiveSchema` (Zod): `description` (required string), `alwaysApply` (optional boolean), `globs` (optional `string | string[]`).
   - Added `cursorEnforcementLevel()` helper + `CursorEnforcement` type mapping frontmatter to enforcement: `alwaysApply:true → enforced`, `alwaysApply:false → available`, absent → `contextual`.
   - Added `validateCursorDirective(filePath)` — parses frontmatter, validates against `CursorDirectiveSchema`, reports clear errors (missing frontmatter / missing description), and sets `result.enforcement`.
   - Extended `ValidationResult` with an optional `enforcement` field.
   - Added `findDirectiveFiles()` helper that recursively scans both `.md` and `.mdc` (excludes README.md).
   - `validateRulesDirectory()` now uses `findDirectiveFiles()` and dispatches `.mdc` files to `validateCursorDirective()` while `.md` continues through `validateRule()`.

2. **`src/commands/validate.ts`**
   - Auto-detect single-file branch now accepts `.mdc` (routed to rules; steering routing kept `.md`-only).
   - Rules block routes single `.mdc` files to `validator.validateCursorDirective()`.

3. **Tests** (`tests/validator.test.ts`) — new "Cursor .mdc Directive Validation" suite (7 tests): enforced/available/contextual mapping, string & array globs, missing-description failure, missing-frontmatter failure, and directory scan detecting `.mdc` files. Added fixtures under `tests/fixtures/` (cursor-valid-enforced/available/contextual, cursor-invalid-missing-description/no-frontmatter) and `tests/fixtures/cursor-rules-dir/` with two valid `.mdc` files.

### Verification

- `npm run build` → tsc clean (exit 0).
- `npx jest tests/validator.test.ts` → 23/23 pass (incl. 7 new Cursor tests).
- `npm test` → 247/248 pass. The single failure (`tests/update.test.ts › should detect missing configuration`) is PRE-EXISTING and unrelated — same failure documented in TASK-018/019/020, in the update command untouched by this task.
- Manual E2E: `node dist/index.js validate tests/fixtures/cursor-rules-dir` → detects 2 `.mdc` files, both pass, exit 0 (previously would report "No directive files found").

### Deferred

- Pre-existing `update.test.ts` failure (out of scope, update command untouched).

## Comments

- **2026-08-27 10:34** — Created from E2E QA findings (Bug #5, LOW severity). Cursor support was added in TASK-015 for generation but not for validation.
- **2026-08-27 11:17** — Started implementation. Reviewed validate.ts + validator.ts and the existing Cursor `.mdc` frontmatter format (buildCursorFrontmatter, validateCursorRule).
- **2026-08-27 11:22** — Complete. Added CursorDirectiveSchema + validateCursorDirective, `.md`/`.mdc` scanning via findDirectiveFiles, command routing, and 7 tests. Build clean; validator suite 23/23; full suite 247/248 (1 pre-existing unrelated failure).
