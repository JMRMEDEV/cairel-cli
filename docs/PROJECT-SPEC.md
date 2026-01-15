# Cairel - AI-Driven Development Initialization Tool

**Version**: 1.0.0  
**Status**: Phase 1 - Rule Abstraction & Curation ✅

---

## Overview

Cairel is an npm-published CLI tool designed to initialize AI-driven development projects with standardized rules, agent configurations, and MCP server setups. It eliminates manual copy/paste workflows and ensures consistency across projects.

### Supported AI Tools
- **kiro-cli** (Primary)
- **Amazon Q Developer** (Primary)
- Extensible to other AI development tools

---

## Project Vision

### Current Scope (v1.0)
- Interactive CLI for project initialization
- Curated, project-agnostic rules and agents
- MCP server configuration
- Support for kiro-cli and Amazon Q Developer

### Future Vision
- **carm** (Rule Manager) - NPM-like package manager for AI rules
- Community-contributed rules and agents
- Rule versioning and updates
- Cross-tool compatibility layer

---

## Architecture

### Directory Structure

```
cairel/
├── src/
│   ├── commands/
│   │   ├── init.ts           # Main initialization command
│   │   ├── update.ts          # Update existing rules
│   │   └── validate.ts        # Validate rule files
│   ├── core/
│   │   ├── wizard.ts          # Interactive wizard logic
│   │   ├── generator.ts       # File generation
│   │   └── validator.ts       # Rule validation
│   ├── templates/
│   │   ├── rules/             # Rule templates (.hbs)
│   │   ├── agents/            # Agent templates (.hbs)
│   │   └── mcp/               # MCP config templates
│   ├── presets/
│   │   ├── rules/             # Curated rules
│   │   ├── agents/            # Curated agent configs
│   │   └── index.ts           # Preset registry
│   ├── utils/
│   │   ├── file-ops.ts        # File operations
│   │   ├── path-resolver.ts   # Path resolution
│   │   └── mcp-detector.ts    # Detect installed MCP servers
│   └── index.ts               # CLI entry point
├── curated-presets/           # Abstracted rules and agents
│   ├── rules/
│   │   ├── general/
│   │   ├── typescript/
│   │   ├── git/
│   │   ├── ui/
│   │   └── README.md
│   ├── agents/
│   └── templates/
├── docs/
│   ├── FUTURE.md              # carm vision
│   └── CONTRIBUTING.md
├── package.json
└── tsconfig.json
```

---

## Tech Stack

### Core
- **Language**: TypeScript
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
- **cosmiconfig**: Config file discovery

---

## Rule Format Specification

### Markdown Structure

```markdown
---
meta:
  id: "rule-id"
  title: "Rule Title"
  author: "cairel-core | community"
  version: "1.0.0"
  category: "general | typescript | git | ui | backend | testing"
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

**Purpose**: One-line description (≤200 chars)

**Applies To**: Project types

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
[Decision trees and workflows]
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

### Validation Rules
- Frontmatter structure validation
- Required sections presence
- Purpose ≤ 200 characters
- Valid category from predefined list
- Valid tags

---

## Wizard Flow

### Mode Selection
```
? How would you like to configure your project?
  ❯ Quick Setup (High-level, recommended)
    Detailed Setup (Granular control)
    Custom (Create your own rules)
```

### High-Level Flow (Quick Setup)
1. Project type? (UI/Backend/CLI/Library/Fullstack)
2. Primary language? (TypeScript/JavaScript/Python/Lua)
3. Framework? (Context-aware based on #1 and #2)
4. Use Git? (Yes/No)
5. AI tools? (kiro-cli/Amazon Q/Both)
6. MCP servers? (Multi-select from detected + custom)

### Granular Flow (Detailed Setup)
All high-level questions +
7. Testing framework? (Jest/Vitest/Pytest/None)
8. Linting? (ESLint/Ruff/Luacheck/None)
9. UI library? (If UI: Chakra/GlueStack/Tailwind/etc.)
10. Package manager? (npm/yarn/pnpm)
11. Versioning strategy? (Semantic/CalVer/None)
12. Documentation? (Markdown/JSDoc/Sphinx/None)

### Custom Flow
1. Rule wizard (guided rule creation)
2. Agent wizard (guided agent creation)
3. Save as preset? (Yes/No)

---

## MCP Server Configuration

### Detection Strategy
```typescript
const mcpDetectionPaths = [
  '/home/user/mcp-servers/',
  '~/.mcp-servers/',
  './node_modules/@mcp/',
  // Custom paths from user input
];

const detectedServers = scanForMcpServers(mcpDetectionPaths);
```

### User Interaction
```
? Select MCP servers to configure:
  ◉ amazon-q-history (detected: /home/user/mcp-servers/amazon-q-history)
  ◉ gpt (detected: /home/user/mcp-servers/gpt)
  ◯ web-scraper (detected: /home/user/mcp-servers/web-scraper)
  ◯ cypress (detected: /home/user/mcp-servers/cypress)
  ◯ chakra-ui (detected: /home/user/mcp-servers/chakra-ui)
  ◯ + Add custom path
```

### Installation Instructions
If server not found, provide:
```
MCP Server 'amazon-q-history' not found.

Installation:
git clone https://github.com/JMRMEDEV/amazon-q-history-mcp-server
cd amazon-q-history-mcp-server
npm install

After installation, run 'cairel init' again.
```

---

## Success Criteria

### Phase 1: Rule Abstraction ✅
- [x] Analyzed compendium rules
- [x] Created standardized rule format
- [x] Abstracted 7 core rules
- [x] Created rule templates
- [x] Documented rule format

### Phase 2: Project Setup (Next)
- [ ] Initialize TypeScript project
- [ ] Set up CLI framework (commander + inquirer)
- [ ] Implement wizard logic
- [ ] Create file generation system
- [ ] Implement rule validation

### Phase 3: Core Features
- [ ] High-level wizard flow
- [ ] Granular wizard flow
- [ ] MCP server detection
- [ ] Agent generation
- [ ] Rule generation

### Phase 4: Polish & Release
- [ ] Update command
- [ ] Validate command
- [ ] List command
- [ ] Dry-run mode
- [ ] Error handling
- [ ] Documentation
- [ ] npm publish

---

## Curated Rules (Phase 1 Complete)

### General
1. **context-retrieval** - Token optimization and efficient context loading
2. **implementation-approval** - Permission protocol for high-level decisions
3. **package-manager-safety** - Safe package management practices

### TypeScript
4. **typescript-validation** - Compilation validation workflow
5. **component-structure** - Component organization patterns

### Git
6. **git-management** - Repository management and commit standards

### UI
7. **visual-verification** - Visual verification for UI changes

---

## Commands (Planned)

### `cairel init`
Initialize a new project with AI-driven development setup.

**Options:**
- `--mode <quick|detailed|custom>` - Wizard mode
- `--dry-run` - Show what would be generated
- `--force` - Overwrite existing files

### `cairel update`
Update existing rules and agents.

**Options:**
- `--rules` - Update only rules
- `--agents` - Update only agents
- `--mcp` - Update only MCP configs

### `cairel validate`
Validate rule files against schema.

**Options:**
- `--path <path>` - Path to validate
- `--fix` - Auto-fix issues

### `cairel list`
List available presets.

**Options:**
- `--rules` - List only rules
- `--agents` - List only agents
- `--category <category>` - Filter by category

---

## Future: carm (Rule Manager)

### Vision
NPM-like package manager for AI rules and agents.

### Features
- Rule packages with versioning
- Community contributions
- Dependency management
- Update notifications
- Compatibility checking

### Commands (Conceptual)
```bash
carm install typescript-rules@latest
carm search "react native"
carm publish my-custom-rules
carm update
```

### Documentation
See `docs/FUTURE.md` for detailed vision.

---

## Contributing

See `docs/CONTRIBUTING.md` for guidelines.

### Rule Contribution
1. Follow standardized format
2. Include all mandatory sections
3. Provide examples
4. Test with validation tool
5. Submit PR

### Agent Contribution
1. Use Handlebars templates
2. Follow JSON schema
3. Document MCP servers
4. Test configuration
5. Submit PR

---

## License

MIT

---

## Acknowledgments

Rules and patterns abstracted from real-world AI-driven development projects using kiro-cli and Amazon Q Developer.
