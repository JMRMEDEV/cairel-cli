# VAL-01: Validate skill frontmatter (Zod)

## Metadata

| Field | Value |
|-------|-------|
| ID | VAL-01 |
| Priority | P0 |
| Scope | Done |
| Domain | validation |
| Subprojects | cli |

## Story

As a skill author, I want cairel to validate my skill's frontmatter so that I catch formatting errors before they cause problems.

## Acceptance Criteria

1. Validates name format (lowercase, hyphens, ≤64 chars)
2. Validates description (non-empty, ≤1024 chars)
3. Validates cairel metadata fields (category, version, conditions, tags)
4. Clear error messages for each validation failure

## Related

- ADR-004: Validation — Zod + AJV
- SKL-02: agentskills.io standard
