# TASK-024: Update README to document the hybrid directives model

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-024 |
| Priority | P1 |
| Scope | MVP |
| Type | docs |
| Domain | directives |
| Subprojects | cli |
| Stories | DIR-04, DIR-05, DIR-06 |
| Depends on | TASK-013 |
| Blocks | — |

## Description

The root `README.md` predates ADR-008 (Hybrid Directives Model, accepted 2026-08-27)
and still describes the old pure-skills output model. It incorrectly implies Kiro
output goes only to `.kiro/skills/`. In reality, cairel routes each directive to a
platform layer based on its enforcement level:

| Enforcement | Kiro location |
|-------------|---------------|
| enforced | `.kiro/steering/` (`inclusion: always`) |
| contextual | `.kiro/steering/` (`inclusion: auto`) |
| available | `.kiro/skills/{name}/SKILL.md` |

Verified against actual generated output in cairel-qa (2026-08-27): react-ts-kiro
produces `.kiro/steering/` + `.kiro/skills/`, and multi-platform produces all five
platforms' layers.

## Implementation Guide

1. Update the "For Kiro" output-tree example to show BOTH `.kiro/steering/` (enforced +
   contextual) and `.kiro/skills/` (available), plus `.kiro/agents/`.
2. Fix line ~303: "**Kiro**: Creates `.kiro/skills/` directory..." → describe the hybrid
   layout (steering for enforced/contextual, skills for available, agents for agent JSON).
3. Fix line ~374: "Review the generated files in `.kiro/skills/` or `.amazonq/rules/`" →
   reference the correct paths.
4. Add a short "Enforcement Levels" subsection explaining enforced / contextual / available
   and how they map across platforms (summarize the ADR-008 matrix). Cross-reference
   ADR-008 in docs.
5. Reconcile any other stale references to the pure-skills model (e.g., the Cursor/Claude/
   Copilot trees) against the ADR-008 mapping — keep them accurate but concise.
6. Do NOT invent behavior — match what the generator actually produces (confirm against
   src/core/generator.ts / directive-generator.ts and the cairel-qa generated output).

## Acceptance Criteria

- [x] README Kiro section shows both `.kiro/steering/` and `.kiro/skills/` accurately
- [x] No remaining claim that Kiro output is only `.kiro/skills/`
- [x] Enforcement levels (enforced/contextual/available) are explained with platform mapping
- [x] All path references match actual generator output
- [x] Cross-reference to ADR-008 present

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Rewrote the "What Gets Generated" intro to describe enforcement-level routing and
   link to the new Enforcement Levels section and ADR-008.
2. Replaced the "For Kiro" tree with the hybrid layout: `.kiro/agents/`,
   `.kiro/steering/` (enforced `inclusion: always` + contextual `inclusion: auto`),
   and `.kiro/skills/` (available only), with a per-level bullet mapping.
3. Reconciled Cursor tree (all directives → `.cursor/rules/*.mdc`, enforcement via
   frontmatter incl. `alwaysApply: false` for available), replaced the stale
   `.claude/skills/` tree with `CLAUDE.md` sections, and updated the GitHub Copilot
   tree (`copilot-instructions.md` + `.github/instructions/` + `.github/skills/`) and
   the Amazon Q note (enforced + contextual only; available skipped).
4. Added an "Enforcement Levels" subsection defining enforced/contextual/available and
   a cross-platform mapping table summarizing the ADR-008 matrix, cross-referencing ADR-008.
5. Fixed the "Supported Platforms" list (Kiro now describes steering + skills + agents;
   Cursor/Claude/Copilot/Amazon Q descriptions reconciled).
6. Fixed the Troubleshooting line to reference `.kiro/steering/` and `.kiro/skills/`.

### Verification

- Confirmed generator routing against `src/core/directive-generator.ts`
  (`generateKiro`/`generateCursor`/`generateClaudeCode`/`generateGithubCopilot`/`generateAmazonQ`):
  Kiro enforced/contextual → `.kiro/steering/`, available → `.kiro/skills/{id}/SKILL.md`;
  Cursor all → `.cursor/rules/*.mdc`; Claude → `CLAUDE.md` (contextual falls back to
  enforced, available skipped); Copilot enforced → `copilot-instructions.md`, contextual →
  `.github/instructions/*.instructions.md`, available → `.github/skills/{id}/SKILL.md`;
  Amazon Q enforced/contextual → `.amazonq/rules/*.md`, available skipped.
- grep of README confirms the only remaining `.kiro/skills/` references describe
  available directives; no `.claude/skills/` references remain; no claim that Kiro
  output is only `.kiro/skills/`.
- Docs-only change; no TypeScript modified, so no compilation step required.

### Deferred

- None. Documented Cursor available → `.cursor/rules/*.mdc` (`alwaysApply: false`) and
  Copilot contextual → `.github/instructions/` to match actual generator output; these
  are slightly more precise than the ADR-008 summary matrix, which lists `.cursor/skills/`
  and root-level `*.instructions.md`. The generator behavior is authoritative.

## Comments

- **2026-08-27 11:39** — Created. README stale relative to ADR-008; confirmed real
  output in cairel-qa has both steering and skills layers.
- **2026-08-27 11:42** — Complete. Updated README hybrid model, Kiro/Cursor/Claude/
  Copilot/Amazon Q trees, added Enforcement Levels table, fixed Supported Platforms
  and Troubleshooting lines. Verified against src/core/directive-generator.ts.
