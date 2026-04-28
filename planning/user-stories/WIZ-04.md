# WIZ-04: Review step before file generation

## Metadata

| Field | Value |
|-------|-------|
| ID | WIZ-04 |
| Priority | P1 |
| Scope | Done |
| Domain | wizard |
| Subprojects | cli |

## Story

As a developer, I want to review my configuration before files are generated so that I can confirm or cancel before any changes are made.

## Acceptance Criteria

1. Shows configuration summary with all choices
2. Lists selected skills with descriptions
3. Lists MCP servers to be configured
4. Confirmation prompt (proceed/cancel)
5. Cancel exits gracefully without writing files

## Related

- WIZ-01, WIZ-02, WIZ-03: All wizard modes
