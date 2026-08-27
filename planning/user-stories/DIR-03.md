# DIR-03: Wizard enforcement selection step

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-03 |
| Priority | P1 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer using cairel, I want the wizard to let me choose enforcement levels for my directives so that I can decide which rules are always enforced versus contextual guidance.

## Acceptance Criteria

1. After directive selection, wizard offers an enforcement step (skippable with defaults)
2. Quick mode: uses manifest defaults without asking (zero extra questions)
3. Detailed mode: shows a summary grouped by enforcement level, asks "Accept defaults or customize?"
4. Custom mode: per-directive enforcement selection via multi-select (grouped by level)
5. Users can override any directive's enforcement level (e.g., make `mock-data-strategy` enforced if they want)
6. The review step (if enabled) shows enforcement level next to each directive

## Related

- ADR-008: Hybrid Directives Model
- DIR-02: Add enforcement level to manifest
- WIZ-01, WIZ-02, WIZ-03
