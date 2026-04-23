---
name: typescript-validation
description: Validate TypeScript compilation after every file change to catch errors early. Use when creating or modifying .ts/.tsx files. Mandates running npx tsc --noEmit and fixing all errors before proceeding.
metadata:
  cairel-category: typescript
  cairel-version: "1.0.0"
  cairel-tags:
    - typescript
    - validation
    - compilation
    - type-safety
  cairel-conditions:
    languages:
      - typescript
---

# TypeScript Compilation Validation

**Purpose**: Prevent TypeScript error accumulation by validating compilation after every code change.

**Applies To**: TypeScript projects

---

## 🚨 Critical Rules

### 1. Validate After EVERY TypeScript File Change

```bash
# MANDATORY after every .ts/.tsx change
npx tsc --noEmit
```

**Never accumulate TypeScript errors. Fix them immediately.**

### 2. Stop and Fix Errors Immediately

1. STOP adding new code
2. Fix ALL TypeScript errors before proceeding
3. Re-run `npx tsc --noEmit` to verify fixes
4. Only after clean compilation, continue

### 3. Component Creation Validation

**Validate after main component before creating subcomponents to prevent cascading errors.**

---

## ✅ Checklist

- [ ] `npx tsc --noEmit` returns exit code 0
- [ ] No TypeScript errors in output
- [ ] All imports use correct paths
- [ ] All interfaces are properly implemented

---

## 🤖 AI Self-Check Protocol

```
Create/Modify .ts file
  ↓
Run: npx tsc --noEmit
  ↓
Errors? → YES → Fix errors → Re-validate
  ↓ NO
Proceed to next file/feature
```
