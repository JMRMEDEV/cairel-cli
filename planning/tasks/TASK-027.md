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

- [ ] `release.yml` uses OIDC: `id-token: write` present, no `NPM_TOKEN` in publish
- [ ] Node bumped to ≥ 22.14.0 and npm ≥ 11.5.1 available in the job
- [ ] `npm publish` runs without a token; dry-run path preserved
- [ ] Safe-by-default gating unchanged (push → dry-run; live only via dispatch)
- [ ] `package.json` `repository.url` matches the GitHub repo (verified)
- [ ] YAML validates; `npm run build` + `npm test` still green
- [ ] `docs/PUBLISH.md` documents the Trusted Publisher setup + hardening
- [ ] ADR updated to reflect OIDC decision

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
