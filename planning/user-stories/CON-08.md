# CON-08: Validate constraint files

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-08 |
| Priority | P2 |
| Scope | MVP |
| Domain | validation |
| Subprojects | cli |

## Story

As a developer, I want `cairel validate` to check constraint files alongside skills so that I can verify both layers of my AI configuration are well-formed.

## Acceptance Criteria

1. `cairel validate` detects constraint files in platform-appropriate locations
2. Validates constraint files are ≤ 20 lines (warning if exceeded)
3. Validates Kiro steering frontmatter (`inclusion` field)
4. Validates Cursor `.mdc` frontmatter (`alwaysApply` field)
5. Reports constraints and skills separately in validation output

## Related

- VAL-01: Validate skill frontmatter
- CON-02: Generate constraints for Kiro
- CON-05: Generate constraints for Cursor
