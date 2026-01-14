# Ordaiv AI Configuration

This directory contains AI-driven development configuration for the Ordaiv project itself.

## Purpose

This `.ai/` directory is **NOT copied to generated projects**. It exists only within ordaiv's installation to guide AI agents when working on ordaiv itself or helping users understand ordaiv's development process.

## How It Works

When kiro-cli assists with user projects:
1. User runs `ordaiv init` to generate AI configuration (.kiro/ or .amazonq/)
2. User runs `ordaiv bootstrap` to get path to ordaiv's .ai/ directory
3. User tells kiro-cli to read ordaiv's KICKOFF-PROMPT.txt
4. Kiro follows new.md protocol to guide project initialization
5. Kiro creates project documentation (README, dev-plan, architecture, etc.)
6. **Does NOT copy** `.ai/` to user's project

## Workflow Example

```bash
# 1. Initialize AI configuration
cd my-project
ordaiv init
# → Generates .kiro/agents/ and .kiro/steering/

# 2. Bootstrap project documentation
ordaiv bootstrap
# → Shows: Read /usr/local/lib/node_modules/ordaiv/.ai/KICKOFF-PROMPT.txt

# 3. Use kiro-cli with bootstrap instructions
kiro chat --agent dev-agent
# Paste the bootstrap instructions

# 4. Kiro follows new.md protocol
# → Guides through intake phase
# → Creates README.md, docs/dev-plan.md, docs/architecture.md, etc.
```

## What Ordaiv Generates for Users

Ordaiv generates for user projects:
- `.kiro/agents/` - Agent configurations
- `.kiro/steering/` - Rule files
- `.amazonq/cli-agents/` - Amazon Q agents
- `.amazonq/rules/` - Amazon Q rules

**NOT** `.ai/` directory - that's ordaiv-specific.

## Files

- **new.md** - Project initialization protocol (for ordaiv development)
- **HOW-TO-USE-new.md** - Guide for using new.md
- **KICKOFF-PROMPT.txt** - Initial prompt for AI agents
- **docs-architecture-TEMPLATE.md** - Architecture documentation template
- **docs-dev-plan-TEMPLATE.md** - Development plan template
- **docs-progress-TEMPLATE.md** - Progress tracking template

## Getting Started with Ordaiv Development

When working on Ordaiv itself, AI agents should:

1. Read `new.md` from ordaiv's installation path
2. Follow the intake phase for any new features
3. Use the templates for documentation
4. Maintain the same standards Ordaiv enforces for other projects

## Ordaiv's Own Configuration

Ordaiv uses:
- **Project Type**: CLI tool / Library
- **Language**: TypeScript
- **Framework**: Node.js CLI (Commander.js + Inquirer.js)
- **AI Tools**: kiro-cli
- **Documentation**: Following new.md protocol

## Note

The actual project documentation is in `/docs/` directory. This `.ai/` directory is internal to ordaiv and guides its own development, not user projects.
