import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import ora from 'ora';
import { QuickSetupAnswers, DetailedSetupAnswers, CustomModeAnswers } from '../types/wizard';
import { selectRules } from './rules-selector';

export async function generateFiles(
  answers: QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers,
  targetDir: string = process.cwd()
): Promise<void> {
  const spinner = ora('Generating configuration...').start();

  try {
    // Determine paths based on AI tool
    const paths = getPaths(answers.aiTool, targetDir);
    
    // Create directories
    await createDirectories(paths);
    spinner.text = 'Directories created';

    // Copy rules
    const rules = 'selectedRules' in answers 
      ? answers.selectedRules 
      : await selectRules(answers);
    await copyRules(rules, paths.rulesDir);
    spinner.text = `Copied ${rules.length} rules`;

    // Generate agent configuration
    const agentName = await generateAgent(answers, paths.agentsDir);
    spinner.succeed(chalk.green('Configuration generated successfully!'));

    // Show summary
    console.log(chalk.bold('\n📁 Generated files:'));
    console.log(chalk.cyan(`  ${paths.rulesDir}/`));
    rules.forEach(rule => console.log(chalk.gray(`    - ${rule}.md`)));
    console.log(chalk.cyan(`  ${paths.agentsDir}/`));
    console.log(chalk.gray(`    - ${agentName}.json`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate configuration'));
    throw error;
  }
}

function getPaths(aiTool: string, targetDir: string) {
  if (aiTool === 'kiro-cli') {
    return {
      rulesDir: join(targetDir, '.kiro', 'steering'),
      agentsDir: join(targetDir, '.kiro', 'agents'),
    };
  } else if (aiTool === 'amazon-q') {
    return {
      rulesDir: join(targetDir, '.amazonq', 'rules'),
      agentsDir: join(targetDir, '.amazonq', 'cli-agents'),
    };
  } else {
    // both
    return {
      rulesDir: join(targetDir, '.kiro', 'steering'),
      agentsDir: join(targetDir, '.kiro', 'agents'),
      rulesDir2: join(targetDir, '.amazonq', 'rules'),
      agentsDir2: join(targetDir, '.amazonq', 'cli-agents'),
    };
  }
}

async function createDirectories(paths: Record<string, string>): Promise<void> {
  for (const path of Object.values(paths)) {
    await fs.mkdir(path, { recursive: true });
  }
}

async function copyRules(rules: string[], targetDir: string): Promise<void> {
  const sourceBase = join(__dirname, '..', '..', 'curated-presets', 'skills');

  for (const ruleName of rules) {
    const sourcePath = join(sourceBase, ruleName, 'SKILL.md');
    const targetPath = join(targetDir, `${ruleName}.md`);

    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      await fs.writeFile(targetPath, content, 'utf-8');
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not copy skill ${ruleName}`));
    }
  }
}

async function generateAgent(
  answers: QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers,
  targetDir: string
): Promise<string> {
  const templatePath = join(__dirname, '..', '..', 'curated-presets', 'templates', 'agent-template.hbs');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  const templateVars = buildTemplateVars(answers);
  const agentJson = template(templateVars);

  // Use agent name from template vars for filename
  const agentName = templateVars.AGENT_NAME || 'agent';
  const targetPath = join(targetDir, `${agentName}.json`);
  await fs.writeFile(targetPath, agentJson, 'utf-8');
  
  return agentName;
}

function buildTemplateVars(answers: QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers): Record<string, any> {
  // Handle custom mode
  if ('selectedRules' in answers) {
    const mcpServersJson = buildMcpServersJson(answers.mcpServers);
    
    return {
      AGENT_NAME: 'dev-agent',
      AGENT_DESCRIPTION: 'Custom development agent',
      AGENT_PROMPT: `You are a developer. You follow best practices and the steering rules defined in ${answers.aiTool === 'amazon-q' ? '.amazonq/rules/' : '.kiro/steering/'} directory.`,
      
      // Minimal defaults for custom mode
      TYPESCRIPT: false,
      JAVASCRIPT: false,
      PYTHON: false,
      LUA: false,
      REACT: false,
      REACT_NATIVE: false,
      NEXT_JS: false,
      
      PACKAGE_MANAGER: 'npm',
      PACKAGE_MANAGER_NPM: true,
      PACKAGE_MANAGER_YARN: false,
      PACKAGE_MANAGER_PNPM: false,
      
      HAS_MCP_SERVERS: answers.mcpServers.length > 0,
      MCP_SERVERS_JSON: mcpServersJson,
      MCP_SERVERS_PATH: join(require('os').homedir(), 'mcp-servers'),
      
      USE_GIT: false,
      USE_ENV_VARS: false,
      ENV_PROD_PROTECTION: false,
      USE_TESTING: false,
      TESTING_FRAMEWORK: 'none',
      
      RULES_PATH: answers.aiTool === 'amazon-q' ? '.amazonq/rules' : '.kiro/steering',
      AGENTS_PATH: answers.aiTool === 'amazon-q' ? '.amazonq/cli-agents' : '.kiro/agents',
    };
  }
  
  const detailed = answers as DetailedSetupAnswers;
  const mcpServersJson = buildMcpServersJson((answers as QuickSetupAnswers).mcpServers);
  
  return {
    AGENT_NAME: 'dev-agent',
    AGENT_DESCRIPTION: generateDescription(answers as QuickSetupAnswers),
    AGENT_PROMPT: generatePrompt(answers as QuickSetupAnswers),
    
    // Language & Framework
    TYPESCRIPT: (answers as QuickSetupAnswers).language === 'typescript',
    JAVASCRIPT: (answers as QuickSetupAnswers).language === 'javascript',
    PYTHON: (answers as QuickSetupAnswers).language === 'python',
    LUA: (answers as QuickSetupAnswers).language === 'lua',
    REACT: (answers as QuickSetupAnswers).framework === 'react',
    REACT_NATIVE: (answers as QuickSetupAnswers).framework === 'react-native',
    NEXT_JS: (answers as QuickSetupAnswers).framework === 'next-js',
    
    // Package Manager
    PACKAGE_MANAGER: detailed.packageManager || 'npm',
    PACKAGE_MANAGER_NPM: detailed.packageManager === 'npm' || !detailed.packageManager,
    PACKAGE_MANAGER_YARN: detailed.packageManager === 'yarn',
    PACKAGE_MANAGER_PNPM: detailed.packageManager === 'pnpm',
    
    // MCP Servers
    HAS_MCP_SERVERS: (answers as QuickSetupAnswers).mcpServers.length > 0,
    MCP_SERVERS_JSON: mcpServersJson,
    MCP_SERVERS_PATH: join(require('os').homedir(), 'mcp-servers'),
    
    // Features
    USE_GIT: (answers as QuickSetupAnswers).useGit,
    USE_ENV_VARS: detailed.envVarStrategy !== 'no',
    ENV_PROD_PROTECTION: detailed.envVarStrategy === 'yes-with-prod-protection',
    USE_TESTING: detailed.testingFramework !== 'none',
    TESTING_FRAMEWORK: detailed.testingFramework || 'none',
    
    // Paths
    RULES_PATH: (answers as QuickSetupAnswers).aiTool === 'amazon-q' ? '.amazonq/rules' : '.kiro/steering',
    AGENTS_PATH: (answers as QuickSetupAnswers).aiTool === 'amazon-q' ? '.amazonq/cli-agents' : '.kiro/agents',
  };
}

function buildMcpServersJson(mcpServers: string[]): string {
  if (mcpServers.length === 0) return '';
  
  const mcpPath = join(require('os').homedir(), 'mcp-servers');
  const servers = mcpServers.map((server, index) => {
    const isLast = index === mcpServers.length - 1;
    return `"${server}": {
      "type": "stdio",
      "command": "node",
      "args": ["${mcpPath}/${server}/server.js"]
    }${isLast ? '' : ','}`;
  }).join('\n    ');
  
  return `{\n    ${servers}\n  }`;
}

function generateDescription(answers: QuickSetupAnswers): string {
  const type = answers.projectType === 'ui' ? 'Frontend' : 
               answers.projectType === 'backend' ? 'Backend' :
               answers.projectType === 'fullstack' ? 'Full-stack' : 'Development';
  
  const lang = answers.language.charAt(0).toUpperCase() + answers.language.slice(1);
  const framework = answers.framework !== 'none' ? ` with ${answers.framework}` : '';
  
  return `${type} development agent for ${lang}${framework}`;
}

function generatePrompt(answers: QuickSetupAnswers): string {
  const type = answers.projectType === 'ui' ? 'frontend developer' :
               answers.projectType === 'backend' ? 'backend developer' :
               answers.projectType === 'fullstack' ? 'full-stack developer' :
               'developer';
  
  const lang = answers.language;
  const framework = answers.framework !== 'none' ? ` and ${answers.framework}` : '';
  const rulesPath = answers.aiTool === 'amazon-q' ? '.amazonq/rules/' : '.kiro/steering/';
  
  return `You are a ${type} specializing in ${lang}${framework}. You follow best practices and the steering rules defined in ${rulesPath} directory.`;
}
