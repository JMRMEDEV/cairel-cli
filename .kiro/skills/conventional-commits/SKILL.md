---
name: conventional-commits
description: Enforce Conventional Commits specification for all git commit messages. Use when committing changes to ensure messages follow the type(scope) description format. Supports feat, fix, docs, style, refactor, perf, test, build, ci, chore, and revert types with optional scope and breaking change indicators.
metadata:
  cairel-title: "Conventional Commits"
  cairel-category: git
  cairel-version: "1.0.0"
  cairel-tags:
    - git
    - commits
    - conventional-commits
    - changelog
    - semver
  cairel-conditions:
    requires-git: true
---

# Conventional Commits

**Purpose**: Enforce structured commit messages following the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

**Applies To**: All projects using git that opt into conventional commits

---

## 🚨 Critical Rules

### 1. Commit Message Format

Every commit message MUST follow this structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The first line (`<type>[scope]: <description>`) MUST be ≤ 50 characters.

### 2. Required Types

| Type | When to Use | SemVer Impact |
|------|-------------|---------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |

### 3. Optional Types

These are recommended but not mandated by the spec:

| Type | When to Use |
|------|-------------|
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance tasks |
| `revert` | Reverting a previous commit |

### 4. Breaking Changes

Breaking changes MUST be indicated by either:
- A `!` after the type/scope: `feat!: remove deprecated API`
- A `BREAKING CHANGE:` footer in the commit body

```
feat(api)!: change authentication endpoint

BREAKING CHANGE: /auth/login now requires email instead of username
```

### 5. Scope

An optional noun in parentheses describing the section of the codebase:

```
feat(auth): add JWT token refresh
fix(parser): handle empty input arrays
docs(readme): update installation steps
```

---

## 🔍 Examples

**Good:**
```
feat: add user registration flow
fix(auth): prevent token expiry race
docs: update API reference
refactor: extract validation logic
feat!: drop Node 14 support
```

**Bad:**
```
updated stuff                    # No type, vague
Feature: add login               # Wrong casing
feat add search                  # Missing colon
fix(): remove bug                # Empty scope
```

---

## ✅ Checklist

- [ ] Commit message starts with a valid type
- [ ] Colon and space after type/scope: `type: ` or `type(scope): `
- [ ] First line ≤ 50 characters
- [ ] Description uses imperative mood ("add" not "added")
- [ ] Breaking changes marked with `!` or `BREAKING CHANGE:` footer
- [ ] Scope is a meaningful noun (if used)

---

## 🤖 AI Self-Check Protocol

```
Composing Commit Message:
1. Determine type from changes (feat/fix/docs/refactor/etc.)
2. Identify scope if changes are localized to a module
3. Is it a breaking change? → Add ! or BREAKING CHANGE footer
4. Write description in imperative mood, ≤ 50 chars total first line
5. Add body if changes need explanation
6. Show to human for approval (per git-management skill)
```
