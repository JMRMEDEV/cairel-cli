# CMD-03: cairel validate — validate files

## Metadata

| Field | Value |
|-------|-------|
| ID | CMD-03 |
| Priority | P1 |
| Scope | Done |
| Domain | commands |
| Subprojects | cli |

## Story

As a developer, I want to validate my AI configuration files so that I can catch errors before they affect my workflow.

## Acceptance Criteria

1. `cairel validate` validates all detected config files
2. `cairel validate --skills` validates skills only
3. `cairel validate --agents` validates agents only
4. `cairel validate path/to/file` validates a specific file
5. Clear pass/fail output with error details

## Related

- VAL-01 through VAL-04: Validation stories
