# CON-05: Generate always-loaded constraints for Cursor

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-05 |
| Priority | P1 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As a Cursor user, I want cairel to generate constraint rules as `.cursor/rules/*.mdc` files with `alwaysApply: true` so that my hard rules are loaded into every Cursor context.

## Acceptance Criteria

1. Generates `.cursor/rules/<skill-name>-constraints.mdc` for each skill with constraints
2. Each `.mdc` file has YAML frontmatter with `alwaysApply: true` and a description
3. Skills generate as `.cursor/rules/<skill-name>.mdc` with `agentRequested` mode (on-demand)
4. Cursor is added as a new platform option in the wizard
5. Both constraint and skill rules are generated in a single `cairel init` run

## Related

- CON-01: Author constraint companions
- CON-07: Add Cursor platform support
