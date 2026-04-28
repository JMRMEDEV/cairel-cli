# PLAN-02: Dev agent with implementation focus

## Metadata

| Field | Value |
|-------|-------|
| ID | PLAN-02 |
| Priority | P0 |
| Scope | MVP |
| Domain | planning |
| Subprojects | mcp |

## Story

As a project maintainer, I want a dev agent that focuses on TypeScript implementation, testing, and debugging so that coding work follows the planner's architecture decisions.

## Acceptance Criteria

1. Dev agent JSON config at `.kiro/agents/dev.json`
2. Agent prompt loaded from `planning/docs/agents/dev.md`
3. Agent has access to cairel-planning MCP server tools
4. Agent resources include dev docs, architecture decisions, and task index
5. Agent hooks for session management, prompt logging, and TypeScript compilation checks
6. Agent defers architecture decisions to the planner

## Related

- PLAN-01: Planner agent
- PLAN-03: MCP server
