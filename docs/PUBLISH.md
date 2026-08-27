# Publishing cairel

## Automated Release (primary) 🤖

Releases are driven by the GitHub Actions workflow at
[`.github/workflows/release.yml`](../.github/workflows/release.yml) (see
[ADR-010](../planning/docs/architecture/decisions.md) / REL-01 / TASK-026). It derives
the next semantic version from the Conventional Commit messages since the last `v*`
tag and publishes the `cairel` package to the public npm registry.

### How it works

1. **Trigger** — push to `master`, or manual `workflow_dispatch` from the Actions tab.
2. **Verify** — installs deps (`npm install`), runs `npm run build` (which auto-runs the
   prebuild manifest generator) and `npm test` (256 tests). A red build/test blocks the
   release.
3. **Bump detection** — scans the commit RANGE since the last `v*` tag (falls back to the
   last commit if there are no tags) and picks the HIGHEST applicable bump:
   - `feat!:` / `<type>!:` / `BREAKING CHANGE` → **major**
   - `feat:` → **minor**
   - `fix:` / `perf:` → **patch**
   - otherwise → **no release**
4. **Release** — bumps `package.json`, creates an annotated tag `vX.Y.Z`, publishes to
   npm with `--access public`, then pushes the **tag** (never a commit to the protected
   `master` branch) and cuts a GitHub Release with generated notes.
5. **Loop guard** — a `chore(release):` head commit is skipped so the release cannot
   retrigger itself.

### Safe-by-default ⚠️

The workflow will **not** publish for real or push a tag until a human explicitly opts
in:

- `workflow_dispatch` has a `dry_run` input that **defaults to `true`**.
- A plain `push` to `master` is **forced into dry-run mode** — merging a PR can never
  publish on its own.
- In dry-run mode, `npm publish` runs with `--dry-run` and the tag/Release are computed
  and logged but **not pushed**.

### Going live (human actions required)

These steps are intentionally NOT automated and must be performed by a maintainer:

1. **Add the `NPM_TOKEN` repo secret.** Create an npm **automation** token with publish
   rights to the `cairel` package (npm → Access Tokens → Generate → Automation), then add
   it under **Settings → Secrets and variables → Actions → New repository secret** named
   `NPM_TOKEN`. The workflow references it only as `${{ secrets.NPM_TOKEN }}`; it is never
   printed or committed.
2. **Run a real release.** Actions tab → *Release* → **Run workflow** → set
   `dry_run: false`.
3. **(Optional, higher risk)** To let a normal push to `master` publish automatically,
   remove the push→dry-run override in the `resolve` job (search the workflow for
   `HUMAN: flip live`). This is deliberately off by default.

> First real run should be validated by triggering `workflow_dispatch` with
> `dry_run: true` and confirming the logs show the intended version bump and a successful
> `npm publish --dry-run`.

---

## Manual Release (documented fallback) 🛠️

Use these steps only if the automated workflow is unavailable (e.g. Actions outage, or
publishing from a local machine).

## Pre-Publication Verification ✅

### Files Created
- ✅ LICENSE (MIT)
- ✅ .npmignore (excludes source material)
- ✅ Repository URLs in package.json

### Package Verification
- ✅ Build successful (`npm run build`)
- ✅ All tests passing (74/74)
- ✅ Package size: 77.4 kB (unpacked: 311.1 kB)
- ✅ Total files: 82
- ✅ Dry-run successful (`npm pack --dry-run`)

### Package Contents
- ✅ dist/ (compiled TypeScript)
- ✅ curated-presets/ (22 rules + templates)
- ✅ .ai/ (project initialization protocol)
- ✅ README.md
- ✅ LICENSE

### Excluded from Package
- ✅ Source material (agents-compendium, projects-rules-compendium)
- ✅ Development files (src/, tests/, .kiro/, .amazon-q-history/)
- ✅ Phase documentation (PHASE-1-SUMMARY.md, etc.)

---

## Publication Steps

### 1. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "chore: prepare for v1.0.0 release"

# Create repository on GitHub: https://github.com/JMRMEDEV/cairel-cli
# Then push
git remote add origin https://github.com/JMRMEDEV/cairel-cli.git
git branch -M main
git push -u origin main
```

### 2. Create Git Tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
git push origin v1.0.0
```

### 3. npm Login

```bash
npm login
# Enter credentials
```

### 4. Publish to npm

```bash
# Final verification
npm run build
npm test

# Publish
npm publish

# Or for first-time publish with public access
npm publish --access public
```

### 5. Verify Publication

```bash
# Check on npm
npm view cairel

# Test installation
npm install -g cairel
cairel --version
cairel --help
```

### 6. Post-Publication

- [ ] Create GitHub Release with changelog
- [ ] Update README badges (npm version, downloads)
- [ ] Share on social media / dev communities
- [ ] Monitor issues and feedback

---

## Rollback Plan

If issues are discovered after publication:

```bash
# Unpublish within 72 hours (if critical issue)
npm unpublish cairel@1.0.0

# Or deprecate and publish patch
npm deprecate cairel@1.0.0 "Critical bug, use 1.0.1"
npm version patch
npm publish
```

---

## Version Strategy

Following semantic versioning:
- **1.0.x** - Bug fixes, documentation updates
- **1.x.0** - New rules, minor features (backward compatible)
- **x.0.0** - Breaking changes (rule format changes, CLI changes)

---

## Notes

- Package name `cairel` is available on npm (verified)
- MIT License allows commercial and private use
- All 22 rules are project-agnostic and tested
- CLI works with both kiro-cli and Amazon Q Developer
