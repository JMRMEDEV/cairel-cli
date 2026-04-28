# CON-06: Generate constraints for Amazon Q

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-06 |
| Priority | P2 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As an Amazon Q user, I want cairel to generate separate constraint files in `.amazonq/rules/` so that my hard rules are distinguishable from detailed guidance even though both are auto-loaded.

## Acceptance Criteria

1. Generates `.amazonq/rules/<skill-name>-constraints.md` for each skill with constraints
2. Constraint files are terse (≤ 20 lines) and clearly labeled
3. Full skill files continue to generate as `.amazonq/rules/<skill-name>.md`
4. Both files are auto-loaded by Amazon Q (platform limitation — no activation modes)

## Related

- CON-01: Author constraint companions
- GEN-04: Generate flat rules for Amazon Q
