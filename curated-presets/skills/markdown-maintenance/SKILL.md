---
name: markdown-maintenance
description: Maintain accurate line numbers and navigation in markdown files for efficient AI context retrieval. Use when creating or modifying .md documentation files, updating indices, or managing navigation tables.
metadata:
  cairel-title: "Markdown Maintenance for AI Context"
  cairel-category: general
  cairel-version: "1.0.0"
  cairel-tags:
    - documentation
    - markdown
    - ai-context
    - maintenance
  cairel-conditions:
    project-types:
      - ui
      - backend
      - cli
      - library
      - fullstack
---

# Markdown Maintenance for AI Context

**Purpose**: Ensure all .md files remain AI-friendly with accurate indices, line numbers, and navigation for efficient context retrieval.

**Applies To**: All projects with documentation

---

## 🚨 Critical Rules

### Rule 1: Update Indices After Every Modification

**Every time you create or modify a .md file, you MUST update its corresponding navigation and line numbers.**

### Rule 2: Never Make False Line Number Claims

**ALWAYS verify line numbers are accurate before referencing them.**

---

## 📋 Standard Rules

### When Creating New .md File

- Files < 100 lines: No index needed
- Files 100-300 lines: Add internal navigation table
- Files > 300 lines: Add internal navigation + consider separate index file

### When Modifying Existing .md File

1. Count lines after modification
2. Identify what changed (added/deleted content)
3. Update navigation table with new line numbers
4. Update section markers with new line ranges
5. Update corresponding index file (if exists)

---

## ✅ Checklist

- [ ] Navigation tables updated
- [ ] Section markers updated
- [ ] Index files updated (if exists)
- [ ] Line numbers verified accurate
- [ ] Links tested and working

---

## 🤖 AI Self-Check Protocol

1. Did I modify any .md files? → If yes, continue
2. How many lines did I add/remove? → Calculate shift
3. Did I update navigation table? → If no, update now
4. Are all line numbers accurate? → Verify with line counter
