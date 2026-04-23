---
name: eslint-configuration
description: Enforce code quality through ESLint compliance. Use when creating or modifying JavaScript/TypeScript files, before committing code, or when linting issues arise. Covers running ESLint, auto-fixing, and avoiding eslint-disable.
metadata:
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - eslint
    - linting
    - code-quality
    - typescript
  cairel-conditions:
    linter:
      - eslint
---

# ESLint Configuration & Compliance

**Purpose**: Maintain code quality through ESLint compliance.

**Applies To**: JavaScript/TypeScript projects using ESLint

---

## 🚨 Critical Rules

### 1. Run ESLint Before Committing

**ALWAYS run ESLint check before git operations.**

### 2. Fix ESLint Errors Immediately

**NEVER accumulate ESLint errors. Fix them as they occur.**

---

## 📋 Standard Rules

```bash
# Check for errors
npm run lint

# Auto-fix when possible
npm run lint -- --fix
```

**Run after:** Creating new files, modifying existing files, before git commit, before pull request.

---

## ✅ Checklist

- [ ] Ran ESLint check
- [ ] Fixed all errors
- [ ] Fixed all warnings (if possible)
- [ ] Code passes linting

---

## 🤖 AI Self-Check Protocol

After creating/modifying any file:
1. Run ESLint → Errors? Fix immediately → Re-check
2. Before git commit: lint all changed files, fix all errors
