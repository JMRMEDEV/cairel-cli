# PLAN-03: MCP server for planning knowledge base

## Metadata

| Field | Value |
|-------|-------|
| ID | PLAN-03 |
| Priority | P0 |
| Scope | MVP |
| Domain | planning |
| Subprojects | mcp |

## Story

As an AI agent (planner or dev), I want an MCP server that exposes the planning knowledge base as tools so that I can look up tasks, user stories, docs, and architecture decisions programmatically.

## Acceptance Criteria

1. JS MCP server using `@modelcontextprotocol/sdk`
2. Tools: `get_task_info`, `list_task_ids`, `get_user_story`, `list_user_stories`, `get_doc`, `get_doc_section`, `get_architecture_decision`
3. Reads from `planning/` directory at repo root
4. Installable via `npm link` from `mcp-server/` directory
5. Runnable as `cairel-planning` command
6. Stdio transport for Kiro integration

## Related

- PLAN-01: Planner agent
- PLAN-02: Dev agent
