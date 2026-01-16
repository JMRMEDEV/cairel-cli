# Contributing to Cairel

Thank you for your interest in contributing to Cairel! This document provides guidelines for contributing new rules, enhancements, and bug fixes.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Contributing New Rules](#contributing-new-rules)
- [Rule Format Requirements](#rule-format-requirements)
- [Adding New Categories](#adding-new-categories)
- [Testing Your Changes](#testing-your-changes)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

---

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Provide clear descriptions and reproduction steps
- Include relevant system information (OS, Node version, etc.)

### Suggesting Enhancements

- Open an issue with the `enhancement` label
- Describe the use case and expected behavior
- Explain why this enhancement would be useful

---

## Contributing New Rules

New rules are the most valuable contributions to Cairel! Here's how to add one:

### 1. Identify the Need

- Ensure the rule is **project-agnostic** (not specific to one project)
- Verify it's not already covered by existing rules
- Confirm it applies to a meaningful subset of projects

### 2. Choose the Right Category

Existing categories:
- `general` - Universal rules (all projects)
- `typescript` - TypeScript-specific rules
- `git` - Git workflow rules
- `ui` - UI/Frontend rules
- `backend` - Backend-specific rules
- `lua` - Lua language rules
- `testing` - Testing and QA rules

If your rule doesn't fit existing categories, see [Adding New Categories](#adding-new-categories).

### 3. Create the Rule File

**Location**: `curated-presets/rules/{category}/{rule-id}.md`

**Example**: `curated-presets/rules/typescript/my-new-rule.md`

---

## Rule Format Requirements

All rules MUST follow this standardized format:

### Frontmatter (Required)

```markdown
---
meta:
  id: "rule-id"                    # Kebab-case, unique identifier
  title: "Rule Title"              # Human-readable title
  author: "cairel-core"            # Use "cairel-core" for official rules
  version: "1.0.0"                 # Semantic versioning
  category: "general"              # Must match existing category
  tags: ["tag1", "tag2"]           # Relevant tags (min 1)
  ai-tools: ["kiro-cli", "amazon-q-developer"]  # Supported AI tools
  last-updated: "2026-01-16"       # YYYY-MM-DD format
  description: "Brief description (20-150 chars)"  # Required for validation
  always-include: false            # true = always included, false = conditional
  conditions:                      # Optional: when to include this rule
    languages:                     # Optional: specific languages
      - typescript
      - javascript
    frameworks:                    # Optional: specific frameworks
      - react
      - next-js
    project-types:                 # Optional: specific project types
      - ui
      - fullstack
    ui-library:                    # Optional: specific UI libraries
      - chakra-ui
    linter:                        # Optional: specific linters
      - eslint
    versioning-strategy:           # Optional: versioning strategies
      - semantic
    requires-git: true             # Optional: requires git
    requires-env-vars: true        # Optional: requires environment variables
---
```

### Content Structure (Required)

```markdown
# Rule Title

**Purpose**: One-line description (≤200 chars)

**Applies To**: Project types this rule applies to

---

## 🚨 Critical Rules

[Most important rules that must never be violated]

---

## 📋 Standard Rules

[Regular rules and best practices]

---

## ✅ Checklist

[Actionable checklist for AI to follow]

---

## 🔍 Examples

[Good and bad examples with explanations]

---

## 🚫 Common Mistakes

[Frequent errors and how to avoid them]

---

## 🤖 AI Self-Check Protocol

[Decision trees and workflows for AI to follow]
```

### Mandatory Sections

- `meta` (frontmatter)
- `Purpose`
- `Critical Rules` OR `Standard Rules` (at least one)
- `Checklist`

### Optional Sections

- `Examples`
- `Common Mistakes`
- `AI Self-Check Protocol`

---

## Adding New Categories

If your rule requires a new category:

### 1. Update Categories Configuration

Edit `curated-presets/categories.json`:

```json
{
  "categories": [
    "general",
    "typescript",
    "git",
    "ui",
    "backend",
    "lua",
    "testing",
    "your-new-category"  // Add here
  ]
}
```

### 2. Create Category Directory

```bash
mkdir -p curated-presets/rules/your-new-category
```

### 3. Update Validator Schema

Edit `src/core/validator.ts` and add your category to the enum:

```typescript
category: z.enum(['general', 'typescript', 'git', 'ui', 'backend', 'lua', 'testing', 'your-new-category']),
```

### 4. Document the Category

In your PR description, explain:
- What the category covers
- Why existing categories don't fit
- Example rules that would belong to this category

---

## Testing Your Changes

### 1. Validate Your Rule

```bash
npm run build
npm run validate
```

This checks:
- Frontmatter structure
- Required fields
- Version format
- Date format
- Description length

### 2. Run Tests

```bash
npm test
```

All tests must pass. The test suite uses the manifest dynamically, so your new rule will be automatically included in rule counts.

### 3. Manual Testing

Test your rule in a real project:

```bash
# Link cairel locally
npm link

# In a test project
cd /path/to/test-project
cairel init

# Verify your rule appears when conditions match
```

---

## Pull Request Process

### 1. Fork and Branch

```bash
git clone https://github.com/YOUR-USERNAME/cairel-cli.git
cd cairel-cli
git checkout -b feature/my-new-rule
```

### 2. Make Your Changes

- Add your rule file
- Update `categories.json` if needed
- Update validator schema if needed
- Run tests and validation

### 3. Commit with Clear Messages

```bash
git add curated-presets/rules/category/my-rule.md
git commit -m "feat: add my-new-rule for category

- Addresses use case X
- Applies to projects with Y
- Includes examples and checklist"
```

### 4. Push and Create PR

```bash
git push origin feature/my-new-rule
```

Then create a Pull Request on GitHub with:

**Title**: `feat: add {rule-name} rule`

**Description**:
- What problem does this rule solve?
- What projects/scenarios does it apply to?
- Why is it project-agnostic?
- Any special considerations?

### 5. PR Review Checklist

Your PR will be reviewed for:

- [ ] Rule follows standardized format
- [ ] Frontmatter is complete and valid
- [ ] Description is 20-150 characters
- [ ] Conditions are appropriate
- [ ] Content is clear and actionable
- [ ] Examples are helpful
- [ ] Rule is project-agnostic
- [ ] Tests pass
- [ ] Validation passes
- [ ] Categories updated (if new category)
- [ ] Validator schema updated (if new category)

---

## Review Process

1. **Automated Checks**: CI runs tests and validation
2. **Maintainer Review**: Cairel team reviews content and format
3. **Feedback**: You may be asked to make changes
4. **Approval**: Once approved, your PR will be merged
5. **Release**: Your rule will be included in the next release

---

## Rule Quality Guidelines

### Project-Agnostic

✅ **Good**: "Use semantic versioning for library releases"  
❌ **Bad**: "Use semantic versioning for the XYZ library"

### Actionable

✅ **Good**: "Run `npm test` before committing"  
❌ **Bad**: "Testing is important"

### Clear Conditions

✅ **Good**: Conditions specify `languages: [typescript]`  
❌ **Bad**: No conditions, but rule only applies to TypeScript

### Comprehensive Examples

✅ **Good**: Shows both correct and incorrect usage  
❌ **Bad**: Only shows correct usage

---

## Community Rules vs Official Rules

### Official Rules (`author: "cairel-core"`)

- Maintained by Cairel team
- Guaranteed to follow format
- Included in default presets
- Thoroughly tested

### Community Rules (`author: "community"`)

- Contributed by community
- May have different perspectives
- Reviewed but not officially maintained
- Can be experimental

**Note**: All community contributions start as community rules. After proven value and adoption, they may be promoted to official rules.

---

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Rule Ideas**: Open an Issue with `rule-proposal` label
- **Urgent Issues**: Tag maintainers in your issue

---

## Recognition

Contributors will be:
- Listed in release notes
- Credited in rule frontmatter (if desired)
- Acknowledged in project README

Thank you for helping make Cairel better! 🎉
