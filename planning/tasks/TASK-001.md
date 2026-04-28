# TASK-001: Set up planning directory structure and docs

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-001 |
| Priority | P0 |
| Scope | MVP |
| Type | infra |
| Domain | planning |
| Subprojects | mcp |
| Stories | PLAN-04, PLAN-05 |
| Depends on | — |
| Blocks | TASK-002, TASK-003 |

## Description

Create the full planning directory structure with user stories, task tracking, agent docs, and architecture decisions. This mirrors the proven workflow from libreq.

## Implementation Guide

1. Create `planning/` directory structure:
   - `planning/README.md` — overview
   - `planning/docs/` — documentation
   - `planning/docs/INDEX.md` — doc index
   - `planning/docs/architecture/decisions.md` — ADRs
   - `planning/docs/agents/planning.md` — planner agent prompt
   - `planning/docs/agents/dev.md` — dev agent prompt
   - `planning/docs/agents/tasks.md` — task management context
   - `planning/user-stories/` — user stories
   - `planning/user-stories/README.md` — human-readable index
   - `planning/user-stories/INDEX.md` — machine-readable index
   - `planning/tasks/` — implementation tasks
   - `planning/tasks/README.md` — task index
2. Write user stories for all existing features (Done scope) and planned features (MVP/Post-MVP)
3. Follow libreq format: metadata table, story text, acceptance criteria, related items

## Status: ✅ COMPLETE (2026-04-28)

### What was done

1. Created full `planning/` directory structure
2. Created 37 user stories across 8 domains (wizard, generation, validation, commands, skills, planning, carm, enhancements)
3. Created README.md and INDEX.md for user stories
4. Created agent prompt docs (planning.md, dev.md, tasks.md)
5. Created architecture decisions document (8 ADRs)
6. Created documentation index

### Verification

- All story files created with correct format
- INDEX.md counts match README.md counts
- All cross-references are valid

### Deferred

- Tasks for planned features (to be created as features are planned)

## Comments

- **2026-04-28 08:55** — Created by planner session. Full planning structure established.
