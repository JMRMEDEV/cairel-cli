# cairel-planning MCP Server

MCP server that exposes the cairel-cli planning knowledge base (tasks, user stories, docs, architecture decisions) as tools for AI agents.

## Tools

| Tool | Description |
|------|-------------|
| `get_doc` | Get raw markdown content of a doc file from `planning/` |
| `get_doc_section` | Get a specific section from a doc file by heading |
| `get_task_info` | Get an implementation task by ID (e.g. TASK-001) |
| `list_task_ids` | List all task IDs with titles, optionally filter by priority |
| `get_user_story` | Get a user story by ID (e.g. WIZ-01, PLAN-03) |
| `list_user_stories` | List all user stories, optionally filter by priority/scope |
| `get_architecture_decision` | Get an architecture decision record by filename |

## Directory Structure

The server reads from the `planning/` directory at the repo root:

```
planning/
├── tasks/          # Implementation tasks (TASK-001.md, README.md index)
├── user-stories/   # User stories (WIZ-01.md, PLAN-03.md, etc.)
└── docs/
    └── architecture/  # Architecture decision records
```

## Setup

```bash
cd mcp-server
npm install
npm link
```

## Usage with Kiro CLI

The planner and dev agents in `.kiro/agents/` are already configured to use this server. After `npm link`, the `cairel-planning` command will be available.

Or run directly:

```bash
node server.js
```
