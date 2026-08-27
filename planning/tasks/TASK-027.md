# TASK-027: Migrate release workflow to npm Trusted Publishing (OIDC)

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-027 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | release |
| Subprojects | cli |
| Stories | REL-02 |
| Depends on | TASK-026 |
| Blocks | — |

## Description

Replace the `NPM_TOKEN`-based publish in `.github/workflows/release.yml` with npm
**Trusted Publishing via OIDC**. This removes the long-lived secret entirely
(nothing to store, rotate, or leak) and future-proofs the pipeline: as of Nov 2025
npm removed legacy tokens, and bypass-2FA tokens face increasing restrictions
(account-governance actions blocked from Aug 2026). npm's own docs explicitly
recommend Trusted Publishing over tokens for CI/CD. OIDC also auto-generates
provenance attestations for public packages.

Source: https://docs.npmjs.com/trusted-publishers (read 2026-08-27).

## Hard Requirements (from npm docs)

- **npm CLI ≥ 11.5.1** and **Node ≥ 22.14.0** — the current workflow uses Node 20;
  it MUST be bumped (e.g. Node 22 with a bundled npm ≥ 11.5.1, or `npm i -g npm@latest`).
- Workflow must grant **`permissions: id-token: write`** (this is the critical bit).
  Keep `contents: write` too, since our workflow also pushes the tag / cuts the Release.
- **GitHub-hosted runners only** (self-hosted not supported). `ubuntu-latest` is fine.
- `package.json` `repository.url` must EXACTLY match the GitHub repo. Already correct:
  `https://github.com/JMRMEDEV/cairel-cli.git`. Verify it stays that way.
- `npm publish` runs with **no token** — the npm CLI auto-detects the OIDC environment.
  Do NOT pass `NODE_AUTH_TOKEN` for publish.
- Provenance is generated automatically for a public repo + public package (no
  `--provenance` flag needed). cairel is public, so this applies.

## Implementation Guide

1. Edit `.github/workflows/release.yml`:
   - Add top-level (or job-level) `permissions: { id-token: write, contents: write }`.
   - Bump `actions/setup-node` to `node-version: 22` (registry-url stays
     `https://registry.npmjs.org`). If the bundled npm is < 11.5.1, add a step
     `npm i -g npm@latest` before publish.
   - Replace the publish step: drop `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`; run
     plain `npm publish --access public` (dry-run branch keeps `--dry-run`).
   - Keep everything else: safe-by-default dry_run gating, commit-range bump
     detection, build+test gate, tag + GitHub Release, loop guard.
2. Preserve the safe-by-default posture: push events still forced to dry-run; real
   publish still requires `workflow_dispatch` with `dry_run: false` until the human
   flips live.
3. Update `docs/PUBLISH.md`:
   - Replace the `NPM_TOKEN` / granular-token section with the Trusted Publishing
     setup: on npmjs.com → Packages → `cairel` → Settings → Trusted Publisher →
     GitHub Actions → org/user `JMRMEDEV`, repo `cairel-cli`, **workflow filename
     `release.yml`** (exact, case-sensitive), allowed action `npm publish`.
   - Note npm doesn't validate the config at save time — mismatches only surface on
     publish (ENEEDAUTH). List the troubleshooting checks.
   - Recommend the hardening step: after OIDC works, set package Settings →
     Publishing access → "Require two-factor authentication and disallow tokens",
     and revoke any leftover automation tokens.
4. Update ADR-010 (or add ADR-011) to record the switch to OIDC and the retirement
   of the `NPM_TOKEN` approach.
5. Update TASK-026 notes to point at this migration (its NPM_TOKEN guidance is
   superseded).

## Acceptance Criteria

- [x] `release.yml` uses OIDC: `id-token: write` present, no `NPM_TOKEN` in publish
- [x] Node bumped to ≥ 22.14.0 and npm ≥ 11.5.1 available in the job
- [x] `npm publish` runs without a token; dry-run path preserved
- [x] Safe-by-default gating unchanged (push → dry-run; live only via dispatch)
- [x] `package.json` `repository.url` matches the GitHub repo (verified)
- [x] YAML validates; `npm run build` + `npm test` still green
- [x] `docs/PUBLISH.md` documents the Trusted Publisher setup + hardening
- [x] ADR updated to reflect OIDC decision

## Notes / Risks / Human Actions

- **Human step (cannot be automated here):** configure the Trusted Publisher on
  npmjs.com for the `cairel` package with the exact workflow filename `release.yml`.
  Publishing will fail with ENEEDAUTH until this is done.
- Do NOT commit or add any token. The whole point is to remove `NPM_TOKEN`.
- If private dependencies ever get added, installs would still need a read-only
  token — not applicable today (all deps are public).
- Keep the workflow filename stable (`release.yml`); renaming it breaks the trusted
  publisher config until updated on npmjs.com.

## Comments

- **2026-08-27 12:36** — Created. User wants to avoid a token-based CI/CD that will
  soon break / carries security concerns. Chose Trusted Publishing (OIDC) per npm's
  recommendation. Requirements captured from docs.npmjs.com/trusted-publishers:
  npm ≥ 11.5.1, Node ≥ 22.14.0, `id-token: write`, per-package trusted publisher
  config keyed on exact workflow filename, tokenless `npm publish`, auto-provenance.
- **2026-08-27 12:42** — Complete. Migrated `.github/workflows/release.yml` to tokenless
  OIDC: added `permissions: id-token: write` (kept `contents: write`), bumped
  `setup-node` to Node 22, added an `npm i -g npm@latest` step (echoes `npm -v`), and
  removed `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` from the publish step (plain
  `npm publish --access public`, dry-run branch kept, no `--provenance`). All TASK-026
  gating preserved. Rewrote the `docs/PUBLISH.md` go-live section (Trusted Publisher
  setup, ENEEDAUTH troubleshooting, 2FA/disallow-tokens hardening), added ADR-011, noted
  ADR-010 + TASK-026 superseded. Verified: YAML parses (`npx js-yaml`), `npm run build`
  exit 0, `npm test` 256/256, no `NPM_TOKEN`/`NODE_AUTH_TOKEN` left in the publish path,
  `repository.url` = `https://github.com/JMRMEDEV/cairel-cli.git`. No commits/tags/pushes;
  no secret added.

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. **`.github/workflows/release.yml` → tokenless OIDC:**
   - Added `permissions: id-token: write` (the critical OIDC bit) alongside the existing
     `contents: write` (still needed for the tag push + GitHub Release).
   - Bumped `actions/setup-node@v4` to `node-version: 22` (bundles npm ≥ 11.5.1);
     `registry-url: https://registry.npmjs.org` unchanged.
   - Added an `Ensure npm >= 11.5.1` step running `npm i -g npm@latest` and echoing
     `npm -v` (belt-and-suspenders).
   - Removed `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` from the publish step. It
     now runs plain `npm publish --access public` (npm CLI auto-detects OIDC). Dry-run
     branch (`npm publish --access public --dry-run`) preserved. No `--provenance` (auto).
   - Updated header/go-live comment blocks to describe the tokenless flow + Trusted
     Publisher setup.
   - All TASK-026 behavior preserved: safe-by-default gating (dry_run defaults true, push
     forced to dry-run), `resolve` job + loop guard, commit-range bump detection since
     last `v*` tag, build + `npm test` gate, tag + GitHub Release (no commit-back to
     protected master), `HUMAN: flip live` markers.
2. **`docs/PUBLISH.md`:** replaced the `NPM_TOKEN` / granular-token go-live section with
   the Trusted Publisher setup (npmjs.com → Packages → cairel → Settings → Trusted
   Publisher → GitHub Actions → user `JMRMEDEV`, repo `cairel-cli`, workflow filename
   `release.yml`, allowed action `npm publish`), an `ENEEDAUTH` troubleshooting note
   (npm doesn't validate config at save time), and the hardening recommendation (require
   2FA + disallow tokens; revoke leftover tokens). Updated the intro + "how it works"
   release step to reference OIDC/ADR-011 and auto-provenance.
3. **`planning/docs/architecture/decisions.md`:** added **ADR-011** (npm Trusted
   Publishing / OIDC — tokenless) and added a supersede note to ADR-010's status +
   header.
4. **`planning/tasks/TASK-026.md`:** added a Comments note that its `NPM_TOKEN` guidance
   is superseded by TASK-027 / REL-02 / ADR-011.

### Verification

- YAML: `npx js-yaml .github/workflows/release.yml` → "YAML OK: parses cleanly".
- No token in publish path: `grep NPM_TOKEN|NODE_AUTH_TOKEN` on the workflow returns only
  two explanatory comment lines confirming tokenlessness — zero active references.
- Build: `npm run build` → exit 0 (`tsc` + prebuild manifest gen).
- Tests: `npm test` → 20 suites, **256/256 passed**.
- `package.json` `repository.url` = `https://github.com/JMRMEDEV/cairel-cli.git`
  (verified, unchanged — matches the OIDC requirement).
- No commits, tags, or pushes were made; no secret was added. Changes left in the working
  tree for review.

### Deferred (human action required — NOT done here)

- **Configure the Trusted Publisher on npmjs.com** (cannot be automated): Packages →
  `cairel` → Settings → Trusted Publisher → GitHub Actions → org/user `JMRMEDEV`, repo
  `cairel-cli`, workflow filename `release.yml` (exact, case-sensitive), allowed action
  `npm publish`. Publishing fails with `ENEEDAUTH` until this is saved.
- **Run a live release**: Actions → *Release* → Run workflow → `dry_run: false`.
- **Hardening (recommended):** set the package's Publishing access to "require 2FA +
  disallow tokens" and revoke any leftover automation/granular tokens.
