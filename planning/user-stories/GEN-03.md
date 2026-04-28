# GEN-03: Generate Agent Skills for GitHub Copilot

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-03 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As a GitHub Copilot user, I want cairel to generate Agent Skills in the `.github/skills/` directory.

## Acceptance Criteria

1. Creates `.github/skills/<skill-name>/SKILL.md` for each selected skill
2. Generated skills follow agentskills.io standard

## Related

- SKL-02: agentskills.io standard
- ADR-006: Multi-Platform Support
