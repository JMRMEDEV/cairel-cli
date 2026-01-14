---
meta:
  id: "eslint-configuration"
  title: "ESLint Configuration & Compliance"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "general"
  tags: ["eslint", "linting", "code-quality", "typescript"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
  conditions:
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

### ESLint Workflow

```bash
# Check for errors
npm run lint
# or
yarn lint
# or
npx eslint .

# Auto-fix when possible
npm run lint -- --fix
# or
yarn lint --fix
```

### When to Run ESLint

**Run after:**
- Creating new files
- Modifying existing files
- Before git commit
- Before pull request

### Common ESLint Rules

**Typical violations:**
- Unused variables
- Missing semicolons
- Inconsistent quotes
- Trailing whitespace
- Missing return types (TypeScript)

---

## ✅ Checklist

Before committing code:

- [ ] Ran ESLint check
- [ ] Fixed all errors
- [ ] Fixed all warnings (if possible)
- [ ] Code passes linting

After creating/modifying files:

- [ ] Run ESLint immediately
- [ ] Fix issues before continuing
- [ ] Don't accumulate technical debt

---

## 🔍 Examples

### ✅ Good: ESLint Compliance

```bash
# Create file
touch src/utils/helper.ts

# Write code
# ...

# Check ESLint immediately
npm run lint

# Fix any issues
npm run lint -- --fix

# Verify clean
npm run lint
# ✓ No errors found
```

### ❌ Bad: Ignoring ESLint

```bash
# Create multiple files
touch file1.ts file2.ts file3.ts

# Write code in all files
# ...

# Commit without checking
git add .
git commit -m "Add files"

# Later discover 20+ ESLint errors
```

---

## 🚫 Common Mistakes

### Mistake 1: Not Running ESLint

**Problem**: Accumulating linting errors

**Solution**: Run ESLint after every file change

### Mistake 2: Ignoring Warnings

**Problem**: Warnings become errors later

**Solution**: Fix warnings when possible

### Mistake 3: Using eslint-disable

**Problem**: Disabling rules without good reason

**Solution**: Fix the issue, don't disable the rule

---

## 🤖 AI Self-Check Protocol

**After creating/modifying any file:**

1. Did I run ESLint?
   - If NO → Run now
   - If YES → Continue

2. Are there errors?
   - If YES → Fix immediately
   - If NO → Continue

3. Are there warnings?
   - If YES → Fix if possible
   - If NO → Good to go

**Before git commit:**

1. Run ESLint on all changed files
2. Fix all errors
3. Fix warnings if possible
4. Verify clean lint
5. Then commit
