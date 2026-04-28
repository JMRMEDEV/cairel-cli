# CON-01: Author constraint companions for curated skills

## Metadata

| Field | Value |
|-------|-------|
| ID | CON-01 |
| Priority | P1 |
| Scope | MVP |
| Domain | constraints |
| Subprojects | cli |

## Story

As a cairel maintainer, I want each curated skill that has hard rules to include a `CONSTRAINTS.md` companion file so that the generator can output terse, always-loaded constraints separately from detailed skill guidance.

## Acceptance Criteria

1. Audit all 23 curated skills and identify which have MUST/NEVER-type hard rules
2. Create `CONSTRAINTS.md` in each qualifying skill folder (co-located with `SKILL.md`)
3. Each `CONSTRAINTS.md` is ≤ 20 lines of terse, imperative rules (no explanations)
4. Skills without hard constraints (e.g., `context-retrieval`) get no companion file
5. Constraint content is extracted from the skill, not duplicated — the skill remains the detailed reference

## Related

- SKL-01: 23 curated Agent Skills
- CON-02: Generate constraints for Kiro
