# GEN-02: Generate Agent Skills for Claude Code

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-02 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As a Claude Code user, I want cairel to generate Agent Skills in the `.claude/skills/` directory.

## Acceptance Criteria

1. Creates `.claude/skills/<skill-name>/SKILL.md` for each selected skill
2. Generated skills follow agentskills.io standard

## Related

- SKL-02: agentskills.io standard
- ADR-006: Multi-Platform Support
