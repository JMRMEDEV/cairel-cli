# Ordaiv Curated Rules

This directory contains standardized, project-agnostic rules for AI-driven development.

## Rule Categories

### General
- **context-retrieval.md** - Efficient context loading and token optimization
- **implementation-approval.md** - Permission protocol for high-level decisions
- **package-manager-safety.md** - Safe package management practices

### TypeScript
- **typescript-validation.md** - TypeScript compilation validation workflow
- **component-structure.md** - Component organization and structure patterns

### Git
- **git-management.md** - Git repository management and commit standards

### UI
- **visual-verification.md** - Visual verification for UI changes

## Rule Format

All rules follow this standardized format:

```markdown
---
meta:
  id: "rule-id"
  title: "Rule Title"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "category-name"
  tags: ["tag1", "tag2"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "YYYY-MM-DD"
---

# Rule Title

**Purpose**: One-line description

**Applies To**: Project types

---

## 🚨 Critical Rules
[Most important rules]

## 📋 Standard Rules
[Regular rules]

## ✅ Checklist
[Actionable items]

## 🔍 Examples
[Good and bad examples]

## 🚫 Common Mistakes
[Frequent errors]

## 🤖 AI Self-Check Protocol
[Decision trees and workflows]
```

## Validation

Rules are validated against:
- Required frontmatter fields
- Mandatory sections presence
- Character limits
- Valid categories and tags

## Usage in Ordaiv

These rules are used as templates during `ordaiv init`:
1. User selects project type and options
2. Ordaiv filters relevant rules
3. Rules are copied to `.kiro/steering/` or `.amazonq/rules/`
4. Handlebars templates customize project-specific details
