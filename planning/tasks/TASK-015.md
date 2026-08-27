# TASK-015: Add Cursor as supported platform

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-015 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-07 |
| Depends on | TASK-013 |
| Blocks | — |

## Description

Add Cursor as a supported platform. Cursor uses `.mdc` files with YAML frontmatter and supports four rule modes that map cleanly to cairel's three enforcement levels.

## Implementation Guide

1. Add `'cursor'` to the `Platform` type
2. Add Cursor to wizard platform choices
3. Implement `getPlatformPaths()` for cursor:
   - Rules: `.cursor/rules/`
   - Skills: `.cursor/skills/` (if supported by Cursor)
4. Implement Cursor-specific `.mdc` format generation:
   ```
   ---
   description: "..."
   alwaysApply: true
   ---
   # Directive content here
   ```
5. Map enforcement levels:
   - enforced → `alwaysApply: true`
   - contextual → `description` only (Cursor's "Apply Intelligently")
   - available → `description` + no globs, no alwaysApply (manual @ invocation)
6. Add integration test for Cursor output
7. Update README with Cursor examples

## Acceptance Criteria

- [x] `cursor` is a selectable platform in the wizard
- [x] Generated `.mdc` files have correct YAML frontmatter per enforcement level
- [x] Integration test validates Cursor output structure
- [x] README documents Cursor support and output format

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. **Added Cursor to wizard platform choices** — `src/core/wizard.ts` now includes `{ name: 'Cursor', value: 'cursor' }` in both Quick/Detailed setup and Custom mode platform selections.
2. **Fixed Cursor `.mdc` format generation** — `src/core/directive-generator.ts` updated:
   - Enforced: `description: "..." + alwaysApply: true` (previously was missing description)
   - Contextual: `description: "..."` only (Cursor's "Apply Intelligently" mode)
   - Available: `description: "..." + alwaysApply: false` (manual `@` invocation; previously routed to skills folder)
   - All three levels now output `.mdc` files to `.cursor/rules/` (no separate skills folder)
3. **Updated integration tests** — `tests/directive-generator.test.ts`: Cursor section now has 5 tests (up from 4) covering all enforcement levels and YAML frontmatter structure validation.
4. **Updated README** — Added Cursor to intro, features, platform choices example, generated output section with `.mdc` format documentation, and supported platforms list.

### Verification

- `npx tsc --noEmit` — passes clean (no errors)
- `npm run build` — succeeds
- `npx jest tests/directive-generator.test.ts` — 24 tests pass (including 5 Cursor-specific)
- `npx jest tests/integration.test.ts tests/skills-migration.test.ts tests/scenarios.test.ts` — 63 tests pass
- Pre-existing failures in `custom-mode.test.ts` and `detailed-setup.test.ts` (11 tests) are from TASK-014's enforcement-selector mocks, unrelated to this task

### Deferred

- None

## Comments

- **2026-08-27 09:58** — Started implementation. TASK-013 already had cursor type and generation logic, but missing wizard integration, incorrect `.mdc` format (enforced lacked description, available used wrong output path), and README documentation.
- **2026-08-27 10:05** — Complete. All acceptance criteria met. Files modified: `src/core/wizard.ts`, `src/core/directive-generator.ts`, `tests/directive-generator.test.ts`, `README.md`.
