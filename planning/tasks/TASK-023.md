# TASK-023: E2E QA coverage for Kiro available/skills layer and empty scenarios

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-023 |
| Priority | P1 |
| Scope | MVP |
| Type | test |
| Domain | validation |
| Subprojects | cli |
| Stories | DIR-04, DIR-05, DIR-06, DIR-08 |
| Depends on | TASK-018, TASK-019, TASK-020, TASK-021, TASK-022 |
| Blocks | — |

## Description

The E2E QA harness (cairel-qa repo) has coverage gaps discovered on 2026-08-27:

1. **Kiro `available`/skills layer never exercised.** The only Kiro scenario
   (`react-ts-kiro`) generated exclusively `.kiro/steering/` (6 `inclusion: always`
   enforced + 8 `inclusion: auto` contextual). No directive was selected at the
   `available` enforcement level, so `.kiro/skills/{name}/SKILL.md` was never
   generated and the validator's Kiro skills branch was never validated end-to-end.
   Per ADR-008 / DIR-06, `available` directives route to `.kiro/skills/`.
2. **3 of 5 scenarios generated nothing.** `python-backend-q` (Amazon Q),
   `fullstack-claude` (Claude Code), and `multi-platform` (all platforms) contain
   only source scaffolding — no generated AI config. Their platform outputs have
   never been validated as user-facing generated output (only via unit tests).

Note: steering and skills do NOT need to coexist in a single project — enforcement
level is a per-directive deployment decision. The goal here is COVERAGE: exercise
both layers across scenarios, not force them into one project.

## Implementation Guide

Work in `/home/jmrmedev/repos/cairel-qa`. Prefer the programmatic `generateFiles(answers)`
API from `cairel-cli` (as used in `tests/platform-scan.test.ts`) to produce deterministic
scenario output, since `cairel init` is fully interactive (Inquirer) and cannot be
reliably scripted. A small generator script per scenario is acceptable.

1. **Kiro available/skills coverage** — regenerate or extend `react-ts-kiro` (or add a
   dedicated `react-ts-kiro-skills` scenario) so at least one directive is set to
   `available` enforcement, producing `.kiro/steering/` AND `.kiro/skills/{name}/SKILL.md`.
   Run `cairel validate` and confirm the skills branch passes and is reported under the
   Kiro group.
2. **python-backend-q** — generate Amazon Q output (`.amazonq/rules/`, `.amazonq/cli-agents/`)
   and validate it.
3. **fullstack-claude** — generate Claude Code output (`CLAUDE.md` for enforced;
   note Claude has no contextual/available layer per ADR-008) and validate it.
4. **multi-platform** — generate output for ALL platforms simultaneously, including at
   least one directive at each enforcement level so Kiro produces steering + skills,
   Cursor produces `.mdc`, Copilot produces its 3 layers, and agents are emitted. This
   scenario is the single-shot proof of the full hybrid model.
5. For each scenario, run `cairel validate` (no-arg auto-detect) and capture actual output.
6. Update `cairel-qa/QA-REPORT.md` with a dated section reporting per-scenario, per-layer
   evidence — explicitly showing the Kiro `available`/skills layer validating.
7. Update `cairel-qa/README.md` validation checklist to note both the steering and skills
   layers are covered.

## Acceptance Criteria

- [x] At least one scenario generates `.kiro/skills/{name}/SKILL.md` (available layer)
- [x] `cairel validate` confirms the Kiro skills/available branch passes (captured output)
- [x] `python-backend-q` generates and validates Amazon Q output
- [x] `fullstack-claude` generates and validates Claude Code output
- [x] `multi-platform` generates and validates all platform layers in one project
- [x] Every enforcement level (enforced / contextual / available) is exercised in e2e
- [x] QA-REPORT.md updated with dated per-layer evidence
- [x] No new regressions in `npm test`

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Added a deterministic scenario driver `cairel-qa/generate-scenarios.js` that invokes
   cairel-cli's programmatic `generateFiles(answers)` API (same entry point as
   `tests/platform-scan.test.ts`), since `cairel init` is interactive-only. It resets
   only generated AI config (`.kiro/.cursor/.claude/.github/.amazonq/CLAUDE.md`), preserving
   source scaffolding, then regenerates each scenario.
2. **react-ts-kiro** — set `component-structure` and `mock-data-strategy` to `available`
   enforcement, producing `.kiro/skills/{name}/SKILL.md` alongside `.kiro/steering/` (12
   files). Exercises the Kiro available/skills layer.
3. **python-backend-q** — generated Amazon Q output (`.amazonq/rules/` + `.amazonq/cli-agents/dev-agent.json`).
4. **fullstack-claude** — generated Claude Code `CLAUDE.md` (enforced only, per ADR-008).
5. **multi-platform** — generated ALL 5 platforms in one project with directives at every
   enforcement level (Kiro steering+skills, Cursor `.mdc`, Claude `CLAUDE.md`, Copilot 3
   layers, Amazon Q rules, plus 2 agents).
6. Updated `cairel-qa/QA-REPORT.md` with a dated 2026-08-27 TASK-023 section giving
   per-scenario, per-layer command evidence and an enforcement-level coverage matrix,
   explicitly showing the Kiro available/skills branch validating.
7. Updated `cairel-qa/README.md`: replaced the interactive-only usage with the programmatic
   driver, added an enforcement-layer table, and expanded the validation checklist to cover
   both the steering and skills layers plus all 5 platforms.

### Verification

- `cairel-cli`: `npm run build` clean (`tsc`, v2.2.1); `cairel` linked globally.
- `cairel validate` (no-arg) passes for all 4 regenerated scenarios:
  - react-ts-kiro → "Validated 14 directives and 1 agent across 1 platform"; the two
    `(available)` directives reported under the **Kiro** group, sourced from
    `.kiro/skills/{name}/SKILL.md` (full agentskills.io frontmatter).
  - python-backend-q → "Validated 6 directives and 1 agent across 1 platform" (Amazon Q).
  - fullstack-claude → "Validated 43 directives and 0 agents across 1 platform" (Claude Code).
  - multi-platform → "Validated 88 directives and 2 agents across 5 platforms".
- Enforcement levels enforced / contextual / available all exercised end-to-end.
- `npm test` → 255/256 pass. Only failure is the pre-existing, unrelated
  `tests/update.test.ts › "should detect missing configuration"` (known; not touched here).
  No new regressions.

### Deferred

- Recommendation #5 (non-interactive `init` mode / `--yes`) remains open — out of scope;
  the programmatic `generateFiles` driver is the deterministic substitute for E2E.
- Advisory line-count warnings on some always-loaded Amazon Q/Claude directives (>30 lines)
  are informational, not failures; content trimming is a separate concern.

## Comments

- **2026-08-27 11:33** — Created from E2E coverage-gap analysis. QA e2e validated
  `.kiro/steering/` (14 files) and `.cursor/rules/` (14 .mdc) only; the Kiro
  `available`/skills layer and 3 scenarios (Amazon Q, Claude, multi-platform) were
  never generated/validated end-to-end.
- **2026-08-27 11:40** — COMPLETE. Added `generate-scenarios.js` programmatic driver;
  regenerated all 5 scenarios and validated each with `cairel validate`. Kiro
  available/skills layer now emits and validates `.kiro/skills/{name}/SKILL.md`;
  multi-platform proves all 5 platforms + all 3 enforcement levels in one project.
  QA-REPORT.md + README.md updated. `npm test` 255/256 (1 known pre-existing failure).
