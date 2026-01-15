# Cairel AI Configuration

This directory contains AI-driven development configuration for the Cairel project itself.

## Purpose

This `.ai/` directory is **NOT copied to generated projects**. It exists only within cairel's installation to guide AI agents when working on cairel itself or helping users understand cairel's development process.

## How It Works

When kiro-cli assists with user projects:
1. User runs `cairel init` to generate AI configuration (.kiro/ or .amazonq/)
2. User runs `cairel bootstrap` to get path to cairel's .ai/ directory
3. User tells kiro-cli to read cairel's KICKOFF-PROMPT.txt
4. Kiro follows new.md protocol to guide project initialization
5. Kiro creates project documentation (README, dev-plan, architecture, etc.)
6. **Does NOT copy** `.ai/` to user's project

## Workflow Example

```bash
# 1. Initialize AI configuration
cd my-project
cairel init
# → Generates .kiro/agents/ and .kiro/steering/

# 2. Bootstrap project documentation
cairel bootstrap
# → Shows: Read /usr/local/lib/node_modules/cairel/.ai/KICKOFF-PROMPT.txt

# 3. Use kiro-cli with bootstrap instructions
kiro chat --agent dev-agent
# Paste the bootstrap instructions

# 4. Kiro follows new.md protocol
# → Guides through intake phase
# → Creates README.md, docs/dev-plan.md, docs/architecture.md, etc.
```

## What Cairel Generates for Users

Cairel generates for user projects:
- `.kiro/agents/` - Agent configurations
- `.kiro/steering/` - Rule files
- `.amazonq/cli-agents/` - Amazon Q agents
- `.amazonq/rules/` - Amazon Q rules

**NOT** `.ai/` directory - that's cairel-specific.

## Files

- **new.md** - Project initialization protocol (for cairel development)
- **HOW-TO-USE-new.md** - Guide for using new.md
- **KICKOFF-PROMPT.txt** - Initial prompt for AI agents
- **docs-architecture-TEMPLATE.md** - Architecture documentation template
- **docs-dev-plan-TEMPLATE.md** - Development plan template
- **docs-progress-TEMPLATE.md** - Progress tracking template

## Getting Started with Cairel Development

When working on Cairel itself, AI agents should:

1. Read `new.md` from cairel's installation path
2. Follow the intake phase for any new features
3. Use the templates for documentation
4. Maintain the same standards Cairel enforces for other projects

## Cairel's Own Configuration

Cairel uses:
- **Project Type**: CLI tool / Library
- **Language**: TypeScript
- **Framework**: Node.js CLI (Commander.js + Inquirer.js)
- **AI Tools**: kiro-cli
- **Documentation**: Following new.md protocol

## Note

The actual project documentation is in `/docs/` directory. This `.ai/` directory is internal to cairel and guides its own development, not user projects.
