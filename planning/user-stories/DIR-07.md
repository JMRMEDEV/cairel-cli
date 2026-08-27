# DIR-07: Add Cursor as a supported platform

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-07 |
| Priority | P1 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer using Cursor, I want cairel to generate Cursor-compatible rule files so that my directives work natively in Cursor's four-mode system.

## Acceptance Criteria

1. `cursor` added to the `Platform` type
2. Wizard platform selection includes Cursor
3. Enforced directives → `.cursor/rules/{name}-directive.mdc` with YAML frontmatter: `alwaysApply: true`
4. Contextual directives → `.cursor/rules/{name}-directive.mdc` with `description` field
5. Available directives → manual rule (has `description`, user invokes via @)
6. `.mdc` files use Cursor's expected format (YAML frontmatter + markdown body)
7. Integration test covers Cursor output

## Related

- ADR-008: Hybrid Directives Model
- CON-05, CON-07 (superseded)
