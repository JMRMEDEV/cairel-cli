---
name: package-json-management
description: Manage package.json dependencies, scripts, and metadata with best practices. Use when adding, removing, or updating npm packages, organizing dependencies, or auditing unused packages.
metadata:
  cairel-title: "Package.json Management & Dependencies"
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - package-json
    - dependencies
    - npm
    - versioning
  cairel-conditions:
    languages:
      - typescript
      - javascript
---

# Package.json Management & Dependencies

**Purpose**: Maintain clean, organized package.json with proper dependency management.

**Applies To**: Node.js/JavaScript/TypeScript projects

---

## 🚨 Critical Rules

### 1. Use Package Manager Commands

**Use package manager commands for adding/removing dependencies, not manual edits.**

### 2. Keep Dependencies Organized

**Separate dependencies, devDependencies, and peerDependencies correctly.**

---

## 📋 Standard Rules

### Dependency Types

- **dependencies**: Required for production
- **devDependencies**: Only needed for development (`-D` flag)
- **peerDependencies**: Expected to be provided by consumer

### Version Constraints

- `^` for minor updates (recommended)
- `~` for patch updates
- Exact only when necessary

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

---

## ✅ Checklist

- [ ] Used package manager commands (not manual edits)
- [ ] Correct dependency type (prod vs dev)
- [ ] Version constraints appropriate
- [ ] Lock file updated
- [ ] No unused dependencies

---

## 🤖 AI Self-Check Protocol

1. Production or development? → Choose correct section
2. Version constraint? → `^` for minor (default)
3. Package manager command used? → Never manual edits
4. Lock file updated? → Verify after changes
