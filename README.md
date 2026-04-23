# Cairel - AI Development Configuration Tool

**Standardize your AI-driven development workflow in minutes.**

Cairel generates consistent, project-specific configurations for AI coding assistants like [Kiro](https://kiro.dev), [GitHub Copilot](https://github.com/features/copilot), [Claude Code](https://claude.ai/code), and [Amazon Q Developer](https://aws.amazon.com/q/developer/), eliminating manual setup and ensuring best practices across your projects.

Skills follow the open [Agent Skills](https://agentskills.io) standard — write once, use everywhere.

[![npm version](https://img.shields.io/npm/v/cairel.svg)](https://www.npmjs.com/package/cairel)
[![npm downloads](https://img.shields.io/npm/dm/cairel.svg)](https://www.npmjs.com/package/cairel)
[![Node.js Version](https://img.shields.io/node/v/cairel.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why Cairel?

**The Problem**: Developers manually copy/paste AI assistant skills and configurations between projects, leading to:
- ❌ Inconsistent AI behavior across projects
- ❌ Time wasted on repetitive setup
- ❌ Outdated or incomplete skill sets
- ❌ No standardization across teams

**The Solution**: Cairel provides:
- ✅ **23 curated Agent Skills** following the open [agentskills.io](https://agentskills.io) standard
- ✅ **Interactive wizard** for project-specific configuration
- ✅ **Multi-platform support** — Kiro, GitHub Copilot, Claude Code, Amazon Q Developer
- ✅ **Automatic MCP server detection** and setup
- ✅ **Customizable skill selection** with review step

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
    Custom (Select specific skills)

? What type of project is this? UI (Frontend)
? Primary language? TypeScript
? Framework? React
? Use Git for version control? Yes
? Which platforms will you use? (select all that apply)
  ◉ Kiro
  ◉ Claude Code
  ◯ GitHub Copilot
  ◯ Amazon Q Developer
✔ Found 5 MCP server(s)
? Select MCP servers to configure: 
  ◉ amazon-q-history (/home/user/mcp-servers/amazon-q-history)
  ◉ gpt (/home/user/mcp-servers/gpt)
  ◯ web-scraper (/home/user/mcp-servers/web-scraper)

? Would you like to review and customize the skills? (y/N)
```

### What Gets Generated

Cairel creates Agent Skills in your project following the [agentskills.io](https://agentskills.io) standard:

**For Kiro:**
```
.kiro/
├── agents/
│   └── dev-agent.json
└── skills/
    ├── context-retrieval/
    │   └── SKILL.md
    ├── typescript-validation/
    │   └── SKILL.md
    └── ... (more skills based on your project)
```

**For Claude Code:**
```
.claude/
└── skills/
    ├── context-retrieval/
    │   └── SKILL.md
    └── ...
```

**For GitHub Copilot:**
```
.github/
└── skills/
    ├── context-retrieval/
    │   └── SKILL.md
    └── ...
```

**For Amazon Q Developer (legacy flat format):**
```
.amazonq/
├── cli-agents/
│   └── dev-agent.json
└── rules/
    └── ... (flat .md files)
```

---

## Features

### 🎯 Three Configuration Modes

**Quick Setup** (Recommended)
- 6 simple questions
- Automatic skill selection based on your stack
- Perfect for most projects

**Detailed Setup**
- 12 questions for fine-grained control
- Configure testing, linting, UI libraries, package managers
- Ideal for complex projects

**Custom Mode**
- Select specific skills from all 23 available
- Full control over your configuration
- Great for specialized workflows

### 📋 Optional Review Step

Before generating files, optionally review and customize:
- See all selected skills with descriptions
- Toggle skills on/off with checkboxes
- Ensure you get exactly what you need

### 🔌 Automatic MCP Server Detection

Cairel automatically detects installed MCP servers:
- amazon-q-history (session tracking)
- gpt (ChatGPT integration)
- web-scraper (web testing)
- cypress (E2E testing)
- chakra-ui (component reference)

### 📦 23 Curated Agent Skills

**General** (8 skills)
- Context retrieval & token optimization
- Implementation approval protocol
- Package manager safety
- Semantic versioning
- ESLint configuration
- Package.json management

**TypeScript** (4 skills)
- TypeScript validation
- Component structure
- React props destructuring
- Absolute imports

**Git** (1 skill)
- Git management & commit standards

**UI** (6 skills)
- Visual verification
- Mock data strategy
- Icon usage patterns
- Chakra UI v3 integration
- GlueStack UI v1 integration

**Backend** (1 skill)
- Multi-environment management

---

## Usage Examples

### Example 1: React TypeScript Frontend

```bash
cairel init
# Select: Quick Setup → UI → TypeScript → React → Yes (Git) → kiro-cli
```

**Generated skills**: context-retrieval, implementation-approval, typescript-validation, component-structure, react-props-destructuring, git-management, visual-verification, mock-data-strategy, package-manager-safety, package-json-management, absolute-imports

### Example 2: Python Backend API

```bash
cairel init
# Select: Quick Setup → Backend → Python → FastAPI → Yes (Git) → Amazon Q
```

**Generated skills**: context-retrieval, implementation-approval, git-management

### Example 3: Custom Configuration

```bash
cairel init
# Select: Custom → Select specific skills → Choose only what you need
```

---

## Commands

### `cairel init`
Initialize AI configuration for your project.

**Options:**
- Interactive wizard guides you through setup
- Generates agent configuration and skills
- Detects and configures MCP servers

### `cairel bootstrap`
Show path to Cairel's project initialization template.

Use this with kiro-cli to set up comprehensive project documentation:
```bash
cairel bootstrap
# Copy the output and paste into kiro-cli
```

### `cairel update`
Update existing configuration with new skills or settings.

**Features:**
- Backs up existing files
- Preserves custom skills
- Selective updates (skills only, agents only, or both)

### `cairel validate`
Validate skill and agent configuration files and agent configurations.

```bash
cairel validate                    # Validate all
cairel validate path/to/rule.md    # Validate specific file
cairel validate --skills            # Validate skills only
cairel validate --agents           # Validate agents only
```

### `cairel list`
List all available skills and their descriptions.

```bash
cairel list                        # Show all
cairel list --skills                # Skills only
cairel list --category typescript  # Filter by category
```

---

## Configuration

### Supported Platforms

- **Kiro**: Creates `.kiro/skills/` directory with agent configuration
- **Claude Code**: Creates `.claude/skills/` directory
- **GitHub Copilot**: Creates `.github/skills/` directory
- **Amazon Q Developer**: Creates `.amazonq/rules/` directory (legacy flat format)
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

### 2. Review Your Skills
Use the optional review step to understand what skills will be applied.

### 3. Customize as Needed
Don't hesitate to use Custom mode for specialized projects.

### 4. Keep Skills Updated
Run `cairel update` periodically to get improved skills.

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

### Skills Not Working as Expected

1. Validate your configuration: `cairel validate`
2. Check skill descriptions: `cairel list`
3. Review the generated files in `.kiro/steering/` or `.amazonq/rules/`

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

- **Submit new rules** - Share your AI assistant best practices
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

Rules and patterns abstracted from real-world AI-driven development projects using kiro-cli and Amazon Q Developer.

---

**Made with ❤️ for the AI-driven development community**
