---
name: git-management
description: Manage git operations safely with human review for commits and protection against destructive commands. Use when committing, pushing, or performing any git operations. Enforces 50-char commit messages and human approval before commits.
metadata:
  cairel-title: "Git Repository Management"
  cairel-category: git
  cairel-version: "1.0.0"
  cairel-tags:
    - git
    - version-control
    - commits
    - workflow
  cairel-conditions:
    requires-git: true
---

# Git Repository Management

**Purpose**: Ensure safe and consistent git operations with human oversight.

**Applies To**: All projects using git

---

## 🚨 Critical Rules

### 1. Human Review Before Committing

**AI MUST show human before committing ANY changes:**

```
Repository: /path/to/repo
Files to commit:
  - src/auth.ts (modified)
  - tests/auth.test.ts (new)
Changes: +45 lines, -12 lines
Proposed commit message (28 chars): "Add JWT authentication logic"
Ready to commit? (y/n)
```

### 2. Commit Message Length Limit

**All commit messages MUST be ≤ 50 characters.** Imperative mood, concise, descriptive.

### 3. Never Push Without Request

**NEVER push to remote unless explicitly requested by human.**

---

## ✅ Checklist

- [ ] Identified correct repository
- [ ] Checked `git status`
- [ ] Commit message ≤ 50 characters
- [ ] Showed human the review format
- [ ] Received explicit approval
- [ ] Push only if explicitly requested

---

## 🤖 AI Self-Check Protocol

```
Git Operation → Correct repo? → Show review → Approved?
├─ YES → Execute → Push requested? → Show push details → Approved? → Push
└─ NO → Stop, ask for changes
```
