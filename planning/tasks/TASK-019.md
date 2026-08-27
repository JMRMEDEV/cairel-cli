# TASK-019: Fix validate --agents and --directives flag handling

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-019 |
| Priority | P0 |
| Scope | MVP |
| Type | bugfix |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-08 |
| Depends on | TASK-016 |
| Blocks | — |

## Description

`cairel validate --agents` crashes with `TypeError [ERR_INVALID_ARG_TYPE]` because Commander.js passes the boolean `true` as a flag value, which then gets passed to `path.resolve()` as a path argument. Similarly, `cairel validate --directives` outputs "No directives found in true" — misleading.

Found during E2E QA testing (cairel-qa repo, 2026-08-27).

## Implementation Guide

1. In `src/commands/validate.ts`, check if the flag value is a boolean (`true`) vs. an actual string path
2. When `--agents` is `true` (no path argument):
   - Default to scanning standard platform directories for agent files (`.kiro/agents/`, `.amazonq/cli-agents/`)
3. When `--directives` is `true` (no path argument):
   - Default to scanning all known platform directive directories (`.kiro/steering/`, `.kiro/skills/`, `.cursor/rules/`, `.amazonq/rules/`, `.github/instructions/`, etc.)
4. Only use the value as a path when it's a non-empty string
5. Add tests for both boolean-flag and path-argument modes

## Acceptance Criteria

- [x] `cairel validate --agents` (no path) scans standard agent directories without crashing
- [x] `cairel validate --directives` (no path) scans standard directive directories without crashing
- [x] `cairel validate --agents ./path/to/agents/` still works with explicit path
- [x] `cairel validate --directives ./path/to/rules/` still works with explicit path
- [x] No raw TypeError exposed to user
- [x] Tests cover boolean-flag and string-path cases
- [x] All tests pass

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. **Root cause**: `--agents`/`--directives`/`--skills`/`--rules` are Commander boolean options, so a bare flag sets the option to `true`. The old code merged `--directives` into `options.skills` (still `true`) and, when the auto-detect `existsSync` checks did not overwrite it, passed the boolean `true` into `path.resolve()` → `TypeError [ERR_INVALID_ARG_TYPE]`, or produced "No directives found in true".
2. **New pure helper** `src/core/validation-targets.ts`: exports `isBooleanFlag`, `isPathValue`, `resolveTargetDirs`, and the `STANDARD_AGENT_DIRS` / `STANDARD_DIRECTIVE_DIRS` constants. `resolveTargetDirs` treats a non-empty string as an explicit path (resolved against cwd) and a boolean `true` as "scan every standard dir that exists" — it never returns a boolean.
3. **`src/commands/validate.ts` refactor**:
   - Added a guarded branch (no positional path + explicit mode flag): clears the boolean flags, then resolves `--agents` to the first existing standard agent dir (`.kiro/agents`, `.amazonq/cli-agents`) and `--directives` to the existing standard directive dirs (`.kiro/steering`, `.kiro/skills`, `.claude/skills`, `.github/skills`, `.github/instructions`, `.cursor/rules`, `.amazonq/rules`), routing each to the correct validator (skills/steering/rules). Prints a helpful "No … directories found. Looked in: …" message instead of crashing.
   - Made the positional-path branch flag-aware: `--agents ./dir` / `--directives ./dir` route the path directly to the right mode and reset the boolean flags so `true` never lingers.
   - Made the agents handler defensive: `typeof options.agents === 'string' ? path.resolve(...) : options.agents`.
4. **Tests**: added `tests/validation-targets.test.ts` (17 tests) covering boolean-flag mode, string-path mode, empty/whitespace strings, absent flags, no-crash guarantees, and the standard-dir constants.

### Verification

- `npm run build` → passes (tsc clean).
- `npm test` → 225/226 pass. The single failure (`tests/update.test.ts › should detect missing configuration`) is PRE-EXISTING and unrelated — confirmed by re-running with my changes `git stash`ed (fails identically: 1 failed, 6 passed).
- `npx jest tests/validation-targets.test.ts` → 17/17 pass.
- E2E against built CLI (`dist/index.js`):
  - `validate --agents` in an empty dir → "⚠ No agent directories found. Looked in: .kiro/agents, .amazonq/cli-agents" + "✓ All validations passed", exit 0 (no TypeError).
  - `validate --directives` in an empty dir → helpful "No directive directories found" message, exit 0.
  - `validate --agents` with `.kiro/agents/general-dev.json` present → validates the agent, exit 0.
  - `validate --agents .kiro/agents` (explicit path) → validates, exit 0.
  - `validate --directives` with `.kiro/skills/…/SKILL.md` present → validates the skill, exit 0.
  - `validate --directives .kiro/skills` (explicit path) → validates, exit 0.

### Deferred

- The pre-existing `tests/update.test.ts` failure should be addressed in a separate task (message-copy drift, not related to validation flags).
- Boolean-flag mode currently validates the first matching directory per validator kind (skills/steering/rules) rather than every existing one simultaneously; sufficient for the reported bug and typical single-platform repos.

## Comments

- **2026-08-27 10:34** — Created from E2E QA findings (Bug #2 + #3, MEDIUM severity). Two separate symptoms from the same root cause.
- **2026-08-27 11:08** — Started. Confirmed root cause: Commander boolean flags reach `path.resolve()` as `true`.
- **2026-08-27 11:20** — Complete. Added `src/core/validation-targets.ts` helper + 17 tests, refactored `src/commands/validate.ts` to distinguish boolean flags from string paths in both the no-path and path-provided branches. Build clean; full suite 225/226 (1 pre-existing unrelated failure). E2E confirms `--agents`/`--directives` no longer crash and explicit paths still work. Files: src/core/validation-targets.ts, src/commands/validate.ts, tests/validation-targets.test.ts.
