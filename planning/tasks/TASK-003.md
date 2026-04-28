# TASK-003: Implement cairel-planning MCP server

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-003 |
| Priority | P0 |
| Scope | MVP |
| Type | feature |
| Domain | planning |
| Subprojects | mcp |
| Stories | PLAN-03 |
| Depends on | TASK-001, TASK-002 |
| Blocks | — |

## Description

Implement a JS MCP server that exposes the cairel-cli planning knowledge base (tasks, user stories, docs, architecture decisions) as tools for AI agents. This is a direct port of the libreq-planning MCP server adapted for cairel-cli's planning structure.

## Implementation Guide

1. Create `mcp-server/` directory:
   ```
   mcp-server/
   ├── package.json
   ├── server.js
   ├── bin/
   │   └── cairel-planning.js
   ├── src/
   │   ├── server.js
   │   └── handlers.js
   └── README.md
   ```
2. `package.json`:
   - name: `cairel-planning`
   - type: `module`
   - dependencies: `@modelcontextprotocol/sdk`, `zod`
   - bin: `cairel-planning` → `./bin/cairel-planning.js`
3. `src/server.js` — MCP server with tools:
   - `get_doc` — raw markdown content from `planning/`
   - `get_doc_section` — specific section by heading
   - `get_task_info` — task by ID (TASK-NNN)
   - `list_task_ids` — all tasks with titles and status
   - `get_user_story` — story by ID
   - `list_user_stories` — all stories with filters
   - `get_architecture_decision` — ADR by filename
4. `src/handlers.js` — tool implementations reading from `planning/` directory
5. `bin/cairel-planning.js` — CLI entry point with `--version` support
6. `server.js` — convenience entry point
7. `README.md` — setup and usage docs

## Acceptance Criteria

1. `cd mcp-server && npm install && npm link` installs the server
2. `cairel-planning` command starts the MCP server via stdio
3. All 7 tools return correct data from `planning/` directory
4. `list_task_ids` parses task README.md correctly
5. `get_user_story` finds stories by ID (e.g., WIZ-01, PLAN-03)
6. `list_user_stories` supports priority and scope filters
7. Error handling for missing files/sections returns clear messages

## Status: 🔲 Not Started

## Comments
