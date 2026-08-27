# DIR-08: Validate directives per enforcement level

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-08 |
| Priority | P2 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer, I want `cairel validate` to check that generated directives have correct platform-specific frontmatter for their enforcement level so that I can catch misconfigurations.

## Acceptance Criteria

1. Validate Kiro steering: `inclusion` frontmatter matches expected enforcement
2. Validate Cursor rules: `alwaysApply`/`description`/`globs` fields are consistent with enforcement level
3. Validate Claude Code: `CLAUDE.md` sections exist for enforced directives
4. Validate GitHub Copilot: `copilot-instructions.md` exists for enforced, `*.instructions.md` has `applyTo` for contextual
5. Warn if enforced directives exceed 30 lines (performance degradation risk)
6. Warn if a platform doesn't support the chosen enforcement level for a directive

## Related

- ADR-008: Hybrid Directives Model
- CON-08 (superseded)
- VAL-01, VAL-02
