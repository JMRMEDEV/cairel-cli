# WIZ-01: Quick setup wizard (6 questions)

## Metadata

| Field | Value |
|-------|-------|
| ID | WIZ-01 |
| Priority | P0 |
| Scope | Done |
| Domain | wizard |
| Subprojects | cli |

## Story

As a developer, I want a quick setup wizard that asks 6 high-level questions so that I can configure my AI development environment in under a minute.

## Acceptance Criteria

1. Wizard asks: project type, language, framework, git usage, platforms, MCP servers
2. Answers drive automatic skill selection from manifest
3. Wizard completes in under 60 seconds for typical projects
4. Context-aware framework choices based on language and project type

## Related

- GEN-06: Data-driven skill selection from manifest
- CMD-01: cairel init
