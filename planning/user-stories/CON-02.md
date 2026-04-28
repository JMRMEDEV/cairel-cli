# CON-02: Generate always-loaded constraints for Kiro

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-02 |
| Priority | P1 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As a Kiro user, I want cairel to generate constraint files in `.kiro/steering/` so that my hard rules are always loaded as persistent context and not buried in skill documents.

## Acceptance Criteria

1. For each selected skill with a `CONSTRAINTS.md`, generates `.kiro/steering/<skill-name>.md`
2. Steering files use `inclusion: always` frontmatter (Kiro default)
3. Generated agent JSON includes `"file://.kiro/steering/**/*.md"` in resources
4. Skills continue to generate in `.kiro/skills/` as before
5. Both steering and skills are generated in a single `cairel init` run

## Related

- CON-01: Author constraint companions
- GEN-01: Generate Agent Skills for Kiro
