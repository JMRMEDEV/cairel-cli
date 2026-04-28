# WIZ-05: MCP server auto-detection

## Metadata

| Field | Value |
|-------|-------|
| ID | WIZ-05 |
| Priority | P1 |
| Scope | Done |
| Domain | wizard |
| Subprojects | cli |

## Story

As a developer, I want cairel to automatically detect my installed MCP servers so that I don't have to manually configure them.

## Acceptance Criteria

1. Scans known MCP server paths for installed servers
2. Presents detected servers as multi-select checkboxes
3. Allows adding custom server paths
4. Selected servers are included in agent JSON configuration

## Related

- GEN-05: Generate agent JSON
