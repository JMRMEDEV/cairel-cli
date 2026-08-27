# TASK-026: Implement adapted munin-style automated release workflow

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-026 |
| Priority | P2 |
| Scope | MVP |
| Type | feature |
| Domain | release |
| Subprojects | cli |
| Stories | REL-01 |
| Depends on | — |
| Blocks | — |

## Description

Add a GitHub Actions workflow that automatically bumps cairel's semver version and
publishes to npm based on Conventional Commit messages, adapting the shared
`munin-*` `release-package.yml` pattern. Cairel currently has NO CI and releases
manually via `docs/PUBLISH.md`.

Reference (munin pattern, identical across all 6 munin-* repos): trigger on push to
master → derive bump from last commit message → `npm version <type> --no-git-tag-version`
→ bot commits `chore: release X.Y.Z` and pushes → `npm publish` to GitHub Packages.

## Required Adaptations (do NOT copy munin verbatim)

| munin assumption | cairel reality | Adaptation |
|------------------|----------------|------------|
| Yarn 4 + Corepack | npm, no lockfile | `npm install`; drop corepack |
| GitHub Packages registry | public npm (`cairel`) | `registry-url: https://registry.npmjs.org`, `NPM_TOKEN` secret, `--access public` |
| build only, no tests | has prebuild manifest gen + 256 Jest tests | run `npm run build` AND `npm test`; gate publish on green |
| bot pushes bump to master | `master` has branch protection (PR-required) | prefer git tag + GitHub Release over commit-back to avoid protected-push |
| inspects last commit only | pushes can batch commits | scan commit range since last tag |

## Implementation Guide

1. Add `.github/workflows/release.yml`:
   - Trigger: `push` to `master` + `workflow_dispatch`.
   - Steps: checkout (full history: `fetch-depth: 0`), setup Node 18/20 with
     `registry-url: https://registry.npmjs.org`, `npm install`, `npm run build`,
     `npm test`.
   - Bump detection: inspect commits since the last `v*` tag (fallback to last
     commit if no tag). Map per Conventional Commits (feat!/BREAKING→major,
     feat→minor, fix|perf→patch, else none). Pick the HIGHEST applicable bump in
     the range.
   - Loop guard: skip if triggered by the release itself (e.g. tag push, or head
     commit matches `chore(release)`).
   - Version: `npm version <type>` to bump package.json, create tag `vX.Y.Z`, push
     the tag (not a branch commit) — respects branch protection. Optionally open a
     GitHub Release with generated notes.
   - Publish: `npm publish --access public` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.
2. Document the `NPM_TOKEN` repo secret requirement (README/PUBLISH.md); the human
   must add it — the workflow cannot self-provision it.
3. Update `docs/PUBLISH.md`: automated flow is primary; manual steps become fallback.
4. Add an ADR-010 entry in `planning/docs/architecture/decisions.md` capturing the
   decision to use tag-based automated releases adapted from munin.

## Acceptance Criteria

- [x] `.github/workflows/release.yml` exists and is valid YAML
- [x] Bump type derived from Conventional Commits across the commit range
- [x] Build + full test suite run and gate the publish
- [x] Publishes to public npm with `NPM_TOKEN` + `--access public`
- [x] Uses git tag + release (no protected-branch commit-back) OR a documented bypass
- [x] Release action cannot retrigger itself
- [x] `docs/PUBLISH.md` updated; `NPM_TOKEN` secret documented
- [x] ADR-010 added

## Notes / Risks

- Requires a human to create the `NPM_TOKEN` secret and confirm publish permissions —
  flag before enabling. Do NOT commit any token.
- First run should be validated with `workflow_dispatch` / a dry-run (`npm publish
  --dry-run`) before a real publish.
- Interacts with existing branch protection on `master` (observed during 2026-08-27
  push: "changes must be made through a pull request").

## Status: ✅ COMPLETE (2026-08-27)

### What was done

1. Added `.github/workflows/release.yml` — an adapted munin-style automated release
   workflow:
   - Triggers: `push` to `master` + `workflow_dispatch` (with a `dry_run` input).
   - `resolve` job: computes dry-run mode (dispatch honors input; push is forced to
     dry-run) and runs the loop guard (skips `chore(release):` head commits).
   - `release` job: checkout with `fetch-depth: 0`, `setup-node@v4` (node 20,
     `registry-url: https://registry.npmjs.org`), `npm install`, `npm run build`,
     `npm test`.
   - Bump detection scans the commit range since the last `v*` tag (fallback
     `HEAD~1..HEAD`) and picks the HIGHEST bump: `!`/BREAKING→major, feat→minor,
     fix|perf→patch, else none.
   - Release: `npm version <type>`, then `npm publish --access public` (with
     `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`), then push the **tag** only and cut a
     GitHub Release. Never commits back to protected `master`.
2. Rewrote `docs/PUBLISH.md`: automated flow is now primary (trigger/verify/bump/release,
   safe-by-default section, go-live steps, `NPM_TOKEN` secret setup); the old checklist
   is retained under "Manual Release (documented fallback)".
3. Added ADR-010 to `planning/docs/architecture/decisions.md` documenting the tag-based
   automated release adapted from munin and the rationale for each adaptation.

### Verification

- YAML syntax: `npx js-yaml .github/workflows/release.yml` → "YAML OK: parses cleanly".
- Build: `npm run build` → exit 0 (`tsc`, prebuild manifest gen ran).
- Tests: `npm test` → 20 suites, **256/256 passed**.
- No commits, tags, or pushes were made; no token was added. All changes left in the
  working tree for human review.

### Deferred (human action required — NOT done here)

- **Enabling live publish is a human action.** A maintainer must: (1) add the
  `NPM_TOKEN` repository secret (npm automation token), and (2) trigger the workflow via
  `workflow_dispatch` with `dry_run: false`. Optionally, (3) remove the push→dry-run
  override (marked `HUMAN: flip live` in the workflow) to allow push-to-master real
  publishes. None of these were performed — the workflow is safe-by-default and will only
  dry-run until a human flips it live.
- Keeping the committed `package.json` version in sync with pushed tags may need a
  follow-up convention (documented in ADR-010 consequences).

## Comments

- **2026-08-27 12:07** — Created from the munin version-bump feasibility assessment.
  Adopt the munin pattern with adaptations (npm/public registry, test gate, commit-range
  bump detection, tag-based release to respect branch protection).
- **2026-08-27 12:12** — Started implementation. Read TASK-026, REL-01, and the munin
  reference workflow; confirmed branch `master`, existing `v*` tags, no `.github/workflows`.
- **2026-08-27 12:20** — Complete. Authored `.github/workflows/release.yml` (safe-by-default,
  dry_run defaults true, forced dry-run on push, loop guard, commit-range bump, tag-based
  release, public npm publish gated on green build+test). Updated `docs/PUBLISH.md` and added
  ADR-010. Verified: YAML parses, `npm run build` exit 0, `npm test` 256/256. No commits/tags/
  pushes; no token added. Live publish left as a documented human action.
