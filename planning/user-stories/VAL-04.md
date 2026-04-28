# VAL-04: Auto-detect skill directories for validation

## Metadata

| Field | Value |
|-------|-------|
| ID | VAL-04 |
| Priority | P1 |
| Scope | Done |
| Domain | validation |
| Subprojects | cli |

## Story

As a developer, I want `cairel validate` to automatically find and validate all skills in my project so that I don't have to specify paths manually.

## Acceptance Criteria

1. Detects `.kiro/skills/`, `.claude/skills/`, `.github/skills/` directories
2. Validates all SKILL.md files found in detected directories
3. Reports results per-file with pass/fail status

## Related

- VAL-01: Skill frontmatter validation
