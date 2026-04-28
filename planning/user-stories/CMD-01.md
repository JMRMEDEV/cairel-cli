# CMD-01: cairel init — initialize project

## Metadata

| Field | Value |
|-------|-------|
| ID | CMD-01 |
| Priority | P0 |
| Scope | Done |
| Domain | commands |
| Subprojects | cli |

## Story

As a developer, I want to run `cairel init` to initialize AI configuration for my project through an interactive wizard.

## Acceptance Criteria

1. `cairel init` launches the interactive wizard
2. Wizard mode selection (Quick/Detailed/Custom)
3. Generates skills and agent config based on answers
4. Shows success summary with generated files

## Related

- WIZ-01 through WIZ-06: Wizard stories
- GEN-01 through GEN-07: Generation stories
