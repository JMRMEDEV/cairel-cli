# TASK-002: Create planner and dev agent configs

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-002 |
| Priority | P0 |
| Scope | MVP |
| Type | infra |
| Domain | planning |
| Subprojects | mcp |
| Stories | PLAN-01, PLAN-02 |
| Depends on | TASK-001 |
| Blocks | TASK-003 |

## Description

Create the Kiro agent JSON configs for the planner and dev agents. These define the two-agent workflow: planner handles architecture/planning, dev handles implementation/testing.

## Implementation Guide

1. Create `.kiro/agents/planner.json`:
   - Prompt from `planning/docs/agents/planning.md`
   - MCP servers: `cairel-planning`, `amazon-q-history`
   - Resources: planning docs, user stories, tasks, architecture
   - Hooks: session management, prompt logging, task progress
2. Create `.kiro/agents/dev.json`:
   - Prompt from `planning/docs/agents/dev.md`
   - MCP servers: `cairel-planning`, `amazon-q-history`
   - Resources: dev docs, architecture, task index
   - Hooks: session management, prompt logging, TypeScript compilation
3. Update existing `.kiro/agents/cairel-dev.json` to coexist with new agents

## Status: ✅ COMPLETE (2026-04-28)

### What was done

1. Created `.kiro/agents/planner.json` with full agent config
2. Created `.kiro/agents/dev.json` with full agent config
3. Both agents reference cairel-planning MCP server (TASK-003)
4. Both agents have session management and prompt logging hooks

### Verification

- Agent JSON files are valid JSON
- Prompt file references resolve correctly
- Resource paths are valid

### Deferred

- MCP server implementation (TASK-003)

## Comments

- **2026-04-28 08:55** — Created by planner session. Agent configs established.
