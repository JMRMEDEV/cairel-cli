# TASK-011: Rename skills to directives across codebase

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-011 |
| Priority | P0 |
| Scope | MVP |
| Type | refactor |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-01 |
| Depends on | — |
| Blocks | TASK-012, TASK-013, TASK-014, TASK-015 |

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Renamed `curated-presets/skills/` → `curated-presets/directives/`
2. Renamed `curated-presets/rules-manifest.json` → `curated-presets/directives-manifest.json`
3. Updated manifest schema: `{ "rules": [...] }` → `{ "directives": [...] }`
4. Renamed `src/core/rules-selector.ts` → `src/core/directives-selector.ts` with updated interfaces (`DirectiveDefinition`, `DirectivesManifest`, `selectDirectives`, `getDirectiveCategory`)
5. Updated all imports and references in: `src/core/generator.ts`, `src/core/wizard.ts`, `src/commands/list.ts`, `src/commands/update.ts`, `src/commands/validate.ts`, `src/index.ts`
6. Updated `scripts/generate-manifest.js` to scan `directives/` and output `directives-manifest.json`
7. Updated all user-facing text: "skill" → "directive" and "rule" → "directive" in CLI output
8. Updated all test files (`rules-selector.test.ts`, `scenarios.test.ts`, `go-support.test.ts`, `skills-migration.test.ts`, `update.test.ts`) to use new imports and terminology
9. Updated `README.md` with "directives" terminology throughout
10. `package.json` `files` field already includes `"curated-presets"` which covers the renamed directory

### Verification

- `npx tsc --noEmit` — passes clean (no errors)
- `npm test` — 12 test suites, 91 tests pass
- `npm run build` — succeeds (generates manifest + compiles)
- `cairel list` output shows "📋 Available Directives" header
- No remaining references to `rules-manifest` or `curated-presets/skills` in `src/` or `tests/`
- `--directives` flag added to validate command (with `--skills` and `--rules` as backward-compat aliases)

### Deferred

- Internal variable names like `rulesPath`, `existingRuleIds` in `update.ts` were left as-is since they reference the output directory structure (`.kiro/skills/`, `.amazonq/rules/`) which didn't change. These are implementation details not visible to users.

## Description

Rename the "skills" concept to "directives" throughout the codebase. This is a mechanical rename that doesn't change behavior — it establishes the platform-agnostic terminology before adding enforcement logic.

## Implementation Guide

1. Rename `curated-presets/skills/` → `curated-presets/directives/`
2. Rename `curated-presets/rules-manifest.json` → `curated-presets/directives-manifest.json`
3. Update manifest schema: `{ "rules": [...] }` → `{ "directives": [...] }`
4. Rename `src/core/rules-selector.ts` → `src/core/directives-selector.ts`
5. Update all imports and references in:
   - `src/core/generator.ts`
   - `src/core/wizard.ts`
   - `src/commands/list.ts`
   - `src/commands/update.ts`
   - `src/commands/validate.ts`
   - `src/index.ts`
6. Update `scripts/generate-manifest.js` to output new filename
7. Update user-facing text: "skill" → "directive" in CLI output
8. Update all test files
9. Update README.md

## Acceptance Criteria

- [x] No file or variable references "rules-manifest" or "curated-presets/skills"
- [x] CLI output says "directives" (not "skills" or "rules")
- [x] `cairel list` shows "Available Directives"
- [x] All 91 tests pass (updated references)
- [x] TypeScript compiles clean
- [x] npm package still includes curated content (`files` in package.json updated)

## Comments

- **2026-08-27 09:38** — Started implementation. Mechanical rename of files, directories, imports, interfaces, and user-facing text.
- **2026-08-27 09:45** — Complete. All acceptance criteria met. 12 test suites / 91 tests pass. TypeScript compiles clean. CLI output confirmed showing "Available Directives".
