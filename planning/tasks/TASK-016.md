# TASK-016: Validate directives per enforcement level and platform

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-016 |
| Priority | P2 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-013 |
| Blocks | — |

## Description

Extend `cairel validate` to check that generated directives have correct platform-specific frontmatter matching their enforcement level. Warn about size limits and unsupported enforcement levels.

## Implementation Guide

1. Detect directives across all platform layers:
   - `.kiro/steering/` → check `inclusion` frontmatter
   - `.kiro/skills/` → verify SKILL.md structure
   - `.cursor/rules/` → check `alwaysApply`/`description` in `.mdc`
   - `CLAUDE.md` → check for cairel directive section markers
   - `.github/copilot-instructions.md` + `.github/instructions/`
   - `.amazonq/rules/`
2. Validate frontmatter fields match expected enforcement:
   - Kiro `always` → enforced, `auto` → contextual, skills → available
   - Cursor `alwaysApply: true` → enforced, `description` only → contextual
3. Size warnings:
   - Enforced directives > 30 lines → warning
   - `CLAUDE.md` total > 150 lines → warning (performance degradation)
4. Report directives by enforcement level in validation output

## Acceptance Criteria

- [x] Detects directives across all 5 platforms
- [x] Validates frontmatter consistency per enforcement level
- [x] Warns on oversized enforced directives
- [x] Tests cover validation of correct and incorrect frontmatter

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Created `src/core/enforcement-validator.ts` — new module with `validateEnforcement()` function that detects and validates directives across all 5 platforms:
   - **Kiro**: `.kiro/steering/` (inclusion: always → enforced, inclusion: auto → contextual), `.kiro/skills/` (available)
   - **Cursor**: `.cursor/rules/*.mdc` (alwaysApply: true → enforced, omitted → contextual, false → available)
   - **Claude Code**: `CLAUDE.md` (## sections → enforced)
   - **GitHub Copilot**: `.github/copilot-instructions.md` (enforced), `.github/instructions/` (contextual), `.github/skills/` (available)
   - **Amazon Q**: `.amazonq/rules/` (all enforced)
2. Extended `src/commands/validate.ts` — added `--enforcement` flag and automatic enforcement validation when no path specified. Reports directives grouped by platform and enforcement level.
3. Frontmatter consistency validation:
   - Kiro: validates inclusion field values, requires name/description for contextual
   - Cursor: validates description required, alwaysApply mapping
   - GitHub Copilot: validates applyTo for contextual instructions
   - Claude Code: validates ## section markers exist
   - Amazon Q: validates non-empty content
4. Size warnings: enforced directives > 30 lines, CLAUDE.md > 150 lines total
5. Created `tests/enforcement-validator.test.ts` — 28 tests covering correct and incorrect frontmatter for all platforms

### Verification

- `npx tsc --noEmit` — compiles clean
- `npm run build` — full build passes
- `npx jest tests/enforcement-validator.test.ts` — 28/28 tests pass
- `npx jest` — all 162 tests pass across 15 suites (no regressions)

### Deferred

- None

## Comments

- **2026-08-27 10:03** — Started implementation. Created enforcement-validator module and integrated into validate command.
- **2026-08-27 10:20** — Complete. All acceptance criteria met. Files: src/core/enforcement-validator.ts, src/commands/validate.ts, tests/enforcement-validator.test.ts
