import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import ora from 'ora';
import { QuickSetupAnswers, DetailedSetupAnswers } from '../types/wizard';
import { selectRules, getRuleCategory } from './rules-selector';

export async function generateFiles(
  answers: QuickSetupAnswers | DetailedSetupAnswers,
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
    const rules = await selectRules(answers);
    await copyRules(rules, paths.rulesDir);
    spinner.text = `Copied ${rules.length} rules`;

    // Generate agent configuration
    await generateAgent(answers, paths.agentsDir);
    spinner.succeed(chalk.green('Configuration generated successfully!'));

    // Show summary
    console.log(chalk.bold('\n📁 Generated files:'));
    console.log(chalk.cyan(`  ${paths.rulesDir}/`));
    rules.forEach(rule => console.log(chalk.gray(`    - ${rule}.md`)));
    console.log(chalk.cyan(`  ${paths.agentsDir}/`));
    console.log(chalk.gray(`    - agent.json`));
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
  const sourceBase = join(__dirname, '..', '..', 'curated-presets', 'rules');

  for (const ruleName of rules) {
    const category = await getRuleCategory(ruleName);
    const sourcePath = join(sourceBase, category, `${ruleName}.md`);
    const targetPath = join(targetDir, `${ruleName}.md`);

    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      await fs.writeFile(targetPath, content, 'utf-8');
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not copy rule ${ruleName}`));
    }
  }
}

async function generateAgent(
  answers: QuickSetupAnswers | DetailedSetupAnswers,
  targetDir: string
): Promise<void> {
  const templatePath = join(__dirname, '..', '..', 'curated-presets', 'templates', 'agent-template.hbs');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  const templateVars = buildTemplateVars(answers);
  const agentJson = template(templateVars);

  const targetPath = join(targetDir, 'agent.json');
  await fs.writeFile(targetPath, agentJson, 'utf-8');
}

function buildTemplateVars(answers: QuickSetupAnswers | DetailedSetupAnswers): Record<string, any> {
  const detailed = answers as DetailedSetupAnswers;
  
  return {
    AGENT_NAME: 'dev-agent',
    AGENT_DESCRIPTION: generateDescription(answers),
    AGENT_PROMPT: generatePrompt(answers),
    
    // Language & Framework
    TYPESCRIPT: answers.language === 'typescript',
    JAVASCRIPT: answers.language === 'javascript',
    PYTHON: answers.language === 'python',
    LUA: answers.language === 'lua',
    REACT: answers.framework === 'react',
    REACT_NATIVE: answers.framework === 'react-native',
    NEXT_JS: answers.framework === 'next-js',
    
    // Package Manager
    PACKAGE_MANAGER: detailed.packageManager || 'npm',
    PACKAGE_MANAGER_NPM: detailed.packageManager === 'npm' || !detailed.packageManager,
    PACKAGE_MANAGER_YARN: detailed.packageManager === 'yarn',
    PACKAGE_MANAGER_PNPM: detailed.packageManager === 'pnpm',
    
    // MCP Servers
    MCP_SERVERS_PATH: join(require('os').homedir(), 'mcp-servers'),
    MCP_AMAZON_Q_HISTORY: answers.mcpServers.includes('amazon-q-history'),
    MCP_GPT: answers.mcpServers.includes('gpt'),
    MCP_WEB_SCRAPER: answers.mcpServers.includes('web-scraper'),
    MCP_CYPRESS: answers.mcpServers.includes('cypress'),
    MCP_CHAKRA_UI: answers.mcpServers.includes('chakra-ui'),
    
    // Features
    USE_GIT: answers.useGit,
    USE_ENV_VARS: detailed.envVarStrategy !== 'no',
    ENV_PROD_PROTECTION: detailed.envVarStrategy === 'yes-with-prod-protection',
    USE_TESTING: detailed.testingFramework !== 'none',
    TESTING_FRAMEWORK: detailed.testingFramework || 'none',
    
    // Paths
    RULES_PATH: answers.aiTool === 'amazon-q' ? '.amazonq/rules' : '.kiro/steering',
    AGENTS_PATH: answers.aiTool === 'amazon-q' ? '.amazonq/cli-agents' : '.kiro/agents',
  };
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
