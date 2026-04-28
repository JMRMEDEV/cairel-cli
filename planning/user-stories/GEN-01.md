# GEN-01: Generate Agent Skills for Kiro

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-01 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As a Kiro user, I want cairel to generate Agent Skills in the `.kiro/skills/` directory so that Kiro can discover and use them natively.

## Acceptance Criteria

1. Creates `.kiro/skills/<skill-name>/SKILL.md` for each selected skill
2. Creates `.kiro/agents/dev-agent.json` with `skill://` resource URIs
3. Generated skills follow agentskills.io standard
4. Kiro discovers skills automatically

## Related

- SKL-02: agentskills.io standard
- ADR-005: Output Format
