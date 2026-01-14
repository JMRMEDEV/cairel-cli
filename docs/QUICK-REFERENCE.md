# Ordaiv Quick Reference

## Project Status

**Current Phase**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 - Project Setup

---

## What is Ordaiv?

An npm-published CLI tool for initializing AI-driven development projects with:
- Standardized rules for AI assistants (kiro-cli, Amazon Q Developer)
- Agent configurations with MCP server setups
- Interactive wizard for project customization
- Project-agnostic, reusable patterns

---

## Quick Start (After Implementation)

```bash
# Install globally
npm install -g ordaiv

# Initialize new project
cd my-project
ordaiv init

# Follow interactive wizard
? How would you like to configure? Quick Setup
? Project type? UI
? Primary language? TypeScript
? Framework? React
? Use Git? Yes
? AI tools? kiro-cli
? MCP servers? [Select from detected]

# Generated structure:
my-project/
├── .kiro/
│   ├── agents/
│   │   └── general-dev.json
│   └── steering/
│       ├── context-retrieval.md
│       ├── implementation-approval.md
│       ├── typescript-validation.md
│       ├── component-structure.md
│       ├── git-management.md
│       └── visual-verification.md
```

---

## Curated Rules (7 Core Rules)

### General (3)
1. **context-retrieval** - Token optimization, efficient context loading
2. **implementation-approval** - Permission protocol for decisions
3. **package-manager-safety** - Safe package management, --force protection

### TypeScript (2)
4. **typescript-validation** - Mandatory compilation validation
5. **component-structure** - Component organization patterns

### Git (1)
6. **git-management** - Repository management, commit standards

### UI (1)
7. **visual-verification** - Evidence-based UI verification

---

## Rule Format

```markdown
---
meta:
  id: "rule-id"
  title: "Rule Title"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "general"
  tags: ["tag1", "tag2"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# Rule Title
**Purpose**: One-line description
**Applies To**: Project types

## 🚨 Critical Rules
## 📋 Standard Rules
## ✅ Checklist
## 🔍 Examples
## 🚫 Common Mistakes
## 🤖 AI Self-Check Protocol
```

---

## Tech Stack

- **Language**: TypeScript
- **CLI**: Commander.js + Inquirer.js
- **Templating**: Handlebars
- **Validation**: Zod + AJV
- **Utilities**: fs-extra, glob, execa, chalk, ora

---

## Commands (Planned)

```bash
ordaiv init              # Initialize project
ordaiv init --mode quick # Quick setup
ordaiv init --dry-run    # Preview changes

ordaiv update            # Update rules/agents
ordaiv validate          # Validate rule files
ordaiv list              # List available presets
```

---

## Wizard Modes

### Quick Setup (6 questions)
1. Project type
2. Language
3. Framework
4. Git
5. AI tools
6. MCP servers

### Detailed Setup (12 questions)
All quick setup + testing, linting, UI library, package manager, versioning, docs

### Custom
Guided rule/agent creation wizard

---

## MCP Servers Supported

- **amazon-q-history** - Session tracking and context preservation
- **gpt** - ChatGPT agent for architecture and debugging
- **web-scraper** - Web scraping and React app testing
- **cypress** - E2E testing with screenshot management
- **chakra-ui** - Chakra UI component reference

---

## Directory Structure

```
ordaiv/
├── src/
│   ├── commands/        # init, update, validate
│   ├── core/            # wizard, generator, validator
│   ├── templates/       # Handlebars templates
│   ├── presets/         # Curated rules and agents
│   └── utils/           # File ops, MCP detector
├── curated-presets/
│   ├── rules/           # 7 curated rules
│   ├── agents/          # Agent templates
│   └── templates/       # Handlebars templates
└── docs/
    └── FUTURE.md        # ordaivrm vision
```

---

## Future: ordaivrm

**Vision**: npm-like package manager for AI rules

```bash
ordaivrm install @ordaiv/typescript-rules
ordaivrm search "react native"
ordaivrm publish my-custom-rules
ordaivrm update
```

See `docs/FUTURE.md` for complete vision.

---

## File Locations

### Curated Rules
```
/home/jmrmedev/repos/ordaiv/curated-presets/rules/
├── general/
│   ├── context-retrieval.md
│   ├── implementation-approval.md
│   └── package-manager-safety.md
├── typescript/
│   ├── typescript-validation.md
│   └── component-structure.md
├── git/
│   └── git-management.md
└── ui/
    └── visual-verification.md
```

### Agent Templates
```
/home/jmrmedev/repos/ordaiv/curated-presets/
├── agents/
│   └── general-dev.json
└── templates/
    └── agent-template.hbs
```

### Documentation
```
/home/jmrmedev/repos/ordaiv/
├── PROJECT-SPEC.md          # Complete specification
├── PHASE-1-SUMMARY.md       # Phase 1 completion
├── QUICK-REFERENCE.md       # This file
└── docs/
    └── FUTURE.md            # ordaivrm vision
```

---

## Next Steps (Phase 2)

1. Initialize TypeScript project
2. Install dependencies
3. Set up CLI framework
4. Implement wizard logic
5. Implement file generation
6. Implement validation

---

## Key Principles

1. **Project-agnostic** - Rules work for any project type
2. **AI-optimized** - Clear, structured, actionable
3. **Standardized** - Consistent format across all rules
4. **Extensible** - Easy to add new rules and agents
5. **Community-ready** - Designed for future contributions

---

## Resources

- **Kiro CLI Docs**: https://kiro.dev/docs/cli/custom-agents/configuration-reference/
- **Amazon Q CLI**: https://github.com/aws/amazon-q-developer-cli
- **MCP Servers**: See `standard-useful-mcp-servers.md`

---

## Contact & Contribution

**Author**: JMRMEDEV  
**License**: MIT  
**Repository**: (To be published)

For contributions, see `docs/CONTRIBUTING.md` (to be created in Phase 2)
