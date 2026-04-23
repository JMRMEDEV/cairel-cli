---
name: semantic-versioning
description: Follow semantic versioning standards for package version management. Use when implementing features, fixing bugs, or making breaking changes. Covers MAJOR.MINOR.PATCH increments and version reset rules.
metadata:
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - versioning
    - package.json
    - semver
  cairel-conditions:
    versioning-strategy:
      - semantic
---

# Semantic Versioning for Package Management

**Purpose**: Maintain consistent version increments following semantic versioning standards.

**Applies To**: Node.js/JavaScript/TypeScript projects with package.json

---

## 🚨 Critical Rules

### 1. MANDATORY Version Increment

**EVERY feature or bugfix MUST increment the `version` in `package.json`.**

### 2. Semantic Versioning Format

**Format**: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR** (1.x.x) - Incompatible API changes
- **MINOR** (x.2.x) - Backward-compatible functionality
- **PATCH** (x.x.3) - Backward-compatible bug fixes

---

## ✅ Checklist

- [ ] Assessed change type (MAJOR/MINOR/PATCH)
- [ ] Read current version from package.json
- [ ] Determined new version number
- [ ] Will update package.json with new version
- [ ] Reset lower version numbers to 0 when incrementing higher levels

---

## 🤖 AI Self-Check Protocol

1. What type of change? Breaking → MAJOR, Feature → MINOR, Fix → PATCH
2. What is current version? Read from package.json
3. Calculate new version, reset lower numbers if needed
4. Update package.json
