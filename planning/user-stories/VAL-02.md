# VAL-02: Validate agent JSON (AJV)

## Metadata

| Field | Value |
|-------|-------|
| ID | VAL-02 |
| Priority | P0 |
| Scope | Done |
| Domain | validation |
| Subprojects | cli |

## Story

As a developer, I want cairel to validate agent JSON files so that I know my agent configuration is well-formed.

## Acceptance Criteria

1. Validates agent JSON structure against schema
2. Checks required fields (name, description, prompt)
3. Validates MCP server configuration format
4. Clear error messages for schema violations

## Related

- ADR-004: Validation — Zod + AJV
