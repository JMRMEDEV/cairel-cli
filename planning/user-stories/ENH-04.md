# ENH-04: Dry-run mode for init/update

## Metadata

| Field | Value |
|-------|-------|
| ID | ENH-04 |
| Priority | P2 |
| Scope | Post-MVP |
| Domain | enhancements |
| Subprojects | cli |

## Story

As a cautious developer, I want a dry-run mode so that I can preview what cairel would generate without actually writing files.

## Acceptance Criteria

1. `cairel init --dry-run` shows what would be generated
2. `cairel update --dry-run` shows what would change
3. Lists files that would be created, modified, or deleted
4. No files written to disk in dry-run mode

## Related

- CMD-01: cairel init
- CMD-02: cairel update
