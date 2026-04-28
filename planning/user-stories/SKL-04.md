# SKL-04: Add new skill categories and skills

## Metadata

| Field | Value |
|-------|-------|
| ID | SKL-04 |
| Priority | P1 |
| Scope | MVP |
| Domain | skills |
| Subprojects | cli |

## Story

As a cairel maintainer, I want to easily add new skills and categories so that the tool stays current with evolving AI development practices.

## Acceptance Criteria

1. Adding a new skill only requires creating a `curated-presets/skills/<name>/SKILL.md` file
2. Manifest auto-regenerates on build to include the new skill
3. New categories can be added to `categories.json`
4. Validator schema accepts new categories
5. No source code changes required for new skills (data-driven)

## Related

- GEN-06: Data-driven skill selection
- ADR-007: Data-Driven Rule Selection
