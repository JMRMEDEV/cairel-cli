# ENH-01: Plugin system for third-party extensions

## Metadata

| Field | Value |
|-------|-------|
| ID | ENH-01 |
| Priority | P3 |
| Scope | Post-MVP |
| Domain | enhancements |
| Subprojects | cli |

## Story

As a developer, I want cairel to support plugins so that third parties can extend its capabilities without modifying core code.

## Acceptance Criteria

1. Plugin API for adding new wizard questions, skills, and output formats
2. Plugin discovery from node_modules
3. Plugin lifecycle hooks (pre-generate, post-generate)

## Related

- ADR-008: Future Vision — carm
