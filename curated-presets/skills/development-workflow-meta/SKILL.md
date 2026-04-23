---
name: development-workflow-meta
description: Systematic rule application based on development context for consistent code quality. Use when starting any development task to identify which rules and skills apply to the current work context (UI, services, testing, documentation).
metadata:
  cairel-title: "Development Workflow and Rule Application"
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - workflow
    - meta
    - rules
    - development
  cairel-conditions:
    project-types:
      - ui
      - backend
      - cli
      - library
      - fullstack
---

# Development Workflow and Rule Application

**Purpose**: Guide systematic rule application based on development context to ensure consistent code quality.

**Applies To**: All projects with multiple steering rules

---

## 🚨 Critical Rules

### Rule 1: Apply Relevant Rules Based on Context

**Before starting any development task, identify which rules apply to your current work.**

### Rule 2: Never Skip Critical Rules

**Some rules are critical and must NEVER be skipped:**
- Visual verification for UI changes
- TypeScript compilation checks
- Implementation approval for breaking changes
- Package manager safety

---

## 📊 Rule Application Matrix

| Context | Critical Rules | Standard Rules |
|---------|---------------|----------------|
| UI Components | Visual verification, TypeScript | Component structure, Props patterns, Imports |
| Services/API | TypeScript validation | Imports, Error handling, Env management |
| Package Management | Package manager safety | Package.json management, Versioning |
| Testing | Test cleanup protocol | TypeScript validation |
| Documentation | Markdown maintenance | Context retrieval |
| Git Operations | Git management | Implementation approval |

---

## ✅ Checklist

### Before Starting Development

- [ ] Identify development context (UI/services/testing/etc.)
- [ ] Review applicable rules for this context
- [ ] Note any critical rules that must be followed

### After Implementation

- [ ] Run TypeScript validation (if applicable)
- [ ] Perform visual verification (for UI changes)
- [ ] Confirm all applicable rules followed
- [ ] Clean up temporary files (if created)

---

## 🤖 AI Self-Check Protocol

1. What am I building? (UI/Service/Test/Docs)
2. Which rules apply to this context? (check matrix)
3. What are the critical rules I must follow?
4. After completion: did I apply all applicable rules?
