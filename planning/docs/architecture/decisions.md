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

## ADR-010: Automated Release — Tag-Based, Adapted from munin

**Status**: Accepted  
**Date**: 2026-08-27

### Context

Cairel had no CI and released manually via `docs/PUBLISH.md`. The `munin-*` packages share an identical `release-package.yml` that, on push to `master`, derives a bump from the last commit message, runs `npm version`, commits `chore: release X.Y.Z` back to the branch, and publishes to GitHub Packages. Cairel already writes Conventional Commits (enforced by steering), so the bump signal exists — but cairel differs from munin in packaging, testing, registry, and branch protection, so the munin workflow cannot be copied verbatim (REL-01 / TASK-026).

### Decision

Adopt the munin automated-release pattern **with adaptations**, implemented in `.github/workflows/release.yml`:

1. **Tag-based release, not commit-back.** `master` is branch-protected (PRs required). Instead of pushing a `chore: release` commit to the protected branch, the workflow bumps `package.json` in the runner, creates an annotated tag `vX.Y.Z`, pushes only the **tag**, and cuts a GitHub Release. This records the version deterministically without fighting branch protection.

2. **Commit-range bump detection.** The bump type is derived from all commits since the last `v*` tag (fallback: last commit if no tag), choosing the HIGHEST applicable bump — `feat!`/`BREAKING CHANGE` → major, `feat` → minor, `fix`/`perf` → patch, else none. This avoids under-bumping when several commits land in one push.

3. **Public npm, not GitHub Packages.** Uses `actions/setup-node@v4` with `registry-url: https://registry.npmjs.org`, `npm install` (no lockfile committed), and publishes with `--access public` using `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.

4. **Test-gated.** Runs `npm run build` (prebuild manifest generation included) AND `npm test` (256 Jest tests) before any bump/publish; a failure blocks the release. munin builds only.

5. **Safe-by-default.** A `dry_run` `workflow_dispatch` input defaults to `true`, and `push` events are forced into dry-run mode, so no merge or first run can publish for real. Going live is an explicit human action (add `NPM_TOKEN`, run with `dry_run: false`, optionally remove the push override).

6. **Loop guard.** Runs where the head commit is a `chore(release):` commit are skipped so the release cannot retrigger itself.

### Consequences

- Releases become hands-off once a maintainer enables live publishing; the manual `docs/PUBLISH.md` checklist is retained only as a fallback.
- Requires a human-provisioned `NPM_TOKEN` secret; the workflow cannot self-provision it (documented in `docs/PUBLISH.md`).
- Because the tag is pushed (not a branch commit), `package.json`'s version on `master` is only updated when a follow-up PR syncs it, or the tag is treated as the source of truth for published versions. Maintainers should be aware the committed `package.json` version may briefly lag the published/tagged version.
- Diverges from the munin workflow, so the two are no longer copy-identical; the adaptations above are the rationale for the drift.
