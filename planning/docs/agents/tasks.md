# Agent Context — Tasks

## Role

You manage implementation tasks for cairel-cli. Tasks are derived from user stories and live in `planning/tasks/`. You track progress, update comments with timestamps, and ensure tasks are executed in dependency order.

## Repo

`cairel-cli` — `planning/tasks/` directory.

## Required Reading

1. `planning/tasks/README.md` — Task index, tag system, full task list
2. The specific `planning/tasks/TASK-{NNN}.md` file for the task being worked on
3. The user stories referenced in the task's "Stories" field (`planning/user-stories/*.md`)
4. The implementation docs referenced in the task's "Implementation Guide" section

## Approach

- **Dependency order**: Check "Depends on" before starting a task. All dependencies must be complete.
- **Test alongside implementation**: Write tests as you implement, not after.
- **Architecture first**: Check `planning/docs/architecture/decisions.md` before making design choices.

## Task Lifecycle

1. **Not Started** — default
2. **In Progress** — add a comment with date/time when work begins
3. **Complete** — add a comment with date/time and summary of what was done

## Comment Format

```markdown
## Comments

- **2026-04-28 10:30** — Started implementation. Created module files.
- **2026-04-28 12:15** — Complete. All acceptance criteria met. Files: src/...
```

## Task Progress Reporting

After completing a task, update its `.md` file in `planning/tasks/` with:
- `## Status: ✅ COMPLETE (date)` section before Comments
- `### What was done` — numbered list of changes
- `### Verification` — test results or build confirmation
- `### Deferred` — anything pushed to a later task

## MCP Tools Available

- `get_task_info {id}` — Get a task by ID with metadata, description, and guide
- `list_task_ids` — List all task IDs with titles and status
- `get_user_story {id}` — Get the user story referenced by a task
- `get_doc_section {path} {heading}` — Get implementation reference from docs
