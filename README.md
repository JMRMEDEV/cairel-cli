# Cairel - AI-Driven Development Initialization Tool

**Status**: Phase 1 Complete ✅ | Ready for Phase 2 Implementation

---

## Overview

Cairel is an npm-published CLI tool for initializing AI-driven development projects with standardized rules, agent configurations, and MCP server setups.

### Problem

Developers using AI tools (kiro-cli, Amazon Q Developer) manually copy/paste rules and agent configurations between projects, leading to inconsistency, wasted time, and no standardization.

### Solution

Interactive CLI tool that generates AI configurations through a wizard, with:
- 17 curated, project-agnostic rules
- Wizard-driven agent generation
- MCP server auto-detection
- Support for kiro-cli and Amazon Q Developer

---

## Phase 1 Complete ✅

### Deliverables

**17 Curated Rules**:
- **General** (6): context-retrieval, implementation-approval, package-manager-safety, semantic-versioning, eslint-configuration, package-json-management
- **TypeScript** (4): typescript-validation, component-structure, react-props-destructuring, absolute-imports
- **Git** (1): git-management
- **UI** (5): visual-verification, mock-data-strategy, icon-usage-patterns, chakra-ui-v3-integration, gluestack-ui-v1-themed
- **Backend** (1): multi-environment-management

**Templates**:
- Wizard-driven agent template (Handlebars)
- General development agent preset

**Documentation**:
- Complete architecture design
- Stage-based development plan
- Wizard configuration specification
- Future vision (carm package manager)

---

## What Cairel Generates

When you run `cairel init`, it creates:

**For kiro-cli:**
```
.kiro/
├── agents/
│   └── dev-agent.json          # Generated agent configuration
└── steering/
    ├── context-retrieval.md    # Selected rules based on wizard
    ├── implementation-approval.md
    └── ... (other selected rules)
```

**For Amazon Q Developer:**
```
.amazonq/
├── cli-agents/
│   └── dev-agent.json          # Generated agent configuration
└── rules/
    ├── context-retrieval.md    # Selected rules based on wizard
    ├── implementation-approval.md
    └── ... (other selected rules)
```

**What is NOT generated:**
- `.ai/` directory (that's cairel-specific, not for user projects)
- `docs/` directory (user creates their own)
- Source code (cairel only generates AI configurations)

---

## Quick Start (After Implementation)

```bash
# Install globally
npm install -g cairel

# Step 1: Initialize AI configuration
cd my-project
cairel init

# Follow wizard
? How would you like to configure? 
  ❯ Quick Setup (High-level, recommended)
    Detailed Setup (Granular control)
    Custom (Select specific rules)

# Quick Setup example:
? Project type? UI
? Language? TypeScript
? Framework? React
? Use Git? Yes
? AI tools? kiro-cli
? MCP servers? [Select from detected]
? Would you like to review and customize the rules? (y/N)

# If you choose to review:
? Select rules to include (uncheck to exclude):
  ◉ context retrieval - Minimize token usage...
  ◉ implementation approval - Require explicit approval...
  ◉ typescript validation - Mandatory compilation...
  ...
? Proceed with 11 rule(s)? (Y/n)

# Step 2: Bootstrap project documentation
cairel bootstrap

# Copy the output and paste into kiro-cli:
# Read /usr/local/lib/node_modules/cairel/.ai/KICKOFF-PROMPT.txt
# and follow the new.md protocol to initialize this project.

# Step 3: Use kiro-cli
kiro chat --agent dev-agent
# Paste the bootstrap instructions
# Kiro will guide you through creating:
# - README.md
# - docs/dev-plan.md
# - docs/architecture.md
# - docs/progress.md
# - docs/bugs.md
```

---

## Documentation

All documentation in `docs/` directory:

- **README.md** - Project overview
- **PROJECT-SPEC.md** - Complete specification
- **architecture.md** - System architecture
- **dev-plan.md** - Stage-based development plan
- **progress.md** - Development progress log
- **WIZARD-CONFIG.md** - Wizard specification (in curated-presets/)
- **QUICK-REFERENCE.md** - Quick reference guide
- **FUTURE.md** - carm vision

---

## Project Structure

```
cairel/
├── src/                    # TypeScript source (Phase 2)
├── curated-presets/
│   ├── rules/              # 17 curated rules
│   ├── agents/             # Agent presets
│   ├── templates/          # Handlebars templates
│   └── WIZARD-CONFIG.md    # Wizard specification
├── docs/                   # All documentation
├── .ai/                    # Cairel's own AI config
├── README.md               # This file
└── package.json            # (Phase 2)
```

---

## Tech Stack

- **Language**: TypeScript
- **CLI**: Commander.js + Inquirer.js
- **Templating**: Handlebars
- **Validation**: Zod + AJV
- **Utilities**: fs-extra, glob, chalk, ora

---

## Next Steps: Phase 2

1. Initialize TypeScript project
2. Implement CLI framework
3. Implement wizard
4. Implement file generation
5. Implement validation
6. Testing and polish
7. npm publication

**Estimated**: 17-24 hours

---

## Future: carm

npm-like package manager for AI rules:

```bash
carm install @cairel/typescript-rules
carm search "react native"
carm publish my-custom-rules
```

See `docs/FUTURE.md` for complete vision.

---

## Contributing

Phase 1 complete. Phase 2 (implementation) coming soon.

Contribution guidelines will be available after Phase 2.

---

## License

MIT

---

## Author

JMRMEDEV

---

**Last Updated**: 2026-01-14  
**Phase**: 1 (Complete)  
**Next**: Phase 2 - Implementation
