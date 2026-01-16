# npm Publication Checklist

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
