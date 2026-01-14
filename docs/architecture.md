# Ordaiv Architecture

## System Overview

Ordaiv is a CLI tool that generates AI-driven development configurations through an interactive wizard.

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         CLI Entry Point             │
│         (src/index.ts)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Commander.js Router            │
│  ┌──────────┬──────────┬─────────┐ │
│  │   init   │  update  │validate │ │
│  └──────────┴──────────┴─────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Wizard (Inquirer.js)           │
│  ┌────────────────────────────────┐ │
│  │  Mode Selection                │ │
│  │  ├─ Quick (6 questions)        │ │
│  │  ├─ Detailed (12 questions)    │ │
│  │  └─ Custom (rule creator)      │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Answer Processing              │
│  ┌────────────────────────────────┐ │
│  │  - Validate answers            │ │
│  │  - Detect MCP servers          │ │
│  │  - Select rules                │ │
│  │  - Build template vars         │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      File Generation                │
│  ┌────────────────────────────────┐ │
│  │  Handlebars Templates          │ │
│  │  ├─ Agent JSON                 │ │
│  │  └─ Custom rules (if needed)   │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Rule Selection & Copy         │ │
│  │  └─ Copy from curated-presets  │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      File System Operations         │
│  ┌────────────────────────────────┐ │
│  │  Create directories            │ │
│  │  ├─ .kiro/agents/              │ │
│  │  ├─ .kiro/steering/            │ │
│  │  ├─ .amazonq/cli-agents/       │ │
│  │  └─ .amazonq/rules/            │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Write files                   │ │
│  │  ├─ Agent configurations       │ │
│  │  └─ Rule markdown files        │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Success / Error Reporting      │
└─────────────────────────────────────┘
```

---

## Component Architecture

### 1. CLI Layer (src/commands/)

**Responsibilities**:
- Parse command-line arguments
- Route to appropriate command handler
- Display help and version info
- Show interactive getting started menu when no args

**Technologies**: Commander.js, Inquirer.js

**Files**:
- `init.ts` - Initialize AI configuration (agents + rules)
- `bootstrap.ts` - Show path to ordaiv's .ai/ for project setup
- `update.ts` - Update existing configuration
- `validate.ts` - Validate rule files
- `list.ts` - List available presets

**Getting Started Feature**:
When user runs `ordaiv` without arguments, show interactive menu:
```
? What would you like to do?
  ❯ Initialize AI configuration (ordaiv init)
    Bootstrap project documentation (ordaiv bootstrap)
    Update existing configuration (ordaiv update)
    Validate rules (ordaiv validate)
    List available presets (ordaiv list)
    Show help (ordaiv --help)
```

**Bootstrap Command**:
Shows kiro-cli where to find ordaiv's .ai/ directory for project initialization:
```bash
ordaiv bootstrap

# Output:
✓ Ready to bootstrap project

Copy this for kiro-cli:

Read /usr/local/lib/node_modules/ordaiv/.ai/KICKOFF-PROMPT.txt
and follow the new.md protocol to initialize this project.

This will guide you through:
- Problem statement and goals
- Tech stack definition
- Architecture planning
- Documentation creation (README, dev-plan, architecture, progress, bugs)
```

---

### 2. Wizard Layer (src/core/wizard.ts)

**Responsibilities**:
- Present interactive questions
- Validate user input
- Collect answers
- Determine configuration based on answers

**Technologies**: Inquirer.js, Chalk (styling), Ora (spinners)

**Question Flow**:
```
Mode Selection
    ├─ Quick Setup
    │   ├─ Project Type
    │   ├─ Language
    │   ├─ Framework
    │   ├─ Use Git
    │   ├─ AI Tools
    │   └─ MCP Servers
    ├─ Detailed Setup
    │   ├─ [All Quick questions]
    │   ├─ Testing Framework
    │   ├─ Linting
    │   ├─ UI Library
    │   ├─ Package Manager
    │   ├─ Environment Variables
    │   └─ Versioning Strategy
    └─ Custom
        ├─ Rule Creator Wizard
        └─ Agent Creator Wizard
```

---

### 3. Generator Layer (src/core/generator.ts)

**Responsibilities**:
- Select rules based on answers
- Generate agent configuration from template
- Create directory structure
- Write files to disk

**Technologies**: Handlebars, fs-extra

**Process**:
1. Load curated rules from `curated-presets/rules/`
2. Filter rules based on wizard answers
3. Load agent template from `curated-presets/templates/`
4. Populate template with variables
5. Create target directories
6. Copy rules and write agent JSON

---

### 4. Validator Layer (src/core/validator.ts)

**Responsibilities**:
- Validate rule markdown files
- Validate agent JSON files
- Check file structure
- Report errors

**Technologies**: Zod (rules), AJV (agents)

**Validation**:
- Rule frontmatter structure
- Required sections presence
- Agent JSON schema compliance
- File naming conventions

---

### 5. Utilities Layer (src/utils/)

**Responsibilities**:
- File operations (read, write, copy)
- Path resolution
- MCP server detection
- Error handling

**Files**:
- `file-ops.ts` - File system operations
- `path-resolver.ts` - Path resolution logic
- `mcp-detector.ts` - Detect installed MCP servers
- `error-handler.ts` - Error formatting and reporting

---

## Data Flow

### Initialization Flow

```
User runs: ordaiv init
    ↓
CLI parses command
    ↓
Wizard presents questions
    ↓
User answers questions
    ↓
Answers validated
    ↓
MCP servers detected
    ↓
Rules selected based on answers
    ↓
Template variables built
    ↓
Agent JSON generated
    ↓
Directories created
    ↓
Rules copied
    ↓
Agent JSON written
    ↓
Success message displayed
```

### Update Flow

```
User runs: ordaiv update
    ↓
Detect existing configuration
    ↓
Backup existing files
    ↓
Load current configuration
    ↓
Wizard presents update options
    ↓
User selects what to update
    ↓
New rules/agents generated
    ↓
Files updated
    ↓
Success message displayed
```

---

## Technology Stack

### Core
- **TypeScript**: Type safety and better DX
- **Node.js 18+**: Runtime environment

### CLI Framework
- **Commander.js**: Command routing and parsing
- **Inquirer.js**: Interactive prompts
- **Chalk**: Terminal styling
- **Ora**: Loading spinners

### Templating & Validation
- **Handlebars**: Template engine for agent generation
- **Zod**: Schema validation for rules
- **AJV**: JSON schema validation for agents

### Utilities
- **fs-extra**: Enhanced file operations
- **glob**: Pattern matching for file discovery
- **execa**: Shell command execution

---

## File Structure

```
ordaiv/
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── update.ts
│   │   ├── validate.ts
│   │   └── list.ts
│   ├── core/
│   │   ├── wizard.ts
│   │   ├── generator.ts
│   │   └── validator.ts
│   ├── utils/
│   │   ├── file-ops.ts
│   │   ├── path-resolver.ts
│   │   ├── mcp-detector.ts
│   │   └── error-handler.ts
│   ├── types/
│   │   ├── wizard.ts
│   │   ├── agent.ts
│   │   └── rule.ts
│   └── index.ts
├── curated-presets/
│   ├── rules/
│   ├── agents/
│   └── templates/
├── dist/              # Compiled output
├── package.json
└── tsconfig.json
```

---

## Security Considerations

1. **File System Access**: Only write to project directory
2. **Command Execution**: No shell command execution in core logic
3. **Input Validation**: All user input validated
4. **Path Traversal**: Prevent directory traversal attacks
5. **Environment Variables**: Production protection built-in

---

## Performance Considerations

1. **Lazy Loading**: Load rules only when needed
2. **Caching**: Cache MCP server detection results
3. **Async Operations**: Use async file operations
4. **Minimal Dependencies**: Keep package size small

---

## Error Handling

1. **Validation Errors**: Clear messages with suggestions
2. **File System Errors**: Handle permissions, conflicts
3. **User Interruption**: Graceful cleanup on Ctrl+C
4. **Network Errors**: Handle MCP server detection failures

---

## Extensibility

1. **New Rules**: Add to `curated-presets/rules/`
2. **New AI Tools**: Extend wizard questions and templates
3. **New MCP Servers**: Add to detection list
4. **Custom Templates**: Support user-provided templates

---

## Future Enhancements

1. **ordaivrm**: Package manager for rules (see docs/FUTURE.md)
2. **Plugin System**: Allow third-party extensions
3. **Configuration Profiles**: Save and reuse configurations
4. **Interactive Updates**: Smart merging of updates
5. **Rule Marketplace**: Community-contributed rules
