# TASK-010: Code quality and technical debt cleanup

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-010 |
| Priority | P1 |
| Scope | MVP |
| Type | infra |
| Domain | cli, validation, generation |
| Subprojects | cli, mcp |
| Stories | — |
| Depends on | — |
| Blocks | — |

## Description

Address technical debt and code quality issues identified during project review. Covers naming inconsistency (rules → skills migration leftovers), error handling, type safety, platform-specific agent generation, and test improvements.

## Implementation Guide

### 1. Code quality fixes (`src/`)

- Replace `require('os')` calls inside `generator.ts` with top-level `import { homedir } from 'os'`
- Replace repeated type assertions (`answers as QuickSetupAnswers`) with discriminated unions or type guards — add a `mode` field to answer types
- Remove `process.exit(0)` calls from `wizard.ts` — throw a `UserCancelledError` and handle in `init.ts`
- Add error logging to swallowed `catch {}` blocks (at least `console.warn` in debug mode)
- Export `clearCache()` from `rules-selector.ts` for test isolation

### 2. Naming consistency (rules → skills)

- Rename `--rules` flag in `list` command to `--skills` (keep `--rules` as hidden alias for backwards compat)
- Rename internal variables: `rulesToProcess` → `skillsToProcess`, `additionalRules` → `additionalSkills` in types
- Update user-facing text in `validate` and `update` commands to say "skills" consistently
- Update README skill count from 23 to 24

### 3. Platform-specific agent generation

- Don't emit `toolsSettings` (fs_read/fs_write/execute_bash) for non-Amazon Q platforms
- Create separate template sections or conditionals for Kiro vs Claude Code vs GitHub Copilot agent formats
- Kiro agents: emit only `name`, `description`, `prompt`, `mcpServers`, `resources`
- Claude Code / GitHub Copilot: skip agent file entirely (they don't use agent JSON)

### 4. Validate command refactor

- Remove duplicated auto-detection logic (two overlapping branches)
- Document `--skills` flag in README
- Add `--fix` stub warning that it's not implemented

### 5. MCP server improvements

- Add unit tests for `handleToolCall` in `mcp-server/`
- Align Zod version with root package or pin to avoid drift
- Add a `test` script to `mcp-server/package.json`

### 6. Test improvements

- Suppress `ExitPromptError` noise from `@inquirer/prompts` in test output
- Add integration tests for `validate` command's auto-detection logic
- Add tests for edge cases in `mcp-detector.ts`

## Acceptance Criteria

- [ ] No `require()` calls in TypeScript source files
- [ ] No `process.exit()` in library/core code (only in CLI entry point)
- [ ] User-facing text consistently says "skills" (not "rules")
- [ ] Agent generation produces platform-appropriate output (no `toolsSettings` for Kiro/Claude/Copilot)
- [ ] Validate command has no duplicated detection logic
- [ ] MCP server has at least 5 unit tests covering tool handlers
- [ ] Test suite runs without `ExitPromptError` noise in output
- [ ] README updated (skill count, document `--skills` flag)
- [ ] All existing tests still pass

## Comments

Identified during comprehensive project review (Aug 2026). None of these are breaking changes — all are internal improvements and consistency fixes.
