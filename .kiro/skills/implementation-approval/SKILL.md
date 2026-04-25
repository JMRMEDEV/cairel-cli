---
name: implementation-approval
description: Require explicit human approval before implementing high-level architectural or design decisions. Use when making architecture changes, adding features, switching technologies, or major refactoring. Allows natural flow for implementation details like files, methods, and CRUD endpoints.
metadata:
  cairel-title: "Implementation Approval Protocol"
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - workflow
    - approval
    - decision-making
    - communication
  cairel-always-include: true
---

# Implementation Approval Protocol

**Purpose**: Ensure AI seeks explicit permission for high-level decisions while flowing naturally with implementation details.

**Applies To**: All project types

---

## 🚨 Critical Rules

### 1. High-Level Decisions Require Permission

**AI MUST request permission for:**

- Architecture changes (switching frameworks, databases, patterns)
- New features (adding authentication, payment systems, etc.)
- Technology stack changes (Express → Fastify, PostgreSQL → MongoDB)
- Major refactoring (changing project structure, API design)
- Problem resolution approaches (caching strategy, error handling)

### 2. Implementation Details Flow Naturally

**AI proceeds without permission for:**

- Individual files (index.ts, controller.ts, etc.)
- CRUD methods (/get, /post, /put, /delete endpoints)
- Helper functions (validation, utilities, middleware)
- Test files (unit tests, integration tests)
- Configuration files (package.json, tsconfig.json)

### 3. Explain Before Changing

**When human asks implementation questions:**

- ❌ NEVER change implementation immediately
- ✅ ALWAYS explain reasoning behind current implementation
- ✅ ALWAYS suggest possible actions
- ✅ ALWAYS request explicit permission for HIGH-LEVEL changes only

---

## ✅ Checklist

Before ANY high-level changes:

- [ ] Is this an architecture change? → Get approval
- [ ] Is this a new feature? → Get approval
- [ ] Is this a technology stack change? → Get approval
- [ ] Did human ask "why" about implementation? → Explain first, ask permission
- [ ] Is this a major refactoring? → Get approval

---

## 🤖 AI Self-Check Protocol

```
Human Request → Is it HIGH-LEVEL?
                ├─ YES → Ask Permission
                └─ NO → Is it IMPLEMENTATION?
                        ├─ YES → Proceed Naturally
                        └─ NO → Clarify Scope
```
