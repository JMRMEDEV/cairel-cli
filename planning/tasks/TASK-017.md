# TASK-017: Update command with enforcement-level awareness

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-017 |
| Priority | P2 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-10 |
| Depends on | TASK-013 |
| Blocks | — |

## Description

Extend `cairel update` to detect existing directives at their current enforcement level and allow users to change enforcement during updates (moving content between platform layers).

## Implementation Guide

1. Scan all platform layers to detect deployed directives and their current enforcement
2. Compare against manifest to identify:
   - Directives with updated content (same level, new content)
   - Directives with changed default enforcement (manifest default differs from deployed)
   - New directives not yet deployed
3. Present update summary showing current vs. recommended enforcement
4. Allow user to change enforcement level during update:
   - Move file from old location to new location
   - Remove old file after successful write
5. Backup before any moves
6. Report: "Updated 3 directives, moved 1 (git-management: contextual → enforced)"

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Created `src/core/enforcement-updater.ts` (315 lines) — core module with:
   - `scanDeployedDirectives()` — scans all 5 platforms (Kiro, Cursor, Claude Code, GitHub Copilot, Amazon Q) detecting directive IDs, enforcement levels, and file paths
   - `buildUpdatePlan()` — compares deployed vs. manifest to identify content updates, enforcement changes, and new directives
   - `moveDirective()` — moves directive from old enforcement location to new, with backup and cleanup of empty dirs
   - `updateDirectiveInPlace()` — updates content at same path with backup
   - `getTargetPath()` — resolves correct platform path for a directive at a given enforcement level

2. Rewrote `src/commands/update.ts` (388 lines) — enforcement-aware update command with:
   - Multi-platform detection (scans all deployed platforms)
   - Update summary showing current vs. recommended enforcement per directive
   - Three update modes: auto (recommended levels), customize (per-directive selection), content-only (preserve current levels)
   - File moves between enforcement locations with backup
   - Detailed report: "Updated N directives, moved M (directive-id: old → new)"
   - Backup created at `.cairel-backup/<timestamp>/` before any destructive operations

3. Created `tests/enforcement-updater.test.ts` (814 lines, 41 tests) covering:
   - Scanning deployed directives across all 5 platforms
   - Building update plans (content changes, enforcement changes, new directives)
   - Target path resolution per platform/enforcement
   - Moving directives between enforcement levels (with backup verification)
   - In-place updates with backup
   - Cross-platform simultaneous detection
   - Full enforcement level change scenarios (contextual→enforced, enforced→available, available→contextual)

### Verification

- All 203 tests pass across 16 test suites (41 new + 162 existing, no regressions)
- TypeScript compiles clean (`npx tsc --noEmit` and `npm run build` both pass)

### Deferred

- Claude Code and GitHub Copilot `copilot-instructions.md` store multiple directives in a single file; enforcement moves for these platforms regenerate rather than surgically edit sections

## Acceptance Criteria

- [x] Detects directives across all platform layers
- [x] Shows current enforcement vs. manifest default
- [x] Allows changing enforcement level during update
- [x] Moves files between locations cleanly
- [x] Backup created before destructive operations
- [x] Tests cover enforcement level change scenarios

## Comments

- **2026-08-27 10:07** — Started implementation. Reviewing existing update command, enforcement-validator, directive-generator, and enforcement-selector.
- **2026-08-27 10:45** — Complete. Created enforcement-updater.ts core module, rewrote update.ts command with multi-platform enforcement awareness, added 41 comprehensive tests. All 203 tests pass, TypeScript compiles clean.
