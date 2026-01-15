# Cairel Curated Rules

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
  author: "cairel-core"
  version: "1.0.0"
  category: "category-name"
  tags: ["tag1", "tag2"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "YYYY-MM-DD"
  always-include: true  # Optional: always include this rule
  conditions:           # Optional: conditions for rule selection
    languages:
      - typescript
      - javascript
    frameworks:
      - react
      - next-js
    project-types:
      - ui
      - fullstack
    ui-library:
      - chakra-ui
    linter:
      - eslint
    versioning-strategy:
      - semantic
    requires-git: true
    requires-env-vars: true
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

## Conditions Field

The `conditions` field in frontmatter determines when a rule is included:

- **always-include**: Rule is always included (e.g., context-retrieval, implementation-approval)
- **languages**: Include if project uses one of these languages
- **frameworks**: Include if project uses one of these frameworks
- **project-types**: Include if project is one of these types
- **ui-library**: Include if project uses one of these UI libraries
- **linter**: Include if project uses one of these linters
- **versioning-strategy**: Include if project uses one of these versioning strategies
- **requires-git**: Include if project uses Git (true) or doesn't (false)
- **requires-env-vars**: Include if project uses environment variables (true) or doesn't (false)

**Note**: The manifest (`rules-manifest.json`) is auto-generated from frontmatter on build via `npm run generate-manifest`.

## Validation

Rules are validated against:
- Required frontmatter fields
- Mandatory sections presence
- Character limits
- Valid categories and tags

## Usage in Cairel

These rules are used as templates during `cairel init`:
1. User answers wizard questions
2. Cairel matches rules based on frontmatter conditions
3. Selected rules are copied to `.kiro/steering/` or `.amazonq/rules/`
4. Agent configuration is generated with appropriate settings
