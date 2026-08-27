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

## ADR-009: Future Vision — carm as Cross-Vendor Consolidation Layer

**Status**: Proposed (reframed 2026-08-27)  
**Date**: 2026-01-14 (original), 2026-08-27 (reframe)

### Context

The original framing positioned carm as "an npm-like package manager for AI rules and
agents." That framing under-specified the *why* and risked building yet another
capability store. The market has since made the real opportunity clearer: multiple
vendors already ship store-like surfaces for agent capabilities (Kiro powers, Claude
Skills, Cursor rules, Copilot skills, MCP server registries), but each **locks content to
its own format**. The unowned, valuable layer is the neutral cross-vendor one — and
vendors are structurally disinclined to build it because interop works against lock-in.

cairel already owns the hard part (the ADR-008 hybrid-directives transform: one authored
directive → enforced/contextual/available, routed per platform).

### Decision

Reframe carm as a **cross-vendor consolidation layer**, not another store — "author or
install a directive once, correctly shaped for whichever tools you use." Key positions:

1. **Consolidation, not competition.** carm distributes on top of the proven cairel
   transform; it consolidates the *portable subset* (markdown guidance + enforcement
   level) and is explicit that vendor-specific capabilities (skills with code/tool
   bindings) may not port losslessly.

2. **Community-maintained adapters answer protocol churn.** The maintenance burden of
   tracking five vendors' evolving formats is distributed to the ecosystem (npm-style):
   format churn becomes small distributed PRs and the shared reason the community exists.
   Caveat: this only works past critical mass, so early adoption/survival is the real risk.

3. **Validation gate before the registry.** The whole thesis rests on one unproven
   hypothesis — *people want to publish and consume cross-vendor directives from a shared
   source.* The smallest test (a Git-backed source + `carm add`, strangers publishing and
   installing cross-tool) must succeed **before** any registry backend, dependency
   resolution, or monetization is scheduled.

4. **Monetization: mostly free, npm-shaped.** Free/neutral public core funded by
   **donations**; **paid on-demand custom directive creation** (productized curation);
   **paid private instances / private registries** (the npm public-free/private-paid
   model). Dropped: speculative Pro/Enterprise tier ladders, analytics, SLAs as first
   moves.

5. **Trust infra already partly built.** The tokenless OIDC + provenance model from
   ADR-011 is the right foundation for a carm registry's publishing trust.

### Consequences

- carm work is **gated** on the portability-demand validation; nothing registry-scale is
  committed until the MVP proves the hypothesis.
- Success metrics are adoption-first (external publishers, cross-tool installs by
  non-authors; community adapter PRs) rather than feature counts.
- Full rationale, package/config shapes, sequenced roadmap, and metrics live in
  `docs/FUTURE.md` (reframed 2026-08-27). A superseding ADR will be added once the
  validation-gate MVP is scheduled.

## ADR-010: Automated Release — Tag-Based, Adapted from munin

**Status**: Accepted (publishing mechanism superseded by ADR-011)  
**Date**: 2026-08-27

> **Superseded in part by [ADR-011](#adr-011-npm-trusted-publishing-oidc--tokenless):**
> the `NPM_TOKEN` / `NODE_AUTH_TOKEN` publishing approach described in point 3 below is
> retired in favor of tokenless npm Trusted Publishing (OIDC). The rest of this ADR
> (tag-based release, commit-range bump detection, test gate, safe-by-default, loop
> guard) remains in force.

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

## ADR-011: npm Trusted Publishing (OIDC) — Tokenless

**Status**: Accepted  
**Date**: 2026-08-27

### Context

ADR-010 shipped the automated release workflow authenticating to npm with a
long-lived `NPM_TOKEN` automation secret (`NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`).
That approach is now both fragile and increasingly unsupported:

- npm removed legacy tokens in November 2025 (only granular tokens remain), and from
  August 2026 bypass-2FA tokens are blocked from account-governance actions.
- A stored token is a long-lived credential that must be rotated and can be leaked or
  exfiltrated.
- npm's own docs explicitly recommend **Trusted Publishing (OIDC)** over tokens for
  CI/CD, and the maintainer opted to skip token setup entirely.

Source: https://docs.npmjs.com/trusted-publishers (read 2026-08-27).

### Decision

Migrate `.github/workflows/release.yml` to **npm Trusted Publishing via OIDC**,
retiring `NPM_TOKEN` from the publish path entirely (REL-02 / TASK-027):

1. **Tokenless publish.** Remove `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` from the
   publish step. `npm publish --access public` runs with no token; the npm CLI
   auto-detects the GitHub Actions OIDC environment and mints a short-lived,
   workflow-scoped credential at publish time. No secret is stored, rotated, or leaked.

2. **OIDC permission.** Declare `permissions: id-token: write` (the critical bit) while
   keeping `contents: write` (the workflow still pushes the tag and cuts the GitHub
   Release).

3. **Toolchain requirements.** Trusted Publishing needs npm ≥ 11.5.1 and Node ≥ 22.14.0.
   Bump `actions/setup-node` to `node-version: 22` (which bundles a qualifying npm) and,
   belt-and-suspenders, run `npm i -g npm@latest` before publish (echoing `npm -v`).
   GitHub-hosted runners only (`ubuntu-latest`); self-hosted is unsupported.

4. **Automatic provenance.** For a public repo + public package, OIDC auto-generates
   provenance attestations. We do NOT pass `--provenance`.

5. **Per-package trusted-publisher config (human action).** The publisher is authorized
   on npmjs.com per package (Packages → cairel → Settings → Trusted Publisher → GitHub
   Actions), keyed on org/user `JMRMEDEV`, repo `cairel-cli`, and the exact workflow
   filename `release.yml`. npm does not validate this at save time — a mismatch only
   surfaces as `ENEEDAUTH` on publish.

6. **Preserved from ADR-010.** Safe-by-default gating (dry_run defaults true; push forced
   to dry-run), commit-range bump detection, build + `npm test` gate, tag-based release
   (no protected-branch commit-back), loop guard, and `registry-url:
   https://registry.npmjs.org` all remain unchanged.

7. **repository.url requirement.** OIDC requires `package.json` `repository.url` to match
   the GitHub repo; it is already `https://github.com/JMRMEDEV/cairel-cli.git` and must
   stay that way.

### Consequences

- No long-lived npm credential exists in GitHub secrets — nothing to rotate or leak.
- Each publish is authenticated by a short-lived, workflow-scoped OIDC credential that
  cannot be extracted or reused, and provenance is emitted automatically.
- The workflow filename `release.yml` becomes load-bearing: renaming it breaks publishing
  until the trusted-publisher config on npmjs.com is updated to match.
- Enabling live publish is now a human step on npmjs.com (configure the Trusted
  Publisher), not adding a repo secret. Recommended hardening: set the package's
  Publishing access to "require 2FA + disallow tokens" and revoke any leftover automation
  tokens.
- If private dependencies are ever added, installs would still need a read-only token —
  not applicable today (all deps are public).
- Supersedes the `NPM_TOKEN` publishing mechanism from ADR-010; the rest of ADR-010
  stands.
