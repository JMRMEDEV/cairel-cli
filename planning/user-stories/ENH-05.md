# ENH-05: YAML config support

## Metadata

| Field | Value |
|-------|-------|
| ID | ENH-05 |
| Priority | P3 |
| Scope | Post-MVP |
| Domain | enhancements |
| Subprojects | cli |

## Story

As a developer who prefers YAML, I want cairel to support YAML agent configuration files as an alternative to JSON.

## Acceptance Criteria

1. Agent config can be written in YAML (.yml/.yaml)
2. Validation works for both JSON and YAML agent files
3. Generator can output YAML when requested
4. JSON remains the default format

## Related

- GEN-05: Generate agent JSON
- VAL-02: Validate agent JSON
