# DIR-06: Generate available directives per platform

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-06 |
| Priority | P2 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer, I want directives marked as `available` to be placed in the on-demand location for each platform so that I can invoke them explicitly when needed.

## Acceptance Criteria

1. Kiro: available directives → `.kiro/skills/{name}/SKILL.md` (agentskills.io format)
2. Cursor: available directives → `.cursor/skills/{name}.md` or manual rule
3. GitHub Copilot: available directives → `.github/skills/{name}/SKILL.md`
4. Claude Code: skip (no on-demand system) — warn user that directive won't be output
5. Amazon Q: skip (no on-demand system) — warn user that directive won't be output
6. Platforms that don't support the `available` level produce a warning during generation listing which directives were skipped

## Related

- ADR-008: Hybrid Directives Model
- DIR-04: Generate enforced directives
- DIR-05: Generate contextual directives
