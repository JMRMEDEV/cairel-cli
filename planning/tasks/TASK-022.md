# TASK-022: Auto-detect platform directories in validate (no-arg mode)

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-022 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-018, TASK-019, TASK-020, TASK-021 |
| Blocks | — |

## Description

When `cairel validate` is run without arguments, it should auto-detect all known platform directories in the current project and validate everything it finds. Currently it only looks in a limited set of paths. After the other validate fixes, this task ties them together into a cohesive "validate everything" experience.

Found during E2E QA testing (cairel-qa repo, 2026-08-27).

## Implementation Guide

1. When `cairel validate` is run with no arguments and no flags:
   - Scan for all known platform directories:
     - `.kiro/steering/` (Kiro enforced/contextual)
     - `.kiro/skills/` (Kiro available)
     - `.kiro/agents/` (Kiro agents)
     - `.cursor/rules/` (Cursor .mdc files)
     - `CLAUDE.md` (Claude Code)
     - `.github/copilot-instructions.md` (Copilot enforced)
     - `.github/instructions/` (Copilot contextual)
     - `.github/skills/` (Copilot available)
     - `.amazonq/rules/` (Amazon Q directives)
     - `.amazonq/cli-agents/` (Amazon Q agents)
2. For each found directory/file, apply the correct schema (per TASK-018, TASK-021)
3. Report results grouped by platform:
   ```
   Kiro:
     ✓ .kiro/steering/ — 9 enforced directives valid
     ✓ .kiro/skills/ — 2 available directives valid
     ✓ .kiro/agents/ — 1 agent valid
   Cursor:
     ✓ .cursor/rules/ — 14 directives valid
   ```
4. Summary line: "Validated X directives and Y agents across Z platforms"
5. Add integration test using generated QA output

## Acceptance Criteria

- [x] `cairel validate` (no args) scans all known platform directories
- [x] Results grouped by platform in output
- [x] Summary line shows total count
- [x] Platforms with no files are silently skipped (not reported)
- [x] Tests cover multi-platform auto-detection
- [x] All tests pass

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Added `src/core/platform-scan.ts` — a cohesive "validate everything" scanner:
   - `scanPlatforms(cwd)` reuses `validateEnforcement()` for directives across all
     platforms (Kiro steering/skills, Cursor `.mdc`, Claude Code `CLAUDE.md`,
     Copilot instructions/instructions dir/skills, Amazon Q rules) and adds agent
     scanning for `.kiro/agents/` and `.amazonq/cli-agents/` via
     `Validator.validateAgentsDirectory` (correct schema per directory).
   - Groups directives + agents by platform in deterministic order
     (Kiro → Cursor → Claude Code → GitHub Copilot → Amazon Q); platforms with no
     files are omitted (silently skipped).
   - Returns totals (`totalDirectives`, `totalAgents`, `platformCount`, `hasErrors`).
   - `summaryLine()` builds "Validated X directives and Y agents across Z platforms"
     with correct singular/plural handling.
   - `PLATFORM_LABELS` provides display names.
2. Rewrote the no-arg/no-flag branch in `src/commands/validate.ts`: when run with no
   positional path and no mode/enforcement flags, it calls `scanPlatforms`, prints a
   grouped-by-platform report (with enforcement level and agent annotations), prints
   the summary line, and exits 1 on errors / 0 on success. Prints the standard
   "No configuration found" message + exit 1 when nothing is detected.
3. Removed the now-dead legacy `else if (!targetPath)` auto-detect block (superseded
   by the unified scan) and scoped the trailing enforcement block to the explicit
   `-e/--enforcement` flag only (was `options.enforcement || !targetPath`).
4. Added `tests/platform-scan.test.ts` (8 tests) — an integration suite that generates
   real QA output via `generateFiles()` (multi-platform Kiro+Cursor+Amazon Q, and a
   single-platform Kiro-only project) and asserts detection, grouping, agent
   validation, the summary line, silent skipping of empty platforms, and the empty
   project case.

### Verification

- `npm run build` → tsc clean (exit 0).
- `npx jest tests/platform-scan.test.ts` → 8/8 pass.
- `npm test` → 255/256 pass. The sole failure is the pre-existing, unrelated
  `tests/update.test.ts › should detect missing configuration` (documented in
  TASK-018/019/020/021, in the untouched update command — out of scope).
- Manual E2E:
  - No-arg validate in cairel-cli repo → detects Kiro (5 directives incl. the real
    frontmatter-less `git.md` failure + 2 agents), summary line, exit 1.
  - No-arg validate in a generated 3-platform project → "Validated 42 directives and
    2 agents across 3 platforms", grouped by Kiro/Cursor/Amazon Q, exit 0.
  - No-arg validate in an empty dir → "No configuration found", exit 1.

### Deferred

- Pre-existing `tests/update.test.ts` failure (out of scope; untouched update command).

## Comments

- **2026-08-27 10:34** — Created from E2E QA recommendations. This is the "tie it together" task after individual validate fixes land.
- **2026-08-27 11:20** — Started implementation. Reviewed existing validate command, enforcement-validator, and validator; confirmed enforcement-validator already scans all directive platforms grouped by platform.
- **2026-08-27 11:35** — Complete. Added `src/core/platform-scan.ts` (scan + summary), rewrote no-arg branch in `src/commands/validate.ts`, removed dead legacy auto-detect block, added `tests/platform-scan.test.ts` (8 tests). Build clean, 255/256 tests pass (1 pre-existing unrelated failure), E2E verified across 1-platform and 3-platform generated projects.
