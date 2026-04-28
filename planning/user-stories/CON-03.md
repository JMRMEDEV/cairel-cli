# CON-03: Generate always-loaded constraints for Claude Code

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-03 |
| Priority | P1 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As a Claude Code user, I want cairel to generate a `CLAUDE.md` file with my hard rules so that constraints are always loaded at session start and survive context compaction.

## Acceptance Criteria

1. Generates or appends to `CLAUDE.md` in the project root
2. Constraint content is placed at the top of the file (highest visibility)
3. Each skill's constraints are grouped under a heading (e.g., `## Git Rules`)
4. Skills continue to generate in `.claude/skills/` as before
5. If `CLAUDE.md` already exists, appends constraints section without overwriting existing content

## Related

- CON-01: Author constraint companions
- GEN-02: Generate Agent Skills for Claude Code
