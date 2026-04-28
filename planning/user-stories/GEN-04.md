# GEN-04: Generate flat rules for Amazon Q (legacy)

## Metadata

| Field | Value |
|-------|-------|
| ID | GEN-04 |
| Priority | P0 |
| Scope | Done |
| Domain | generation |
| Subprojects | cli |

## Story

As an Amazon Q Developer user, I want cairel to generate flat `.md` rule files in `.amazonq/rules/` for backward compatibility.

## Acceptance Criteria

1. Creates `.amazonq/rules/<skill-name>.md` (flat files, not folders)
2. Creates `.amazonq/cli-agents/dev-agent.json` with `file://` resource URIs
3. Backward compatible with Amazon Q's expected format

## Related

- ADR-005: Output Format
- ADR-006: Multi-Platform Support
