# Ordaiv - AI-Driven Development Initialization Tool

## Overview

Ordaiv is an npm-published CLI tool for initializing AI-driven development projects with standardized rules, agent configurations, and MCP server setups.

## Problem Statement

Developers using AI tools (kiro-cli, Amazon Q Developer) manually copy/paste rules and agent configurations between projects, leading to:
- Inconsistent AI behavior across projects
- Time wasted on setup
- Outdated or incomplete rule sets
- No standardization

## Goals

- **Eliminate manual setup**: Interactive CLI for project initialization
- **Standardize AI rules**: Curated, project-agnostic rules
- **Simplify agent configuration**: Template-based agent generation
- **MCP server integration**: Auto-detect and configure MCP servers
- **Extensibility**: Support multiple AI tools (kiro-cli, Amazon Q, future tools)

## Non-Goals

- Runtime rule enforcement (ordaiv is initialization-only)
- IDE integration (focus on CLI)
- AI model training or fine-tuning
- Project scaffolding beyond AI configuration

## Success Criteria

1. Successfully generates `.kiro/agents/` and `.kiro/steering/` directories
2. Successfully generates `.amazonq/rules/` and `.amazonq/cli-agents/` directories
3. Generated files are valid JSON/Markdown
4. Rules are project-agnostic (no hardcoded project names/paths)
5. Can be run multiple times without breaking existing setup
6. Published to npm and installable via `npx ordaiv init`
7. Wizard completes in < 2 minutes for quick setup
8. Generated configurations work with kiro-cli and Amazon Q Developer

## Constraints

- **Node.js 18+**: Minimum runtime requirement
- **npm registry**: Must be publishable to npm
- **Cross-platform**: Works on Linux, macOS, Windows
- **No external services**: Fully offline-capable
- **Minimal dependencies**: Keep package size small

## Tech Stack

### Core
- **Language**: TypeScript (type safety, better DX)
- **Runtime**: Node.js 18+
- **Package Manager**: npm

### CLI Framework
- **commander**: CLI structure & commands
- **inquirer**: Interactive prompts
- **chalk**: Terminal styling
- **ora**: Loading spinners

### Templating & Validation
- **handlebars**: Template engine
- **zod**: Schema validation for rules
- **ajv**: JSON schema validation for agents

### Utilities
- **fs-extra**: File operations
- **glob**: Pattern matching
- **execa**: Shell command execution

## Architecture

See `docs/architecture.md` for detailed architecture.

## Documentation

- `docs/dev-plan.md` - Stage-based development plan
- `docs/architecture.md` - System architecture
- `docs/progress.md` - Development progress log
- `PROJECT-SPEC.md` - Complete project specification
- `QUICK-REFERENCE.md` - Quick reference guide

## Getting Started (After Implementation)

```bash
# Install globally
npm install -g ordaiv

# Initialize new project
cd my-project
ordaiv init

# Follow interactive wizard
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm link
ordaiv init

# Test
npm test
```

## License

MIT

## Author

JMRMEDEV
