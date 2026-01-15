# Cairel Wizard Configuration

This document defines all wizard questions and their impact on generated configurations.

## Wizard Questions

### Quick Setup Mode (6 questions)

1. **Project Type**
   - Options: `ui`, `backend`, `cli`, `library`, `fullstack`
   - Affects: Rules selection, agent prompt

2. **Primary Language**
   - Options: `typescript`, `javascript`, `python`, `lua`
   - Affects: Rules selection, toolsSettings

3. **Framework** (context-aware based on project type + language)
   - UI + TS/JS: `react`, `react-native`, `next-js`, `vue`, `none`
   - Backend + TS/JS: `express`, `fastify`, `nest-js`, `none`
   - Backend + Python: `flask`, `django`, `fastapi`, `none`
   - Affects: Rules selection, agent prompt

4. **Use Git?**
   - Options: `yes`, `no`
   - Affects: Git rules inclusion, toolsSettings (git commands)

5. **AI Tools**
   - Options: `kiro-cli`, `amazon-q`, `both`
   - Affects: Directory structure (.kiro/ vs .amazonq/)

6. **MCP Servers** (multi-select)
   - Detected servers + custom path option
   - Affects: mcpServers configuration in agent

### Detailed Setup Mode (Additional 6 questions)

7. **Testing Framework**
   - Options: `jest`, `vitest`, `pytest`, `none`
   - Affects: Test rules, toolsSettings

8. **Linting**
   - Options: `eslint`, `ruff`, `luacheck`, `none`
   - Affects: Linting rules, toolsSettings

9. **UI Library** (if project type is UI)
   - Options: `chakra-ui`, `gluestack-ui`, `tailwind`, `material-ui`, `none`
   - Affects: UI-specific rules, MCP servers

10. **Package Manager** (if language is TS/JS)
    - Options: `npm`, `yarn`, `pnpm`
    - Affects: toolsSettings (allowed commands)

11. **Environment Variables**
    - Options: `yes-with-prod-protection`, `yes-without-protection`, `no`
    - Affects: Multi-env rules, toolsSettings (allowed/denied paths)

12. **Versioning Strategy**
    - Options: `semantic`, `calver`, `none`
    - Affects: Versioning rules

## Agent Template Variables

Based on wizard answers, these variables are populated:

```typescript
interface AgentTemplateVars {
  // Basic
  AGENT_NAME: string;
  AGENT_DESCRIPTION: string;
  AGENT_PROMPT: string;
  
  // Language & Framework
  TYPESCRIPT: boolean;
  JAVASCRIPT: boolean;
  PYTHON: boolean;
  LUA: boolean;
  REACT: boolean;
  REACT_NATIVE: boolean;
  NEXT_JS: boolean;
  
  // Package Manager
  PACKAGE_MANAGER: 'npm' | 'yarn' | 'pnpm';
  PACKAGE_MANAGER_NPM: boolean;
  PACKAGE_MANAGER_YARN: boolean;
  PACKAGE_MANAGER_PNPM: boolean;
  
  // MCP Servers
  MCP_SERVERS_PATH: string;
  MCP_AMAZON_Q_HISTORY: boolean;
  MCP_GPT: boolean;
  MCP_WEB_SCRAPER: boolean;
  MCP_CYPRESS: boolean;
  MCP_CHAKRA_UI: boolean;
  
  // Features
  USE_GIT: boolean;
  USE_ENV_VARS: boolean;
  ENV_PROD_PROTECTION: boolean;
  USE_TESTING: boolean;
  TESTING_FRAMEWORK: string;
  
  // Paths
  RULES_PATH: string;  // .kiro/steering or .amazonq/rules
  AGENTS_PATH: string; // .kiro/agents or .amazonq/cli-agents
}
```

## Rules Selection Matrix

| Rule | Conditions |
|------|-----------|
| context-retrieval | Always included |
| implementation-approval | Always included |
| package-manager-safety | language === 'typescript' \|\| 'javascript' |
| typescript-validation | language === 'typescript' |
| component-structure | (language === 'typescript' \|\| 'javascript') && (framework === 'react' \|\| 'react-native' \|\| 'next-js') |
| react-props-destructuring | framework === 'react' \|\| 'react-native' \|\| 'next-js' |
| git-management | useGit === true |
| visual-verification | projectType === 'ui' \|\| 'fullstack' |
| mock-data-strategy | projectType === 'ui' \|\| 'fullstack' |
| multi-environment-management | useEnvVars === true |
| semantic-versioning | versioningStrategy === 'semantic' |

## ToolsSettings Generation

### fs_read / fs_write allowedPaths

```typescript
const allowedPaths = [
  './**/*.json',
  './**/*.md',
  './**/*.yml',
  './**/*.yaml',
  './.gitignore',
];

if (typescript) {
  allowedPaths.push('./**/*.ts', './**/*.tsx');
}

if (javascript) {
  allowedPaths.push('./**/*.js', './**/*.jsx');
}

if (python) {
  allowedPaths.push('./**/*.py');
}

if (lua) {
  allowedPaths.push('./**/*.lua');
}

if (useEnvVars && envProdProtection) {
  allowedPaths.push(
    './**/*.env.dev',
    './**/*.env.qa',
    './**/dev.env',
    './**/qa.env',
    './**/.env.example'
  );
}
```

### fs_read / fs_write deniedPaths

```typescript
const deniedPaths = [
  './**/node_modules/',
  './**/node_modules/**',
];

if (useEnvVars && envProdProtection) {
  deniedPaths.push(
    './**/.env',
    './**/.env.prod',
    './**/.env.production',
    './**/prod.env',
    './**/production.env'
  );
}
```

### execute_bash allowedCommands

```typescript
const allowedCommands = [
  'ls -la*',
  'pwd',
  'find*',
];

if (useGit) {
  allowedCommands.push(
    'git status',
    'git fetch',
    'git diff*',
    'git log*'
  );
}

if (packageManager === 'npm') {
  allowedCommands.push('npm install', 'npm test*');
}

if (packageManager === 'yarn') {
  allowedCommands.push('yarn*');
}

if (packageManager === 'pnpm') {
  allowedCommands.push('pnpm*');
}

if (typescript) {
  allowedCommands.push('npx tsc --noEmit');
}
```

### execute_bash deniedCommands

```typescript
const deniedCommands = [
  'rm -rf *',
  'sudo *',
  'chmod 777 *',
  '*--force*',
];
```

## Agent Prompt Generation

```typescript
const generatePrompt = (answers: WizardAnswers): string => {
  let prompt = 'You are a ';
  
  if (answers.projectType === 'ui') {
    prompt += 'frontend developer';
  } else if (answers.projectType === 'backend') {
    prompt += 'backend developer';
  } else if (answers.projectType === 'fullstack') {
    prompt += 'full-stack developer';
  }
  
  prompt += ` specializing in ${answers.language}`;
  
  if (answers.framework && answers.framework !== 'none') {
    prompt += ` and ${answers.framework}`;
  }
  
  prompt += '. You follow best practices and the steering rules defined in ';
  prompt += answers.aiTool === 'kiro-cli' ? '.kiro/steering/' : '.amazonq/rules/';
  prompt += ' directory.';
  
  return prompt;
};
```

## Example Generated Configuration

### Input (Quick Setup)
```
Project Type: ui
Language: typescript
Framework: react
Use Git: yes
AI Tools: kiro-cli
MCP Servers: amazon-q-history, web-scraper
```

### Output (agent.json)
```json
{
  "name": "dev-agent",
  "description": "Frontend development agent for React with TypeScript",
  "prompt": "You are a frontend developer specializing in typescript and react. You follow best practices and the steering rules defined in .kiro/steering/ directory.",
  "mcpServers": {
    "amazon-q-history": {
      "type": "stdio",
      "command": "node",
      "args": ["/home/user/mcp-servers/amazon-q-history/server.js"]
    },
    "web-scraper": {
      "type": "stdio",
      "command": "node",
      "args": ["/home/user/mcp-servers/web-scraper/server.js"]
    }
  },
  "tools": ["*"],
  "allowedTools": ["@amazon-q-history/*", "@web-scraper/*", "web_fetch"],
  "resources": ["file://.kiro/steering/*.md"],
  "toolsSettings": {
    "fs_read": {
      "allowedPaths": ["./**/*.ts", "./**/*.tsx", "./**/*.json", "./**/*.md"],
      "deniedPaths": ["./**/node_modules/**"]
    },
    "execute_bash": {
      "allowedCommands": ["git status", "git fetch", "yarn*", "npx tsc --noEmit"],
      "deniedCommands": ["rm -rf *", "sudo *", "*--force*"]
    }
  }
}
```

### Output (Rules)
```
.kiro/steering/
├── context-retrieval.md
├── implementation-approval.md
├── package-manager-safety.md
├── typescript-validation.md
├── component-structure.md
├── react-props-destructuring.md
├── git-management.md
├── visual-verification.md
└── mock-data-strategy.md
```
