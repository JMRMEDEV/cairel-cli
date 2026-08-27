# TASK-014: Wizard enforcement selection step

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-014 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-03 |
| Depends on | TASK-011, TASK-012 |
| Blocks | — |

## Description

Add an enforcement level selection step to the wizard. In quick mode, defaults are used silently. In detailed mode, the user can review and override enforcement levels per directive.

## Implementation Guide

1. After directive selection, add enforcement configuration step
2. Quick mode: skip — use manifest defaults (no extra questions)
3. Detailed mode: show grouped summary and ask "Accept defaults or customize?"
   - If customize: show checkbox per-group, let user move directives between levels
4. Custom mode: show per-directive enforcement selector (3-column display)
5. Store selected enforcement levels in the answers object: `Map<string, EnforcementLevel>`
6. Pass enforcement map to the generator
7. Update `WizardAnswers` types to include enforcement selections

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. **Updated `src/types/wizard.ts`** — Added `EnforcementLevel` type, `EnforcementOverrides` type alias (`Record<string, EnforcementLevel>`), and `enforcementOverrides?: EnforcementOverrides` to all three answer interfaces (QuickSetupAnswers, DetailedSetupAnswers, CustomModeAnswers)
2. **Created `src/core/enforcement-selector.ts`** (221 lines) — New module with:
   - `getDefaultEnforcement()` — resolves manifest defaults for directive list
   - `selectEnforcementQuick()` — returns defaults without prompts (synchronous)
   - `selectEnforcementDetailed()` — shows grouped summary, asks accept/customize, allows moving directives between levels
   - `selectEnforcementCustom()` — per-directive enforcement level selector
   - `selectEnforcement()` — main entry point routing by wizard mode
3. **Updated `src/core/wizard.ts`** — Integrated enforcement selection step after directive resolution for quick/detailed modes and after directive checkbox for custom mode
4. **Updated `src/core/generator.ts`** — Uses `answers.enforcementOverrides?.[id]` to override manifest defaults when building DirectiveInfo array
5. **Created `tests/enforcement-selector.test.ts`** (468 lines, 19 tests) — Comprehensive tests covering:
   - Unit tests for `getDefaultEnforcement`, all three enforcement modes
   - Integration tests verifying wizard flow includes enforcement
   - Integration tests verifying generator respects enforcement overrides
6. **Updated `tests/detailed-setup.test.ts`** — Added enforcement accept mock to all 9 tests
7. **Updated `tests/custom-mode.test.ts`** — Added per-directive enforcement mocks to all custom mode tests

### Verification

- `npx tsc --noEmit` — passes clean
- `npm run build` — succeeds
- `npm test` — 14 suites, 134 tests pass (19 new + 115 existing, 1 existing test now exercises enforcement)
- Quick mode: zero enforcement prompts verified by test assertions on mock call counts
- Detailed mode: enforcement summary displayed, accept/customize flow tested
- Custom mode: per-directive enforcement selection verified
- Generator correctly uses overrides (integration test confirms enforced override → `.kiro/steering/`, available override → `.kiro/skills/`)

### Deferred

- None

## Acceptance Criteria

- [x] Quick mode produces zero extra prompts for enforcement
- [x] Detailed mode shows enforcement summary and offers customization
- [x] Custom mode allows per-directive enforcement selection
- [x] Selected enforcement levels are passed to generator
- [x] Tests cover all three wizard modes with enforcement

## Comments

- **2026-08-27 09:58** — Started implementation. Reviewed wizard.ts, generator.ts, directive-generator.ts, and types.
- **2026-08-27 10:15** — Complete. All acceptance criteria met. Created enforcement-selector.ts, updated wizard types, wizard flow, generator, and all affected tests. 14 suites, 134 tests pass. Build clean.
