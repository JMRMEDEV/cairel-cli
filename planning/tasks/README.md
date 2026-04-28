# Tasks — cairel-cli

Implementation tasks derived from user stories. Each task maps to one or more stories.

## Task ID Format

`TASK-{NNN}` — sequential, never renumbered.
`BUG-{NNN}` — bug fixes, sequential.

## Tags

- **subproject**: `cli`, `mcp`
- **domain**: `wizard`, `generation`, `validation`, `commands`, `skills`, `constraints`, `planning`
- **priority**: `P0`, `P1`, `P2`
- **scope**: `MVP`, `Post-MVP`
- **type**: `infra`, `feature`

## Task Index

### P0 MVP — Planning Workflow

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-001](./TASK-001.md) | Set up planning directory structure and docs | P0 | ✅ | PLAN-04, PLAN-05 |
| [TASK-002](./TASK-002.md) | Create planner and dev agent configs | P0 | ✅ | PLAN-01, PLAN-02 |
| [TASK-003](./TASK-003.md) | Implement cairel-planning MCP server | P0 | 🔲 | PLAN-03 |

### P1 MVP — Constraint Generation

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-004](./TASK-004.md) | Audit curated skills and author CONSTRAINTS.md companions | P1 | 🔲 | CON-01 |
| [TASK-005](./TASK-005.md) | Add constraint generation to the Kiro platform | P1 | 🔲 | CON-02 |
| [TASK-006](./TASK-006.md) | Add constraint generation for Claude Code and GitHub Copilot | P1 | 🔲 | CON-03, CON-04 |
| [TASK-007](./TASK-007.md) | Add Cursor as a supported platform | P1 | 🔲 | CON-05, CON-07 |

### P2 MVP — Constraint Extras

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-008](./TASK-008.md) | Add constraint generation for Amazon Q | P2 | 🔲 | CON-06 |
| [TASK-009](./TASK-009.md) | Add constraint validation to cairel validate | P2 | 🔲 | CON-08 |

---

## Summary

| Category | Total | ✅ Done | 🔲 Open |
|----------|-------|---------|---------|
| Tasks | 9 | 2 | 7 |
| Bugs | 0 | 0 | 0 |

**Remaining MVP work**:
- TASK-003: Implement cairel-planning MCP server (P0)
- TASK-004: Audit curated skills and author CONSTRAINTS.md companions (P1)
- TASK-005: Add constraint generation to the Kiro platform (P1)
- TASK-006: Add constraint generation for Claude Code and GitHub Copilot (P1)
- TASK-007: Add Cursor as a supported platform (P1)
- TASK-008: Add constraint generation for Amazon Q (P2)
- TASK-009: Add constraint validation to cairel validate (P2)

**Last Updated**: April 28, 2026
