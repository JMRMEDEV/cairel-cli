# REL-02: Tokenless npm publishing via Trusted Publishing (OIDC)

## Metadata

| Field | Value |
|-------|-------|
| ID | REL-02 |
| Priority | P1 |
| Scope | MVP |
| Domain | release |
| Subprojects | cli |

## Story

As a maintainer, I want cairel's release workflow to publish to npm using OIDC
Trusted Publishing instead of a stored `NPM_TOKEN`, so that there is no long-lived
credential to rotate, expose, or leak, and the pipeline keeps working as npm phases
out legacy/bypass-2FA tokens.

## Context

npm removed legacy tokens in November 2025 (only granular tokens remain), and from
August 2026 bypass-2FA tokens are blocked from account-governance actions. npm's
docs explicitly recommend Trusted Publishing (OIDC) over tokens for CI/CD: each
publish uses a short-lived, workflow-scoped credential that cannot be extracted or
reused, and provenance attestations are generated automatically for public
packages. This supersedes the `NPM_TOKEN` approach shipped in REL-01 / TASK-026.

Source: https://docs.npmjs.com/trusted-publishers

## Acceptance Criteria

1. The release workflow authenticates to npm via OIDC — no `NPM_TOKEN` secret is
   used for publishing.
2. The workflow declares `id-token: write` permission and runs on GitHub-hosted
   runners with npm ≥ 11.5.1 / Node ≥ 22.14.0.
3. `npm publish` runs without a token; the npm CLI auto-detects the OIDC environment.
4. Provenance attestations are produced automatically (public repo + public package).
5. The safe-by-default posture from REL-01 is preserved (push → dry-run; real publish
   only via explicit `workflow_dispatch` with `dry_run: false`).
6. `docs/PUBLISH.md` documents the one-time Trusted Publisher setup on npmjs.com
   (provider = GitHub Actions, exact workflow filename), plus the recommended
   hardening (require 2FA + disallow tokens) and revoking any leftover tokens.
7. `package.json` `repository.url` matches the GitHub repository (OIDC requirement).

## Related

- ADR-010 / ADR-011: Automated release + OIDC decision
- TASK-027: Migrate release workflow to Trusted Publishing (OIDC)
- REL-01 / TASK-026: Token-based automated release (superseded by this story)
