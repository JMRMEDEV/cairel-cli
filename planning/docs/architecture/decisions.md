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

## ADR-008: Future Vision — carm Package Manager

**Status**: Proposed  
**Date**: 2026-01-14

Post v2.0: npm-like package manager for AI rules and agents. Community contributions, versioning, dependency management. See `docs/FUTURE.md`.
