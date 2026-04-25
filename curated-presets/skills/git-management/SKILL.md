---
name: git-management
description: Manage git operations safely with human review for commits and protection against destructive commands. Use when committing, pushing, branching, or performing any git operations. Enforces human approval before pushes, blocks force operations without confirmation, and requires pulling base branch before creating new branches.
metadata:
  cairel-title: "Git Repository Management"
  cairel-category: git
  cairel-version: "1.1.0"
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

### 2. Commit Message Standards

**All commit messages MUST be ≤ 50 characters.** Imperative mood, concise, descriptive.

**No commit message body.** Most teams rarely use commit bodies, and they add noise. Write only the subject line. If the user explicitly requests a body, then include one.

> **Conventional Commits**: If the project has the `conventional-commits` skill enabled, commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format instead. The 50-char limit applies to the `<type>[scope]: <description>` line. See the `conventional-commits` skill for full details.

### 3. Never Push Without Explicit Request

**NEVER push to remote unless the human explicitly asks to push.** After a successful commit, do NOT automatically push. Wait for the human to say "push", "push it", "push to remote", or similar.

```
✓ Committed: "Add JWT authentication logic"

Note: Changes are committed locally. Let me know if you'd like to push.
```

### 4. Never Use --force or --force-with-lease Without Confirmation

**NEVER execute `git push --force`, `git push --force-with-lease`, or any force-push variant without explicitly requesting confirmation first.** These are destructive operations that rewrite remote history.

Before executing, AI MUST:
1. Explain what the force push will do
2. Warn about potential consequences (overwriting others' work, lost commits)
3. Wait for explicit "yes" confirmation

```
⚠️  You're requesting a force push to origin/feature-branch.

This will OVERWRITE the remote branch history. If others have pulled
from this branch, their local copies will diverge.

Command: git push --force-with-lease origin feature-branch

Proceed? (y/n)
```

### 5. Pull Base Branch Before Creating New Branches

**ALWAYS pull the latest changes from the base branch before creating a new branch.** This prevents working on stale code and reduces merge conflicts.

```bash
# Before creating a new branch:
git checkout main          # (or the base branch)
git pull origin main       # Pull latest changes
git checkout -b feature/x  # Now create the new branch
```

AI MUST follow this sequence every time a new branch is requested. If the human specifies a different base branch, pull that branch instead.

---

## ✅ Checklist

- [ ] Identified correct repository
- [ ] Checked `git status`
- [ ] Commit message ≤ 50 characters (or follows conventional commits if enabled)
- [ ] Showed human the review format before committing
- [ ] Received explicit approval before committing
- [ ] Did NOT auto-push after commit — waited for explicit push request
- [ ] No `--force` or `--force-with-lease` used without confirmation
- [ ] Pulled base branch before creating any new branch

---

## 🤖 AI Self-Check Protocol

```
Git Commit → Correct repo? → Show review → Approved?
├─ YES → Execute commit → STOP (do NOT push unless asked)
└─ NO → Stop, ask for changes

Push Requested → Is it a force push?
├─ YES → Warn about consequences → Confirmed? → Execute
└─ NO → Show push details → Approved? → Push

New Branch Requested → Pull base branch first → Create branch
```
