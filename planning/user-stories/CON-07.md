# CON-07: Add Cursor as a supported platform

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-07 |
| Priority | P1 |
| Scope | MVP |
| Domain | generation |
| Subprojects | cli |

## Story

As a Cursor user, I want cairel to support Cursor as a target platform so that I can generate `.cursor/rules/` files with proper `.mdc` format and activation modes.

## Acceptance Criteria

1. `cursor` is a selectable platform in the wizard (all 3 modes)
2. Generator outputs to `.cursor/rules/` directory
3. Skill files use `.mdc` extension with YAML frontmatter
4. Skills use `agentRequested` mode with description for on-demand activation
5. Multi-platform output (GEN-07) includes Cursor alongside existing platforms

## Related

- CON-05: Generate constraints for Cursor
- GEN-07: Multi-platform simultaneous output
