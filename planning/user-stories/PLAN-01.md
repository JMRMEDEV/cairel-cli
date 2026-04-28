# PLAN-01: Planner agent with architecture focus

## Metadata

| Field | Value |
|-------|-------|
| ID | PLAN-01 |
| Priority | P0 |
| Scope | MVP |
| Domain | planning |
| Subprojects | mcp |

## Story

As a project maintainer, I want a planner agent that focuses on architecture, system design, and task management so that planning work is separated from implementation work.

## Acceptance Criteria

1. Planner agent JSON config at `.kiro/agents/planner.json`
2. Agent prompt loaded from `planning/docs/agents/planning.md`
3. Agent has access to cairel-planning MCP server tools
4. Agent resources include planning docs, user stories, tasks, and architecture decisions
5. Agent hooks for session management and prompt logging
6. Agent focuses on architecture decisions, task creation, and coordination

## Related

- PLAN-02: Dev agent
- PLAN-03: MCP server
