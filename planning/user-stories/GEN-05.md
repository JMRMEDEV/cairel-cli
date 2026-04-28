# GEN-05: Generate agent JSON from Handlebars template

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-05 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As a developer, I want cairel to generate a properly configured agent JSON file so that my AI assistant has the right tools, MCP servers, and resources configured.

## Acceptance Criteria

1. Agent JSON generated from Handlebars template with wizard answers
2. Includes selected MCP servers with correct command paths
3. Includes resource paths pointing to generated skills
4. Valid JSON output (no HTML entities, proper formatting)

## Related

- ADR-003: Templating — Handlebars
- WIZ-05: MCP server auto-detection
