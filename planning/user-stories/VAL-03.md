# VAL-03: Validate individual files

## Metadata

| Field | Value |
|-------|-------|
| ID | VAL-03 |
| Priority | P1 |
| Scope | Done |
| Domain | validation |
| Subprojects | cli |

## Story

As a developer, I want to validate a single file so that I can check my work without scanning the entire project.

## Acceptance Criteria

1. `cairel validate path/to/file.md` validates a single skill file
2. `cairel validate path/to/agent.json` validates a single agent file
3. Auto-detects file type from extension (.md → skill, .json → agent)

## Related

- VAL-01, VAL-02: Validation schemas
