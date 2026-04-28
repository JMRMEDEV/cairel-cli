# TASK-007: Add Cursor as a supported platform

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-007 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | generation |
| Subprojects | cli |
| Stories | CON-05, CON-07 |
| Depends on | TASK-004 |
| Blocks | — |

## Description

Add Cursor as a new target platform. Generate `.cursor/rules/*.mdc` files with YAML frontmatter. Skills use `agentRequested` mode; constraints use `alwaysApply: true`.

## Implementation Guide

1. Add `'cursor'` to the `Platform` type
2. Update `getPlatformPaths()` to return `.cursor/rules/` for skills
3. Add `cursor` option to wizard platform selection
4. Implement `copyCursorRules()` function:
   - For each skill: generate `.cursor/rules/<name>.mdc` with frontmatter:
     ```yaml
     ---
     description: <skill description from frontmatter>
     alwaysApply: false
     ---
     ```
   - For each constraint: generate `.cursor/rules/<name>-constraints.mdc` with:
     ```yaml
     ---
     description: <constraint summary>
     alwaysApply: true
     ---
     ```
5. Update `generateFiles()` to call `copyCursorRules()` for cursor platform
6. No agent JSON for Cursor (Cursor doesn't use agent configs)
7. Add tests

## Acceptance Criteria

- [ ] `cursor` selectable in wizard
- [ ] `.cursor/rules/*.mdc` files generated with correct frontmatter
- [ ] Constraint rules have `alwaysApply: true`
- [ ] Skill rules have `alwaysApply: false` with description
- [ ] Multi-platform output includes Cursor
- [ ] Tests pass

## Comments
