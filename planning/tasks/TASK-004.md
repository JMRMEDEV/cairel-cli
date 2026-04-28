# TASK-004: Audit curated skills and author CONSTRAINTS.md companions

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-004 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | skills |
| Subprojects | cli |
| Stories | CON-01 |
| Depends on | — |
| Blocks | TASK-005, TASK-006, TASK-007, TASK-008 |

## Description

Audit all 23 curated skills in `curated-presets/skills/` and create `CONSTRAINTS.md` companion files for skills that contain hard MUST/NEVER rules. Each constraints file should be ≤ 20 lines of terse, imperative rules extracted from the parent skill.

## Implementation Guide

1. Review each skill's `SKILL.md` for hard constraints (MUST, NEVER, ALWAYS patterns)
2. Skills likely to have constraints:
   - `git-management` — no commit body, no force push, human review
   - `conventional-commits` — type(scope): format, ≤ 50 chars
   - `semantic-versioning` — MAJOR.MINOR.PATCH rules
   - `package-manager-safety` — lock files, exact versions
   - `package-json-management` — field ordering, required fields
   - `typescript-validation` — strict mode, no `any`
   - `eslint-configuration` — no disable comments
   - `implementation-approval` — human approval for architecture
   - `test-cleanup-protocol` — cleanup after tests
   - `absolute-imports` — no relative imports
3. Skills likely WITHOUT constraints (pure guidance):
   - `context-retrieval`, `component-structure`, `mock-data-strategy`, `development-workflow-meta`
4. Create `CONSTRAINTS.md` in each qualifying skill folder
5. Format: plain markdown, no frontmatter, ≤ 20 lines, imperative tone

## Acceptance Criteria

- [ ] All 23 skills audited
- [ ] CONSTRAINTS.md created for qualifying skills
- [ ] Each constraints file ≤ 20 lines
- [ ] No duplication — constraints are extracted, not copied

## Comments
