# TASK-013: Enforcement-aware file generator

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-013 |
| Priority | P0 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-04, DIR-05, DIR-06 |
| Depends on | TASK-011, TASK-012 |
| Blocks | TASK-014, TASK-015 |

## Description

Refactor the generator to route directives to the correct platform-specific location based on their enforcement level. Replace the current single-path output with enforcement-aware routing.

## Implementation Guide

1. Replace `copySkillFolders()` / `copyRulesFlat()` with `generateDirectives(directives, platform, targetDir)`
2. For each directive, check its enforcement level and route:
   - **Kiro enforced**: write to `.kiro/steering/{name}.md` with `inclusion: always` frontmatter
   - **Kiro contextual**: write to `.kiro/steering/{name}.md` with `inclusion: auto`, `name`, `description`
   - **Kiro available**: write to `.kiro/skills/{name}/SKILL.md`
   - **Cursor enforced**: write `.cursor/rules/{name}-directive.mdc` with `alwaysApply: true`
   - **Cursor contextual**: write `.cursor/rules/{name}-directive.mdc` with `description`
   - **Claude Code enforced/contextual**: append section to `CLAUDE.md`
   - **GitHub Copilot enforced**: append to `.github/copilot-instructions.md`
   - **GitHub Copilot contextual**: write `.github/instructions/{name}.instructions.md`
   - **Amazon Q**: all go to `.amazonq/rules/{name}.md` (always-loaded)
3. Use `ENFORCED.md` content for `enforced` level, `DIRECTIVE.md` for `contextual`/`available`
4. Produce warnings when platform doesn't support the chosen enforcement level
5. Add integration tests for each platform × enforcement level combination

## Acceptance Criteria

- [x] Kiro output uses steering for enforced, steering (auto) for contextual, skills for available
- [x] Cursor output uses `.mdc` format with correct frontmatter per level
- [x] Claude Code appends to single `CLAUDE.md` file
- [x] GitHub Copilot uses `copilot-instructions.md` + `*.instructions.md` split
- [x] Amazon Q output unchanged (all always-loaded)
- [x] Warnings emitted for unsupported enforcement levels
- [x] Integration tests cover all 5 platforms × 3 enforcement levels

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Created `src/core/directive-generator.ts` — new enforcement-aware module with `generateDirectives()` function that routes directives to correct platform-specific locations based on enforcement level
2. Updated `src/types/wizard.ts` — added `'cursor'` to `Platform` type union
3. Updated `src/core/directives-selector.ts` — exported `DirectiveDefinition`, `DirectivesManifest` interfaces; added `loadManifestPublic()` function
4. Refactored `src/core/generator.ts` — replaced `copySkillFolders()`/`copyRulesFlat()` with new `generateDirectives()` call; updated `getPlatformPaths`, `getSkillsDir`, `getResourcesPath` to include cursor platform
5. Created `tests/directive-generator.test.ts` — 23 integration tests covering all 5 platforms × 3 enforcement levels, cross-platform warnings, and combined output scenarios
6. Updated `tests/integration.test.ts` and `tests/skills-migration.test.ts` — adapted existing tests to reflect new enforcement-aware routing behavior

### Verification

- `npx tsc --noEmit` — passes clean (no type errors)
- `npm run build` — succeeds
- `npm test` — 13 suites, 114 tests pass (23 new + 91 existing)
- Platform routing verified: Kiro (steering + skills), Cursor (.mdc files), Claude Code (CLAUDE.md), GitHub Copilot (copilot-instructions.md + instructions/), Amazon Q (flat .md)
- Warnings correctly emitted for: Claude Code contextual→enforced fallback, Claude Code available→skipped, Amazon Q available→skipped

### Deferred

- Cursor `available` level uses skills/ folder (same as Kiro) — may need refinement for Cursor-specific skill invocation mechanism in a future task
- `applyTo` in GitHub Copilot contextual defaults to `"**/*"` — could be refined per-directive in TASK-014 or later

## Comments

- **2026-08-27 09:52** — Started implementation. Created directive-generator module, refactored generator.ts, added cursor platform support.
- **2026-08-27 10:15** — Complete. All acceptance criteria met. 13 test suites, 114 tests pass. TypeScript compiles clean. Files: src/core/directive-generator.ts, src/core/generator.ts, src/core/directives-selector.ts, src/types/wizard.ts, tests/directive-generator.test.ts, tests/integration.test.ts, tests/skills-migration.test.ts.
