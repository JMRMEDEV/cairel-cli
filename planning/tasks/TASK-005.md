# TASK-005: Add constraint generation to the Kiro platform

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-005 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | generation |
| Subprojects | cli |
| Stories | CON-02 |
| Depends on | TASK-004 |
| Blocks | — |

## Description

Extend the generator to output `.kiro/steering/<skill-name>.md` files for skills that have `CONSTRAINTS.md` companions. Update agent JSON generation to include `"file://.kiro/steering/**/*.md"` in the resources array.

## Implementation Guide

1. In `generator.ts`, add `copySteeringFiles()` function:
   - For each selected skill, check if `CONSTRAINTS.md` exists in `curated-presets/skills/<name>/`
   - If yes, copy to `.kiro/steering/<name>.md` with `inclusion: always` frontmatter
2. Call `copySteeringFiles()` from `generateFiles()` when platform is `kiro`
3. Update `generateAgent()` to add `"file://.kiro/steering/**/*.md"` to agent resources
4. Add tests for steering file generation

## Acceptance Criteria

- [ ] `.kiro/steering/` files generated for skills with constraints
- [ ] Steering files have `inclusion: always` frontmatter
- [ ] Agent JSON includes steering resource glob
- [ ] Skills still generate in `.kiro/skills/` unchanged
- [ ] Tests pass

## Comments
