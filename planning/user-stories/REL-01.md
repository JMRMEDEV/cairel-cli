# REL-01: Automated semver release from Conventional Commits

## Metadata

| Field | Value |
|-------|-------|
| ID | REL-01 |
| Priority | P2 |
| Scope | MVP |
| Domain | release |
| Subprojects | cli |

## Story

As a maintainer, I want cairel to automatically determine the next semantic
version and publish to npm based on the Conventional Commit messages merged into
`master`, so that releases are consistent, hands-off, and no longer depend on the
manual `docs/PUBLISH.md` checklist.

## Context

Pattern sourced from the `munin-*` packages, which share an identical
`.github/workflows/release-package.yml`: on push to `master` it derives a
major/minor/patch/none bump from the last commit message, runs `npm version`,
commits the bump, and publishes. Cairel already writes Conventional Commits
(enforced by steering rules), so the required signal is present. See the
feasibility assessment (2026-08-27) for the full munin-vs-cairel comparison.

The munin workflow is adopted with adaptations, NOT copied verbatim, because
cairel differs in packaging and publishing (see ADR-010 / TASK-026).

## Acceptance Criteria

1. On push to `master`, a GitHub Actions workflow derives the bump type from
   Conventional Commits:
   - `feat!:` / `BREAKING CHANGE` → major
   - `feat:` → minor
   - `fix:` / `perf:` → patch
   - otherwise → no release
2. Bump detection scans the commit RANGE since the last release/tag, not only the
   tip commit (avoids under-bumping when several commits land at once).
3. Before any bump/publish, the workflow runs `npm run build` (prebuild manifest
   generation included) and `npm test` (256 tests) — publish is gated on green.
4. Publishes the `cairel` package to the PUBLIC npm registry using an `NPM_TOKEN`
   secret with `--access public` (cairel is public npm, not GitHub Packages).
5. The release records the version deterministically without fighting branch
   protection on `master` (prefer git tag + GitHub Release over pushing a
   `chore: release` commit back to the protected branch).
6. A release loop cannot be triggered by the release action itself.
7. `docs/PUBLISH.md` is updated to describe the automated flow (manual steps kept
   only as a documented fallback).

## Related

- ADR-010: Automated release workflow (to be added)
- TASK-026: Implement adapted munin-style release workflow
- Steering: Conventional Commits + Git management rules
