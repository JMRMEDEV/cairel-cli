# TASK-008: Add constraint generation for Amazon Q

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-008 |
| Priority | P2 |
| Scope | MVP |
| Type | feature |
| Domain | generation |
| Subprojects | cli |
| Stories | CON-06 |
| Depends on | TASK-004 |
| Blocks | — |

## Description

Extend the Amazon Q flat-file generator to output separate constraint files alongside skill files. Both go to `.amazonq/rules/` since Amazon Q has no activation modes.

## Implementation Guide

1. In `copyRulesFlat()`, after writing `<name>.md`, check for `CONSTRAINTS.md`
2. If exists, write `<name>-constraints.md` to the same `.amazonq/rules/` directory
3. Constraint files are terse (≤ 20 lines), skill files remain full content
4. Add tests

## Acceptance Criteria

- [ ] `.amazonq/rules/<name>-constraints.md` generated for qualifying skills
- [ ] `.amazonq/rules/<name>.md` still generated as before
- [ ] Tests pass

## Comments
