# SKL-02: Skills follow agentskills.io standard

## Metadata

| Field | Value |
|-------|-------|
| ID | SKL-02 |
| Priority | P0 |
| Scope | Done |
| Domain | skills |
| Subprojects | cli |

## Story

As a developer, I want cairel's skills to follow the open agentskills.io standard so that they work across any AI tool that supports the standard.

## Acceptance Criteria

1. Each skill is a folder with `SKILL.md` file
2. Frontmatter has `name` (lowercase, hyphens, ≤64 chars) and `description` (≤1024 chars)
3. Skill names match directory names
4. Skills are discoverable by AI agents via name and description

## Related

- ADR-005: Output Format — Agent Skills
