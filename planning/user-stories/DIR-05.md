# DIR-05: Generate contextual directives per platform

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-05 |
| Priority | P1 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer, I want directives marked as `contextual` to be placed in the conditionally-loaded location for each platform so that they activate only when relevant.

## Acceptance Criteria

1. Kiro: contextual directives → `.kiro/steering/*.md` with `inclusion: auto` + `name` + `description` frontmatter
2. Cursor: contextual directives → `.cursor/rules/{name}-directive.mdc` with `description` field (no `alwaysApply`, no `globs`)
3. Claude Code: contextual directives → fall back to CLAUDE.md (platform has no conditional system)
4. GitHub Copilot: contextual directives → `.github/instructions/{name}.instructions.md` with `applyTo` glob derived from directive conditions
5. Amazon Q: contextual directives → `.amazonq/rules/{name}.md` (falls back to always-loaded — no conditional support)
6. Full directive content is used (not condensed), since it's guidance rather than constraints

## Related

- ADR-008: Hybrid Directives Model
- DIR-04: Generate enforced directives
