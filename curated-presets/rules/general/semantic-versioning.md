---
meta:
  id: "semantic-versioning"
  title: "Semantic Versioning for Package Management"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "general"
  tags: ["versioning", "package.json", "semver"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# Semantic Versioning for Package Management

**Purpose**: Maintain consistent version increments following semantic versioning standards.

**Applies To**: Node.js/JavaScript/TypeScript projects with package.json

---

## 🚨 Critical Rules

### 1. MANDATORY Version Increment

**EVERY feature or bugfix MUST increment the `version` in `package.json`.**

No exceptions. Version must be updated as part of implementation.

### 2. Semantic Versioning Format

**Format**: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR** (1.x.x) - Incompatible API changes
- **MINOR** (x.2.x) - Backward-compatible functionality
- **PATCH** (x.x.3) - Backward-compatible bug fixes

---

## 📋 Standard Rules

### MAJOR Version (X.0.0)

**Increment when making incompatible API changes:**

- Breaking changes to component interfaces
- Removing or renaming props, methods, exports
- Changing method signatures
- Modifying state structure incompatibly
- Removing routes or changing route behavior

### MINOR Version (X.Y.0)

**Increment when adding backward-compatible functionality:**

- Adding new components, pages, features
- Adding new optional props
- Adding new methods without changing existing ones
- Adding new state slices
- Adding new routes
- Adding new utility functions

### PATCH Version (X.Y.Z)

**Increment when making backward-compatible bug fixes:**

- Fixing component behavior without changing interfaces
- Correcting styling or visual issues
- Fixing method implementations
- Resolving compilation errors
- Performance improvements without API changes

---

## ✅ Checklist

Before implementing any change:

- [ ] Assessed change type (MAJOR/MINOR/PATCH)
- [ ] Read current version from package.json
- [ ] Determined new version number
- [ ] Will update package.json with new version
- [ ] Reset lower version numbers to 0 when incrementing higher levels

---

## 🔍 Examples

### ✅ Good: Proper Version Increments

```json
// Current: "1.2.3"

// Adding new feature → MINOR
"version": "1.3.0"

// Bug fix → PATCH
"version": "1.2.4"

// Breaking change → MAJOR
"version": "2.0.0"
```

### Version Reset Rules

```json
// MAJOR increment resets MINOR and PATCH
"1.5.8" → "2.0.0"

// MINOR increment resets PATCH
"1.5.8" → "1.6.0"

// PATCH increment only
"1.5.8" → "1.5.9"
```

---

## 🚫 Common Mistakes

### Mistake 1: Forgetting to Increment

**Problem**: Implementing changes without updating version

**Solution**: Always update package.json version

### Mistake 2: Wrong Increment Type

**Problem**: Using PATCH for new features or MAJOR for bug fixes

**Solution**: Follow semantic versioning rules strictly

### Mistake 3: Not Resetting Lower Numbers

**Problem**: `1.5.8` → `2.5.8` (should be `2.0.0`)

**Solution**: Reset MINOR and PATCH to 0 when incrementing MAJOR

---

## 🤖 AI Self-Check Protocol

**Before implementing any change:**

1. What type of change is this?
   - Breaking change → MAJOR
   - New feature → MINOR
   - Bug fix → PATCH

2. What is current version?
   - Read from package.json

3. What should new version be?
   - Apply increment rules
   - Reset lower numbers if needed

4. Update package.json
   - Modify version field
   - Include in commit
