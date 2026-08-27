# Tasks — cairel-cli

Implementation tasks derived from user stories. Each task maps to one or more stories.

## Task ID Format

`TASK-{NNN}` — sequential, never renumbered.
`BUG-{NNN}` — bug fixes, sequential.

## Tags

- **subproject**: `cli`, `mcp`
- **domain**: `wizard`, `generation`, `validation`, `commands`, `directives`, `planning`
- **priority**: `P0`, `P1`, `P2`
- **scope**: `MVP`, `Post-MVP`
- **type**: `infra`, `feature`, `refactor`

## Task Index

### P0 MVP — Planning Workflow

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-001](./TASK-001.md) | Set up planning directory structure and docs | P0 | ✅ | PLAN-04, PLAN-05 |
| [TASK-002](./TASK-002.md) | Create planner and dev agent configs | P0 | ✅ | PLAN-01, PLAN-02 |
| [TASK-003](./TASK-003.md) | Implement cairel-planning MCP server | P0 | 🔲 | PLAN-03 |

### P0 MVP — Hybrid Directives (ADR-008)

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-011](./TASK-011.md) | Rename skills to directives across codebase | P0 | 🔲 | DIR-01 |
| [TASK-012](./TASK-012.md) | Add enforcement level to directives manifest | P0 | 🔲 | DIR-02, DIR-09 |
| [TASK-013](./TASK-013.md) | Enforcement-aware file generator | P0 | 🔲 | DIR-04, DIR-05, DIR-06 |

### P1 MVP — Directives UX & Platforms

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-014](./TASK-014.md) | Wizard enforcement selection step | P1 | 🔲 | DIR-03 |
| [TASK-015](./TASK-015.md) | Add Cursor as supported platform | P1 | 🔲 | DIR-07 |

### P2 MVP — Directives Extras

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-016](./TASK-016.md) | Validate directives per enforcement level | P2 | 🔲 | DIR-08 |
| [TASK-017](./TASK-017.md) | Update command with enforcement-level awareness | P2 | 🔲 | DIR-10 |

### P1 — Technical Debt

| Task | Title | Priority | Status | Stories |
|------|-------|----------|--------|---------|
| [TASK-010](./TASK-010.md) | Code quality and technical debt cleanup | P1 | ✅ | — |

### ~~Superseded~~ (by ADR-008 Hybrid Directives)

| Task | Title | Status | Superseded by |
|------|-------|--------|---------------|
| ~~TASK-004~~ | ~~Audit curated skills and author CONSTRAINTS.md~~ | ❌ | TASK-012 |
| ~~TASK-005~~ | ~~Add constraint generation to Kiro~~ | ❌ | TASK-013 |
| ~~TASK-006~~ | ~~Add constraint generation for Claude Code / Copilot~~ | ❌ | TASK-013 |
| ~~TASK-007~~ | ~~Add Cursor as supported platform~~ | ❌ | TASK-015 |
| ~~TASK-008~~ | ~~Add constraint generation for Amazon Q~~ | ❌ | TASK-013 |
| ~~TASK-009~~ | ~~Add constraint validation~~ | ❌ | TASK-016 |

---

## Summary

| Category | Total | ✅ Done | 🔲 Open | ❌ Superseded |
|----------|-------|---------|---------|--------------|
| Tasks | 17 | 3 | 7 | 6 |
| Bugs | 0 | 0 | 0 | 0 |

**Active MVP work** (priority order):
1. TASK-011: Rename skills to directives (P0) — blocks everything
2. TASK-012: Add enforcement level to manifest (P0)
3. TASK-013: Enforcement-aware file generator (P0)
4. TASK-003: Implement cairel-planning MCP server (P0)
5. TASK-014: Wizard enforcement selection step (P1)
6. TASK-015: Add Cursor as supported platform (P1)
7. TASK-016: Validate directives per enforcement level (P2)
8. TASK-017: Update command enforcement awareness (P2)

**Last Updated**: August 27, 2026
