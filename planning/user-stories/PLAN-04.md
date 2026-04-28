# PLAN-04: User stories with domain grouping

## Metadata

| Field | Value |
|-------|-------|
| ID | PLAN-04 |
| Priority | P0 |
| Scope | MVP |
| Domain | planning |
| Subprojects | mcp |

## Story

As a project maintainer, I want user stories organized by domain with a machine-readable index so that both humans and AI agents can efficiently navigate requirements.

## Acceptance Criteria

1. Stories organized in `planning/user-stories/` as individual `.md` files
2. Each story has: ID, priority, scope, domain, subprojects, story text, acceptance criteria
3. `README.md` provides human-readable index grouped by domain
4. `INDEX.md` provides machine-readable lookup table
5. Stories use domain prefixes (WIZ-, GEN-, VAL-, CMD-, SKL-, PLAN-, CARM-, ENH-)

## Related

- PLAN-05: Task tracking
- PLAN-03: MCP server (exposes stories as tools)
