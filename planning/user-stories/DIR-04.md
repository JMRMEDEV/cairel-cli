# DIR-04: Generate enforced directives per platform

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-04 |
| Priority | P0 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a developer, I want directives marked as `enforced` to be placed in the always-loaded location for each platform so that the AI cannot skip them.

## Acceptance Criteria

1. Kiro: enforced directives → `.kiro/steering/*.md` with `inclusion: always` frontmatter
2. Cursor: enforced directives → `.cursor/rules/{name}-directive.mdc` with `alwaysApply: true`
3. Claude Code: enforced directives → appended as sections in `CLAUDE.md`
4. GitHub Copilot: enforced directives → appended to `.github/copilot-instructions.md`
5. Amazon Q: enforced directives → `.amazonq/rules/{name}.md` (same as before — all rules are always-loaded)
6. Content for enforced directives is concise/imperative (≤ 30 lines), extracted from the full directive

## Related

- ADR-008: Hybrid Directives Model
- DIR-02: Add enforcement level to manifest
