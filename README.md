# Cairel - AI Development Configuration Tool

**Standardize your AI-driven development workflow in minutes.**

Cairel generates consistent, project-specific configurations for AI coding assistants like [Kiro](https://kiro.dev), [Cursor](https://cursor.sh), [GitHub Copilot](https://github.com/features/copilot), [Claude Code](https://claude.ai/code), and [Amazon Q Developer](https://aws.amazon.com/q/developer/), eliminating manual setup and ensuring best practices across your projects.

Directives follow the open [Agent Skills](https://agentskills.io) standard — write once, use everywhere.

[![npm version](https://img.shields.io/npm/v/cairel.svg)](https://www.npmjs.com/package/cairel)
[![npm downloads](https://img.shields.io/npm/dm/cairel.svg)](https://www.npmjs.com/package/cairel)
[![Node.js Version](https://img.shields.io/node/v/cairel.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why Cairel?

**The Problem**: Developers manually copy/paste AI assistant directives and configurations between projects, leading to:
- ❌ Inconsistent AI behavior across projects
- ❌ Time wasted on repetitive setup
- ❌ Outdated or incomplete directive sets
- ❌ No standardization across teams

**The Solution**: Cairel provides:
- ✅ **24 curated directives** following the open [agentskills.io](https://agentskills.io) standard
- ✅ **Interactive wizard** for project-specific configuration
- ✅ **Multi-platform support** — Kiro, Cursor, GitHub Copilot, Claude Code, Amazon Q Developer
- ✅ **Automatic MCP server detection** and setup
- ✅ **Customizable directive selection** with review step

---

## Quick Start

### Installation

```bash
npm install -g cairel
```

### Initialize Your Project

```bash
cd your-project
cairel init
```

### Follow the Interactive Wizard

```
🚀 Cairel - AI Development Initialization

? How would you like to configure your project?
  ❯ Quick Setup (High-level, recommended)
    Detailed Setup (Granular control)
    Custom (Select specific directives)

? What type of project is this? UI (Frontend)
? Primary language? TypeScript
? Framework? React
? Use Git for version control? Yes
? Which platforms will you use? (select all that apply)
  ◉ Kiro
  ◯ Cursor
  ◉ Claude Code
  ◯ GitHub Copilot
  ◯ Amazon Q Developer
✔ Found 5 MCP server(s)
? Select MCP servers to configure: 
  ◉ amazon-q-history (/home/user/mcp-servers/amazon-q-history)
  ◉ gpt (/home/user/mcp-servers/gpt)
  ◯ web-scraper (/home/user/mcp-servers/web-scraper)

? Would you like to review and customize the directives? (y/N)
```

### What Gets Generated

Cairel routes each directive to the correct platform layer based on its **enforcement level** (`enforced`, `contextual`, or `available`). See [Enforcement Levels](#enforcement-levels) below and [ADR-008](docs/architecture.md) for the full model.

**For Kiro:**
```
.kiro/
├── agents/
│   └── dev-agent.json
├── steering/                    # enforced + contextual directives
│   ├── git-management.md        # inclusion: always (enforced)
│   ├── mock-data-strategy.md    # inclusion: auto (contextual)
│   └── ... (more directives based on enforcement level)
└── skills/                      # available (on-demand) directives
    ├── context-retrieval/
    │   └── SKILL.md
    └── ... (available directives only)
```
- `enforced` directives → `.kiro/steering/{id}.md` with `inclusion: always`
- `contextual` directives → `.kiro/steering/{id}.md` with `inclusion: auto`
- `available` directives → `.kiro/skills/{id}/SKILL.md`

**For Cursor:**
```
.cursor/
└── rules/                       # all directives (enforcement set via frontmatter)
    ├── context-retrieval-directive.mdc
    ├── typescript-validation-directive.mdc
    └── ... (more directives based on your project)
```

Each `.mdc` file uses YAML frontmatter to control enforcement:
```yaml
---
description: "Minimize token usage through efficient context loading."
alwaysApply: true
---
# Directive content here
```

Enforcement mapping:
- **Enforced** → `alwaysApply: true` (always active)
- **Contextual** → description only, no `alwaysApply` (Cursor's "Apply Intelligently")
- **Available** → `alwaysApply: false` (manual `@` invocation)

**For Claude Code:**
```
CLAUDE.md                        # enforced + contextual directives appended as sections
```
Claude Code has no contextual or on-demand layer, so `contextual` directives are
included as enforced sections in `CLAUDE.md` and `available` directives are skipped.

**For GitHub Copilot:**
```
.github/
├── copilot-instructions.md      # enforced directives (always applied)
├── instructions/                # contextual directives
│   └── {id}.instructions.md     # with applyTo pattern
└── skills/                      # available (on-demand) directives
    └── {id}/
        └── SKILL.md
```

**For Amazon Q Developer (legacy flat format):**
```
.amazonq/
├── cli-agents/
│   └── dev-agent.json
└── rules/                       # enforced + contextual as flat .md files
    └── ... (available directives are not supported and skipped)
```

### Enforcement Levels

Cairel's curated content units are **directives**. Each directive is deployed at one of
three enforcement levels, and the wizard lets you override the default per directive
([ADR-008](docs/architecture.md)):

- **enforced** — always loaded every session; the AI cannot skip it. Use for hard rules
  (MUST/NEVER constraints).
- **contextual** — loaded when file patterns match or the AI determines relevance.
- **available** — on-demand only; the user explicitly invokes it.

Cairel routes each directive to exactly one layer per platform based on its enforcement
level. Platforms without a given layer fall back to the nearest supported one:

| Enforcement | Kiro | Cursor | Claude Code | GitHub Copilot | Amazon Q |
|-------------|------|--------|-------------|----------------|----------|
| enforced | `.kiro/steering/` (`inclusion: always`) | `.cursor/rules/*.mdc` (`alwaysApply: true`) | section in `CLAUDE.md` | `.github/copilot-instructions.md` | `.amazonq/rules/*.md` |
| contextual | `.kiro/steering/` (`inclusion: auto`) | `.cursor/rules/*.mdc` (description only) | section in `CLAUDE.md` (falls back to enforced) | `.github/instructions/*.instructions.md` (`applyTo`) | `.amazonq/rules/*.md` |
| available | `.kiro/skills/{id}/SKILL.md` | `.cursor/rules/*.mdc` (`alwaysApply: false`) | — (skipped) | `.github/skills/{id}/SKILL.md` | — (skipped) |

See [ADR-008: Hybrid Directives Model](docs/architecture.md) for the full rationale.

---

## Features

### 🎯 Three Configuration Modes

**Quick Setup** (Recommended)
- 6 simple questions
- Automatic directive selection based on your stack
- Perfect for most projects

**Detailed Setup**
- 12 questions for fine-grained control
- Configure testing, linting, UI libraries, package managers
- Ideal for complex projects

**Custom Mode**
- Select specific directives from all 24 available
- Full control over your configuration
- Great for specialized workflows

### 📋 Optional Review Step

Before generating files, optionally review and customize:
- See all selected directives with descriptions
- Toggle directives on/off with checkboxes
- Ensure you get exactly what you need

### 🔌 Automatic MCP Server Detection

Cairel automatically detects installed MCP servers:
- amazon-q-history (session tracking)
- gpt (ChatGPT integration)
- web-scraper (web testing)
- cypress (E2E testing)
- chakra-ui (component reference)

### 📦 24 Curated Directives

**General** (8 directives)
- Context retrieval & token optimization
- Implementation approval protocol
- Package manager safety
- Semantic versioning
- ESLint configuration
- Package.json management

**TypeScript** (4 directives)
- TypeScript validation
- Component structure
- React props destructuring
- Absolute imports

**Git** (2 directives)
- Git management & commit standards
- Conventional Commits specification

**UI** (6 directives)
- Visual verification
- Mock data strategy
- Icon usage patterns
- Chakra UI v3 integration
- GlueStack UI v1 integration

**Backend** (1 directive)
- Multi-environment management

**Testing** (1 directive)
- Temporary test file cleanup protocol

**Go** (1 directive)
- Go style & best practices

**Lua** (1 directive)
- Lua library semantic versioning

---

## Usage Examples

### Example 1: React TypeScript Frontend

```bash
cairel init
# Select: Quick Setup → UI → TypeScript → React → Yes (Git) → kiro-cli
```

**Generated directives**: context-retrieval, implementation-approval, typescript-validation, component-structure, react-props-destructuring, git-management, visual-verification, mock-data-strategy, package-manager-safety, package-json-management, absolute-imports

### Example 2: Python Backend API

```bash
cairel init
# Select: Quick Setup → Backend → Python → FastAPI → Yes (Git) → Amazon Q
```

**Generated directives**: context-retrieval, implementation-approval, git-management

### Example 3: Custom Configuration

```bash
cairel init
# Select: Custom → Select specific directives → Choose only what you need
```

---

## Commands

### `cairel init`
Initialize AI configuration for your project.

**Options:**
- Interactive wizard guides you through setup
- Generates agent configuration and directives
- Detects and configures MCP servers

### `cairel bootstrap`
Show path to Cairel's project initialization template.

Use this with kiro-cli to set up comprehensive project documentation:
```bash
cairel bootstrap
# Copy the output and paste into kiro-cli
```

### `cairel update`
Update existing configuration with new directives or settings.

**Features:**
- Backs up existing files
- Preserves custom directives
- Selective updates (directives only, agents only, or both)

### `cairel validate`
Validate directive and agent configuration files.

```bash
cairel validate                    # Validate all
cairel validate path/to/rule.md    # Validate specific file
cairel validate --directives       # Validate directives only
cairel validate --agents           # Validate agents only
```

### `cairel list`
List all available directives and their descriptions.

```bash
cairel list                        # Show all
cairel list --directives           # Directives only
cairel list --category typescript  # Filter by category
```

---

## Configuration

### Supported Platforms

- **Kiro**: Creates `.kiro/steering/` (enforced + contextual directives), `.kiro/skills/` (available directives), and `.kiro/agents/` (agent config)
- **Cursor**: Creates `.cursor/rules/` directory with `.mdc` files (enforcement via frontmatter)
- **Claude Code**: Appends enforced + contextual directives as sections in `CLAUDE.md`
- **GitHub Copilot**: Creates `.github/copilot-instructions.md` (enforced), `.github/instructions/` (contextual), and `.github/skills/` (available)
- **Amazon Q Developer**: Creates `.amazonq/rules/` directory (legacy flat format; enforced + contextual only)
- **Multiple platforms**: Select any combination simultaneously

### Supported Languages

- TypeScript
- JavaScript
- Python
- Go
- Lua

### Supported Frameworks

**Frontend:**
- React
- React Native
- Next.js
- Vue

**Backend:**
- Express
- Fastify
- NestJS
- Flask
- Django
- FastAPI
- Gin
- Echo
- Fiber
- Chi

---

## Best Practices

### 1. Start with Quick Setup
Most projects work great with Quick Setup. You can always run `cairel update` later.

### 2. Review Your Directives
Use the optional review step to understand what directives will be applied.

### 3. Customize as Needed
Don't hesitate to use Custom mode for specialized projects.

### 4. Keep Directives Updated
Run `cairel update` periodically to get improved directives.

### 5. Version Control Your Configuration
Commit the generated `.kiro/` or `.amazonq/` directories to your repository.

---

## Troubleshooting

### MCP Servers Not Detected

Cairel looks for MCP servers in:
- `/home/user/mcp-servers/`
- `~/.mcp-servers/`
- `./node_modules/@mcp/`

If your servers aren't detected, you can still configure them manually in the generated `dev-agent.json`.

### Directives Not Working as Expected

1. Validate your configuration: `cairel validate`
2. Check directive descriptions: `cairel list`
3. Review the generated files in `.kiro/steering/` and `.kiro/skills/` (or `.amazonq/rules/`)

### Need to Change Configuration

Run `cairel update` to modify your existing setup without losing custom changes.

---

## Technical Documentation

For developers and advanced users:

- **[Architecture](docs/architecture.md)** - System design and components
- **[Development Plan](docs/dev-plan.md)** - Stage-based implementation
- **[Progress](docs/progress.md)** - Development history and status
- **[Testing](docs/TESTING.md)** - Test suite and coverage
- **[Quick Reference](docs/QUICK-REFERENCE.md)** - Technical quick reference
- **[Future Vision](docs/FUTURE.md)** - carm package manager concept

---

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

### Ways to Contribute

- **Submit new directives** - Share your AI assistant best practices
- **Report bugs** - Help us improve reliability
- **Suggest features** - Tell us what you need
- **Improve documentation** - Make Cairel easier to use

---

## License

MIT © [JMRMEDEV](https://github.com/JMRMEDEV)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/JMRMEDEV/cairel-cli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JMRMEDEV/cairel-cli/discussions)

---

## Acknowledgments

Directives and patterns abstracted from real-world AI-driven development projects using kiro-cli and Amazon Q Developer.

---

**Made with ❤️ for the AI-driven development community**
