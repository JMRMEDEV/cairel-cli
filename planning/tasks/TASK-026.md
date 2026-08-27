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

- [ ] `.github/workflows/release.yml` exists and is valid YAML
- [ ] Bump type derived from Conventional Commits across the commit range
- [ ] Build + full test suite run and gate the publish
- [ ] Publishes to public npm with `NPM_TOKEN` + `--access public`
- [ ] Uses git tag + release (no protected-branch commit-back) OR a documented bypass
- [ ] Release action cannot retrigger itself
- [ ] `docs/PUBLISH.md` updated; `NPM_TOKEN` secret documented
- [ ] ADR-010 added

## Notes / Risks

- Requires a human to create the `NPM_TOKEN` secret and confirm publish permissions —
  flag before enabling. Do NOT commit any token.
- First run should be validated with `workflow_dispatch` / a dry-run (`npm publish
  --dry-run`) before a real publish.
- Interacts with existing branch protection on `master` (observed during 2026-08-27
  push: "changes must be made through a pull request").

## Comments

- **2026-08-27 12:07** — Created from the munin version-bump feasibility assessment.
  Adopt the munin pattern with adaptations (npm/public registry, test gate, commit-range
  bump detection, tag-based release to respect branch protection).
