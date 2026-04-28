# SKL-03: Cairel metadata in skill frontmatter

## Metadata

| Field | Value |
|-------|-------|
| ID | SKL-03 |
| Priority | P0 |
| Scope | Done |
| Domain | skills |
| Subprojects | cli |

## Story

As a cairel maintainer, I want cairel-specific selection metadata stored in the skill frontmatter so that the wizard can select skills based on project characteristics without conflicting with the agentskills.io standard.

## Acceptance Criteria

1. `metadata.cairel-title` — human-readable display name
2. `metadata.cairel-category` — category for grouping
3. `metadata.cairel-version` — semver version
4. `metadata.cairel-conditions` — conditions for automatic selection
5. `metadata.cairel-tags` — tags for filtering
6. `metadata.cairel-always-include` — flag for always-selected skills
7. AI tools ignore cairel metadata; cairel ignores standard fields

## Related

- ADR-007: Data-Driven Rule Selection
- GEN-06: Data-driven skill selection
