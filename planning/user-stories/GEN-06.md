# GEN-06: Data-driven skill selection from manifest

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-06 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As a maintainer, I want skill selection to be driven by manifest data (not hardcoded logic) so that adding new skills only requires adding a SKILL.md file.

## Acceptance Criteria

1. Manifest auto-generated from skill frontmatter on `npm run build`
2. Selection logic matches wizard answers against `metadata.cairel-conditions`
3. Always-include skills are selected regardless of answers
4. No hardcoded skill selection logic in source code

## Related

- ADR-007: Data-Driven Rule Selection
- SKL-03: Cairel metadata in skill frontmatter
