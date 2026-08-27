# Architecture Decisions — cairel-cli

## ADR-001: Language — TypeScript

**Status**: Accepted  
**Date**: 2026-01-14

TypeScript provides type safety, better DX, and aligns with the npm ecosystem where cairel is published.

## ADR-002: CLI Framework — Commander.js + Inquirer.js

**Status**: Accepted  
**Date**: 2026-01-14

Commander.js for command routing, Inquirer.js for interactive prompts. Mature, well-maintained, widely used.

## ADR-003: Templating — Handlebars

**Status**: Accepted  
**Date**: 2026-01-14

Handlebars for agent JSON generation. Logic-less templates keep generation predictable.

## ADR-004: Validation — Zod + AJV

**Status**: Accepted  
**Date**: 2026-01-14

Zod for skill/rule frontmatter validation (TypeScript-first). AJV for agent JSON schema validation.

## ADR-005: Output Format — Agent Skills (agentskills.io)

**Status**: Accepted  
**Date**: 2026-04-22

Skills follow the open agentskills.io standard. Each skill is a folder with `SKILL.md`. Cairel-specific selection metadata lives in `metadata.cairel-*` fields. Amazon Q gets legacy flat `.md` files for backward compatibility.

## ADR-006: Multi-Platform Support

**Status**: Accepted  
**Date**: 2026-04-22

Support Kiro (`.kiro/skills/`), Claude Code (`.claude/skills/`), GitHub Copilot (`.github/skills/`), and Amazon Q (`.amazonq/rules/`). Users can select multiple platforms simultaneously.

## ADR-007: Data-Driven Rule Selection

**Status**: Accepted  
**Date**: 2026-01-15

Rules manifest auto-generated from skill frontmatter on build. No hardcoded selection logic. Conditions stored in `metadata.cairel-conditions` (single source of truth).

## ADR-008: Hybrid Directives Model

**Status**: Accepted  
**Date**: 2026-08-27

### Context

Cairel v2 outputs all curated content as "skills" (agentskills.io format). However, in practice AI tools have a spectrum of enforcement levels:

- **Always-loaded** content the AI cannot opt out of (Kiro steering, Cursor alwaysApply, CLAUDE.md)
- **Conditionally-loaded** content activated by file patterns or AI description-matching
- **On-demand** content invoked explicitly by the user

The agentskills.io skill format relies on the AI reading metadata and self-selecting — fine for guidance but unreliable for hard constraints (MUST/NEVER rules). Users need deterministic enforcement for critical rules.

### Decision

Adopt a **directives model** with user-selectable enforcement levels:

1. **Rename the concept**: Cairel's curated content units are called **directives** (not "rules" or "skills" — those are platform-specific delivery mechanisms).

2. **Three enforcement levels** per directive:
   - `enforced` — always loaded every session, AI cannot skip
   - `contextual` — loaded when file patterns match or AI determines relevance
   - `available` — on-demand only, user must explicitly invoke

3. **Platform mapping**: Cairel routes each directive to the correct platform layer based on enforcement level:

   | Enforcement | Kiro | Cursor | Claude Code | GitHub Copilot | Amazon Q |
   |-------------|------|--------|-------------|----------------|----------|
   | enforced | `.kiro/steering/` (`inclusion: always`) | `.cursor/rules/*.mdc` (`alwaysApply: true`) | Append to `CLAUDE.md` | `.github/copilot-instructions.md` | `.amazonq/rules/` |
   | contextual | `.kiro/steering/` (`inclusion: auto`) | `.cursor/rules/*.mdc` (with `description`) | — (not supported) | `*.instructions.md` with `applyTo` | `.amazonq/rules/` |
   | available | `.kiro/skills/*/SKILL.md` | `.cursor/skills/` | — | `.github/skills/` | — |

4. **No redundancy**: Each directive is placed in exactly one layer per platform. The content is authored once; the enforcement level is a deployment decision.

5. **Default enforcement**: The manifest declares a default enforcement level per directive (e.g., `git-management` → `enforced`, `mock-data-strategy` → `contextual`). Users can override during the wizard.

### Consequences

- CON-01 through CON-08 are superseded by this model (constraints are just directives with `enforcement: enforced`)
- The `curated-presets/skills/` directory becomes `curated-presets/directives/`
- The wizard gains an enforcement selection step
- The generator must route output to different platform locations based on enforcement level
- Platforms that don't support a given enforcement level fall back to the nearest supported one (e.g., Claude Code has no contextual layer → contextual directives become enforced in CLAUDE.md)

## ADR-009: Future Vision — carm Package Manager

**Status**: Proposed  
**Date**: 2026-01-14

Post v2.0: npm-like package manager for AI rules and agents. Community contributions, versioning, dependency management. See `docs/FUTURE.md`.
