# CMD-05: cairel bootstrap — show .ai/ path for kiro-cli

## Metadata

| Field | Value |
|-------|-------|
| ID | CMD-05 |
| Priority | P2 |
| Scope | Done |
| Domain | commands |
| Subprojects | cli |

## Story

As a developer using kiro-cli, I want cairel to show me the path to its project initialization template so that I can bootstrap comprehensive project documentation.

## Acceptance Criteria

1. `cairel bootstrap` outputs the path to cairel's `.ai/KICKOFF-PROMPT.txt`
2. Instructions explain how to use it with kiro-cli
3. Does not copy files — only shows the path

## Related

- CMD-01: cairel init
