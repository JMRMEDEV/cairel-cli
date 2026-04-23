---
name: context-retrieval
description: Minimize token usage through efficient context loading. Use when reading documentation, starting sessions, or loading project files. Covers index-first reading, targeted line ranges, and priority-based section loading.
metadata:
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - context
    - optimization
    - efficiency
    - token-management
  cairel-always-include: true
---

# Context Retrieval & Token Optimization

**Purpose**: Minimize token usage while maintaining full project understanding through efficient context loading strategies.

**Applies To**: All project types

---

## 🚨 Critical Rules

### 1. Always Read Index Files First

**NEVER read full documentation files without checking for index files first.**

- Look for `*-INDEX.md`, `INDEX.md`, or navigation tables at file start
- Read index files to understand structure before reading content
- Use line numbers from indices for targeted reads
- **Token Savings**: 80-90% compared to reading full files

### 2. Use Line Numbers for Targeted Reads

**NEVER read entire files when you need specific sections.**

```typescript
// ✅ CORRECT - Targeted read
fs_read({
  mode: "Line",
  path: "docs/api.md",
  start_line: 100,
  end_line: 150
})

// ❌ WRONG - Reading full file
fs_read({
  mode: "Line",
  path: "docs/api.md"
})
```

### 3. Respect Priority Levels

**Read sections based on priority markers:**

- **CRITICAL**: Always read (security, privacy, compliance)
- **HIGH**: Read when relevant to current work
- **MEDIUM**: Read when making related decisions
- **LOW**: Read only if specifically needed

---

## 📋 Standard Rules

### Session Start Protocol

**Minimal context loading at session start:**

1. Read index files or navigation tables (~150-200 tokens)
2. Read "Current Status" section (~50-100 tokens)
3. Read "Session Context" or "Overview" (~100-150 tokens)

**Total Budget**: 300-400 tokens (vs 2000-3000+ for all files)

### Search Strategy

**Use search mode for specific features:**

```typescript
fs_read({
  mode: "Search",
  path: "docs/features.md",
  pattern: "authentication",
  context_lines: 5
})
```

---

## ✅ Checklist

Before reading any documentation:

- [ ] Checked for index files or navigation tables
- [ ] Identified priority level of needed information
- [ ] Determined minimum sections needed
- [ ] Using line numbers for targeted reads
- [ ] Avoiding reading low-priority sections

---

## 📊 Token Budget Guidelines

| Activity | Budget | What to Read |
|----------|--------|--------------|
| Session Start | 300-400 | Index files, current status, overview |
| Active Development | 500-700 | Session start + current phase details |
| New Phase | 700-900 | Session start + previous phase + next phase |
| Maximum | 1500 | Only when absolutely necessary |

---

## 🤖 AI Self-Check Protocol

**Before starting any task:**

1. Have I read the index files?
2. Do I know the current project state?
3. Do I understand the immediate goal?
4. Am I reading the minimum necessary?
