# WIZ-03: Custom mode (select specific skills)

## Metadata

| Field | Value |
|-------|-------|
| ID | WIZ-03 |
| Priority | P0 |
| Scope | Done |
| Domain | wizard |
| Subprojects | cli |

## Story

As a developer with specialized needs, I want to manually select specific skills from the full catalog so that I get exactly the configuration I need.

## Acceptance Criteria

1. Shows all available skills grouped by category with checkboxes
2. Pre-checks always-include skills (context-retrieval, implementation-approval)
3. Validates at least one skill is selected
4. Includes MCP server selection
5. Shows review step before generation

## Related

- SKL-01: 23 curated Agent Skills
- WIZ-04: Review step
