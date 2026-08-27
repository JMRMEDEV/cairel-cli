# DIR-09: Enforced directive content is concise extract

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-09 |
| Priority | P1 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a cairel maintainer, I want each directive that can be enforced to have a concise "enforced" variant (≤ 30 lines of imperative rules) separate from the full detailed content, so that always-loaded context stays lean.

## Acceptance Criteria

1. Each directive folder has: `DIRECTIVE.md` (full content) and optionally `ENFORCED.md` (concise extract)
2. `ENFORCED.md` is ≤ 30 lines, uses imperative tone (MUST/NEVER/ALWAYS)
3. Directives without meaningful hard rules have no `ENFORCED.md` (e.g., `context-retrieval`)
4. Generator uses `ENFORCED.md` when enforcement is `enforced`, `DIRECTIVE.md` for `contextual`/`available`
5. If no `ENFORCED.md` exists and user selects `enforced`, fall back to full `DIRECTIVE.md` with a warning about size

## Related

- ADR-008: Hybrid Directives Model
- DIR-04: Generate enforced directives
- CON-01 (superseded — this replaces CONSTRAINTS.md concept)
