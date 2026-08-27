# DIR-10: Update command respects enforcement levels

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-10 |
| Priority | P2 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer, I want `cairel update` to detect existing directives at their current enforcement level and offer to update content or change enforcement without losing custom modifications.

## Acceptance Criteria

1. Detect directives across all platform layers (steering, rules, skills, CLAUDE.md sections)
2. Show current enforcement level vs. manifest default for each directive
3. Allow changing enforcement level during update (moves file to correct location)
4. Backup before moving files between layers
5. Preserve user customizations in directives that have been locally modified
6. Report what changed: "Moved git-management from contextual → enforced"

## Related

- ADR-008: Hybrid Directives Model
- CMD-02: cairel update
