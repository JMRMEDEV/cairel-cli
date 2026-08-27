# TASK-012: Add enforcement level to directives manifest

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-012 |
| Priority | P0 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-02, DIR-09 |
| Depends on | TASK-011 |
| Blocks | TASK-013, TASK-014 |

## Description

Add `enforcement` field to each directive in the manifest and create `ENFORCED.md` companion files for directives that have hard constraints.

## Implementation Guide

1. Add `enforcement: "enforced" | "contextual" | "available"` to manifest schema
2. Classify all 24 directives:
   - **enforced** (default): git-management, conventional-commits, implementation-approval, package-manager-safety, typescript-validation, absolute-imports, semantic-versioning, eslint-configuration, test-cleanup-protocol
   - **contextual** (default): context-retrieval, component-structure, react-props-destructuring, visual-verification, mock-data-strategy, development-workflow-meta, markdown-maintenance, package-json-management, multi-environment-management, go-style-conventions, lua-semantic-versioning, react-native-component-patterns, icon-usage-patterns
   - **available** (default): chakra-ui-v3-integration, gluestack-ui-v1-themed
3. Create `ENFORCED.md` for each directive classified as `enforced`:
   - ≤ 30 lines, imperative tone
   - Extract MUST/NEVER/ALWAYS patterns from DIRECTIVE.md (or current SKILL.md)
4. Update Zod validation schema to require `enforcement` field
5. Update `generate-manifest.js` script

## Acceptance Criteria

- [x] All 24 directives have `enforcement` field in manifest
- [x] 9+ directives have `ENFORCED.md` companion file
- [x] Each `ENFORCED.md` ≤ 30 lines
- [x] Validation rejects directives missing `enforcement`
- [x] Manifest generation script produces correct output

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Added `cairel-enforcement: z.enum(['enforced', 'contextual', 'available'])` to the `SkillFrontmatterSchema` in `src/core/validator.ts` (required field within metadata)
2. Added `enforcement` field to the `DirectiveDefinition` interface in `src/core/directives-selector.ts`
3. Updated `scripts/generate-manifest.js` to extract `cairel-enforcement` from frontmatter and include it in the manifest output
4. Added `cairel-enforcement` to all 24 SKILL.md frontmatter files:
   - 9 classified as `enforced`: git-management, conventional-commits, implementation-approval, package-manager-safety, typescript-validation, absolute-imports, semantic-versioning, eslint-configuration, test-cleanup-protocol
   - 13 classified as `contextual`: context-retrieval, component-structure, react-props-destructuring, visual-verification, mock-data-strategy, development-workflow-meta, markdown-maintenance, package-json-management, multi-environment-management, go-style-conventions, lua-semantic-versioning, react-native-component-patterns, icon-usage-patterns
   - 2 classified as `available`: chakra-ui-v3-integration, gluestack-ui-v1-themed
5. Created 9 ENFORCED.md companion files (7-10 lines each, imperative tone with MUST/NEVER/ALWAYS rules)
6. Regenerated `directives-manifest.json` with enforcement field for all 24 directives

### Verification

- `npx tsc --noEmit` — passes clean
- `npm test` — 12 suites, 91 tests pass
- `npm run build` — succeeds (prebuild regenerates manifest correctly)
- Validation rejects directives missing enforcement: confirmed with manual test
- All ENFORCED.md files ≤ 30 lines (max is 10 lines)
- Manifest has 9 enforced, 13 contextual, 2 available — 0 missing

### Deferred

- None

## Comments

- **2026-08-27 09:47** — Started implementation. Added enforcement field to Zod schema, all 24 SKILL.md frontmatter files, manifest generator, and DirectiveDefinition interface. Created 9 ENFORCED.md files.
- **2026-08-27 09:52** — Complete. All acceptance criteria met. All tests pass, TypeScript compiles clean, manifest generation works correctly.
