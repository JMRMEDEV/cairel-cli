---
meta:
  id: "multi-environment-management"
  title: "Multi-Environment Management & Protection"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "backend"
  tags: ["environment", "security", "env-vars", "production-protection"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
  conditions:
    requires-env-vars: true
---

# Multi-Environment Management & Protection

**Purpose**: Ensure safe environment management across dev, qa, and prod with strict production protection.

**Applies To**: All projects using environment variables

---

## 🚨 Critical Rules

### 1. AI MUST NEVER Access Production

**FORBIDDEN without exception:**
- ❌ Read any file containing "prod" or "production"
- ❌ Read production environment variables
- ❌ Modify production configuration
- ❌ Access production credentials
- ❌ Execute commands against production

**Forbidden Patterns:**
- `.env.prod`, `.env.production`
- `prod.env`, `production.env`
- `.docker-env.prod`
- Any file with `*prod*` pattern

### 2. Supported Environments

**Development (dev)** - ✅ Full AI access
**Quality Assurance (qa)** - ✅ AI access allowed
**Production (prod)** - ❌ NO AI access (human-only)

### 3. Environment File Naming

**✅ AI-Accessible:**
- `.env.dev`, `.docker-env.dev`, `dev.env`
- `.env.qa`, `.docker-env.qa`, `qa.env`
- `.env.example` (template only)

**❌ AI-Forbidden:**
- `.env.prod`, `.env.production`
- `prod.env`, `production.env`
- `.env` (might be production)

---

## 📋 Standard Rules

### Agent Configuration

**Allowed Paths:**
```json
[
  "./**/*.env.dev",
  "./**/*.env.qa",
  "./**/dev.env",
  "./**/qa.env",
  "./**/.docker-env.dev",
  "./**/.docker-env.qa",
  "./**/.env.example"
]
```

**Denied Paths:**
```json
[
  "./**/.env",
  "./**/.env.prod",
  "./**/.env.production",
  "./**/prod.env",
  "./**/production.env",
  "./**/.docker-env.prod",
  "./**/.docker-env.production"
]
```

### Git Protection

**NEVER commit environment files (except .example):**

```gitignore
# Environment files (NEVER COMMIT)
.env
.env.*
!.env.example
.docker-env
.docker-env.*
!.docker-env.example

# Explicit production protection
*.prod
*.production
```

---

## ✅ Checklist

Before accessing ANY environment file:

- [ ] Does filename contain "prod"? → If YES, STOP
- [ ] Is this `.env` without suffix? → If YES, STOP (might be prod)
- [ ] Is this explicitly `.env.dev` or `.env.qa`? → If YES, safe
- [ ] Am I modifying environment? → If YES, show human first

Before committing ANY file:

- [ ] Is this an environment file? → If YES and NOT .example, STOP
- [ ] Only `.env.example` files should be committed

---

## 🔍 Examples

### ✅ Good: Safe Environment Access

```bash
# Read dev environment
cat .env.dev

# Read QA environment
cat .env.qa

# Copy example template
cp .env.example .env.dev
```

### ❌ Bad: Forbidden Access

```bash
# WRONG - production file
cat .env.prod

# WRONG - might be production
cat .env

# WRONG - committing environment file
git add .env.dev
```

---

## 🚫 Common Mistakes

### Mistake 1: Reading Default .env

**Problem**: `.env` might contain production config

**Solution**: Always use explicit `.env.dev` or `.env.qa`

### Mistake 2: Committing Environment Files

**Problem**: Committing `.env.dev` or `.env.qa`

**Solution**: Only commit `.env.example` templates

### Mistake 3: Wildcard Access

**Problem**: `allowedPaths: ["./**/.env*"]` includes production

**Solution**: Explicitly list dev and qa patterns only

---

## 🤖 AI Self-Check Protocol

**Before accessing environment file:**

```
Does filename contain "prod"?
        ↓ YES → STOP, refuse access
        ↓ NO
        ↓
Is this .env without suffix?
        ↓ YES → STOP, might be production
        ↓ NO
        ↓
Is this .env.dev or .env.qa?
        ↓ YES → Safe to access
        ↓ NO → Ask human
```
