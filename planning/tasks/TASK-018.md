# TASK-018: Add Kiro steering schema to validator

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-018 |
| Priority | P0 |
| Scope | MVP |
| Type | bugfix |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-016 |
| Blocks | — |

## Description

`cairel validate` applies the wrong schema (`RuleMetaSchema`) to Kiro steering files in `.kiro/steering/`. These files use `inclusion: always|auto` frontmatter, not the legacy rules `meta.id`/`meta.title` format. This causes all generated Kiro directives to falsely fail validation.

Found during E2E QA testing (cairel-qa repo, 2026-08-27).

## Implementation Guide

1. Create a `KiroSteeringSchema` (Zod) that validates:
   - `inclusion: 'always' | 'auto'` (required)
   - `name: string` (optional)
   - `description: string` (optional)
2. In `src/commands/validate.ts`, detect `.kiro/steering/` path context
3. When validating files under `.kiro/steering/`, use `KiroSteeringSchema` instead of `RuleMetaSchema`
4. Keep existing schema for `.kiro/skills/` (SKILL.md format) and `.amazonq/rules/`
5. Add tests: valid steering file passes, invalid steering file fails with helpful message

## Acceptance Criteria

- [x] Files in `.kiro/steering/` validate against Kiro-specific schema
- [x] Valid steering files (with `inclusion: always`) pass validation
- [x] Invalid steering files get clear error messages
- [x] Legacy `.amazonq/rules/` files still validate with existing schema
- [x] Tests cover both valid and invalid steering files
- [x] All tests pass

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Fixed `KiroSteeringSchema` in `src/core/validator.ts` — the schema was already
   drafted but used Zod v3 enum options (`required_error`/`invalid_type_error`) that
   fail to compile under the installed Zod v4. Rewrote the `inclusion` enum to use
   the Zod v4 `error` callback, producing helpful messages for both missing and
   invalid values.
2. Wired steering validation into the `validate` command (`src/commands/validate.ts`).
   The command already detected `.kiro/steering/` and set `options.steering`, but had
   no handler to process it. Added an `if (options.steering)` block that resolves the
   path, validates a single file via `validateSteeringFile` or a directory via
   `validateSteeringDirectory`, and prints results under a "🧭 Kiro Steering
   Validation Results" heading with errors and warnings.
3. Left `.kiro/skills/` (SKILL.md) and `.amazonq/rules/` handling untouched — they
   continue to use `SkillFrontmatterSchema` and `RuleMetaSchema` respectively.
4. Added 5 test fixtures under `tests/fixtures/`:
   - `steering-valid-always.md`, `steering-valid-auto.md`
   - `steering-invalid-missing-inclusion.md`, `steering-invalid-inclusion.md`,
     `steering-invalid-auto-incomplete.md`
5. Added a "Kiro Steering Validation" describe block (6 tests) to
   `tests/validator.test.ts` covering valid always/auto files, missing inclusion,
   invalid inclusion value, incomplete auto, and confirmation the legacy
   RuleMetaSchema is not applied.

### Verification

- `npm run build` — passes (tsc clean; fixed a pre-existing Zod v4 compile error
  in the steering schema).
- `npm test` — 208/209 pass. The single failure is `tests/update.test.ts`
  ("should detect missing configuration"), which is **pre-existing and unrelated**
  to this task — confirmed by re-running the suite with these changes stashed
  (it fails identically).
- `npm test -- tests/validator.test.ts` — 16/16 pass, including all 6 new steering tests.
- E2E via CLI: `node dist/index.js validate <dir>/.kiro/steering` correctly routes
  to the steering validator, valid files pass ("✓ All validations passed"), and
  files without `inclusion` frontmatter report the helpful error.

### Deferred

- Single-file validation of steering files outside a `.kiro/steering/` path (e.g.
  passing a bare fixture path) still routes to the legacy rules schema, because
  detection is path-based. Real generated steering files always live under
  `.kiro/steering/`, so the reported bug is fully resolved; broadening single-file
  detection (e.g. by frontmatter sniffing) is out of scope for this task.
- The pre-existing `tests/update.test.ts` failure should be addressed under a
  separate task.

## Comments

- **2026-08-27 10:34** — Created from E2E QA findings (Bug #1, HIGH severity). All 14 generated Kiro steering files currently fail validation due to wrong schema.
- **2026-08-27 11:05** — Started implementation. Found core validator already had steering methods but (a) the schema had a Zod v4 compile error and (b) the validate command never processed `options.steering`.
- **2026-08-27 11:12** — Complete. Fixed schema for Zod v4, wired steering handler into validate command, added 5 fixtures + 6 tests. Build clean; 16/16 validator tests pass; E2E confirmed. Files: src/core/validator.ts, src/commands/validate.ts, tests/validator.test.ts, tests/fixtures/steering-*.md.
