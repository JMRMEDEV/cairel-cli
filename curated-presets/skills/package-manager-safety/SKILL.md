---
name: package-manager-safety
description: Prevent destructive package operations by blocking --force flags and requiring human approval. Use when running npm, yarn, or pnpm commands, installing packages, or executing tests. Enforces non-interactive test execution and lock file safety.
metadata:
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - package-manager
    - safety
    - npm
    - yarn
    - pnpm
  cairel-conditions:
    languages:
      - typescript
      - javascript
---

# Package Manager Safety & Standards

**Purpose**: Prevent destructive operations and maintain consistent package management practices.

**Applies To**: All Node.js/JavaScript/TypeScript projects

---

## 🚨 Critical Rules

### 1. NEVER Use --force Flag Without Permission

**FORBIDDEN without explicit user consent:**

```bash
# ❌ NEVER do this without permission
npm install --force
yarn add package --force
firebase deploy --force
any-command --force
```

**REQUIRED before using --force:**

1. Explain what --force does
2. Explain the risks and consequences
3. Request explicit permission
4. Wait for confirmation

### 2. Respect Project's Package Manager

**Detect and use the project's chosen package manager:**

```bash
# Check for lock files
if [ -f "yarn.lock" ]; then
  # Use yarn
elif [ -f "pnpm-lock.yaml" ]; then
  # Use pnpm
elif [ -f "package-lock.json" ]; then
  # Use npm
fi
```

**Never mix package managers in the same project.**

### 3. Non-Interactive Test Execution

**All test commands MUST be non-interactive:**

```bash
# ✅ Correct
npm test -- --watchAll=false
yarn test --watchAll=false

# ❌ Wrong
npm test  # Might start watch mode
```

---

## ✅ Checklist

- [ ] Detected project's package manager (check lock files)
- [ ] Using correct package manager for project
- [ ] Not mixing package managers
- [ ] Tests are non-interactive
- [ ] No --force flags without explicit permission

---

## 🤖 AI Self-Check Protocol

```
Need --force flag?
  ↓ YES → Explain risks → Request permission → Approved? → Execute
  ↓ NO → Proceed normally
```
