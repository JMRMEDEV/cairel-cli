---
name: test-cleanup-protocol
description: Manage temporary test files created for validation without polluting the repository. Use when creating ad-hoc test scripts, validating fixes, or running one-off validation. Covers cleanup of test files and reverting path modifications.
metadata:
  cairel-title: "Temporary Test File Cleanup Protocol"
  cairel-category: testing
  cairel-version: "1.0.0"
  cairel-tags:
    - testing
    - cleanup
    - temporary-files
    - library
  cairel-conditions:
    project-types:
      - library
      - cli
---

# Temporary Test File Cleanup Protocol

**Purpose**: Manage temporary test files created for validation without polluting the repository.

**Applies To**: Library and CLI projects

---

## 🚨 Critical Rules

### Rule 1: Remove All Temporary Test Files Before Commit

**You MUST remove any test files you created for validation before completing the task.**

### Rule 2: Revert Test-Specific Path Changes

**If you modified import/require paths for testing, you MUST revert them.**

---

## 📋 Standard Rules

### Naming Conventions

- Prefix with `test_`, `validate_`, or `check_`
- Use descriptive names: `test_new_parser.lua`, `validate_api_fix.py`

### Cleanup Process

1. Remove test files: `rm test_*.lua validate_*.py`
2. Revert path modifications
3. Verify: `git status` should show no test files

---

## ✅ Checklist

### After Testing (Before Commit)

- [ ] Remove all temporary test files
- [ ] Revert all path modifications
- [ ] Verify production paths work
- [ ] Check `git status` for cleanliness
- [ ] No test artifacts remaining
