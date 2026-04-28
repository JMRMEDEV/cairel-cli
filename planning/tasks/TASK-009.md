# TASK-009: Add constraint validation to cairel validate

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-009 |
| Priority | P2 |
| Scope | MVP |
| Type | feature |
| Domain | validation |
| Subprojects | cli |
| Stories | CON-08 |
| Depends on | TASK-005, TASK-006, TASK-007 |
| Blocks | — |

## Description

Extend `cairel validate` to detect and validate constraint files across all supported platforms. Warn if constraint files exceed 20 lines. Validate platform-specific frontmatter.

## Implementation Guide

1. In `validate.ts`, add detection for constraint locations:
   - `.kiro/steering/*.md` — check `inclusion` frontmatter
   - `CLAUDE.md` — check for cairel constraints section marker
   - `.github/copilot-instructions.md` — check for cairel constraints section marker
   - `.cursor/rules/*-constraints.mdc` — check `alwaysApply: true`
   - `.amazonq/rules/*-constraints.md` — check line count
2. Add `validateConstraint()` to `validator.ts`:
   - Line count ≤ 20 (warning if exceeded)
   - Platform-specific frontmatter validation
3. Report constraints separately from skills in output
4. Add tests

## Acceptance Criteria

- [ ] Constraint files detected across all platforms
- [ ] Line count warning for files > 20 lines
- [ ] Platform-specific frontmatter validated
- [ ] Separate reporting section in output
- [ ] Tests pass

## Comments
