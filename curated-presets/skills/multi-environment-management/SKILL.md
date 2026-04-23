---
name: multi-environment-management
description: Protect production environment files while allowing safe access to dev and QA configurations. Use when accessing environment variables, .env files, or configuring multi-environment setups. Blocks all production file access.
metadata:
  cairel-title: "Multi-Environment Management & Protection"
  cairel-category: backend
  cairel-version: "1.0.0"
  cairel-tags:
    - environment
    - security
    - env-vars
    - production-protection
  cairel-conditions:
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
- ❌ Modify production configuration
- ❌ Access production credentials

**Forbidden Patterns:** `.env.prod`, `.env.production`, `prod.env`, `production.env`

### 2. Supported Environments

- **Development (dev)** - ✅ Full AI access
- **Quality Assurance (qa)** - ✅ AI access allowed
- **Production (prod)** - ❌ NO AI access (human-only)

### 3. AI-Accessible Files

✅ `.env.dev`, `.env.qa`, `dev.env`, `qa.env`, `.env.example`

❌ `.env`, `.env.prod`, `.env.production`, `prod.env`

---

## ✅ Checklist

- [ ] Does filename contain "prod"? → STOP
- [ ] Is this `.env` without suffix? → STOP (might be prod)
- [ ] Is this explicitly `.env.dev` or `.env.qa`? → Safe
- [ ] Only `.env.example` files should be committed

---

## 🤖 AI Self-Check Protocol

```
Access env file → Contains "prod"? → STOP
  ↓ NO
Is .env without suffix? → STOP (might be production)
  ↓ NO
Is .env.dev or .env.qa? → Safe to access
```
