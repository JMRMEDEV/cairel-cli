# CON-04: Generate always-loaded constraints for GitHub Copilot

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-04 |
| Priority | P1 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As a GitHub Copilot user, I want cairel to generate constraint rules in `.github/copilot-instructions.md` so that my hard rules are included in every Copilot interaction.

## Acceptance Criteria

1. Generates or appends to `.github/copilot-instructions.md`
2. Constraint content is placed at the top of the file
3. Each skill's constraints are grouped under a heading
4. Skills continue to generate in `.github/skills/` as before (path-specific instructions)
5. If `copilot-instructions.md` already exists, appends constraints without overwriting

## Related

- CON-01: Author constraint companions
- GEN-03: Generate Agent Skills for GitHub Copilot
