import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import Handlebars from 'handlebars';
import chalk from 'chalk';
import ora from 'ora';
import { select, checkbox, confirm } from '@inquirer/prompts';
import { QuickSetupAnswers, DetailedSetupAnswers, CustomModeAnswers, Platform, WizardAnswers, isCustomMode, isProjectSetup, isDetailedMode } from '../types/wizard';
import { selectDirectives, loadManifestPublic } from './directives-selector';
import { generateDirectives, DirectiveInfo, GenerationResult } from './directive-generator';

interface PlatformPaths {
  skillsDir: string;
  agentsDir: string;
}

function getPlatformPaths(platform: Platform, targetDir: string): PlatformPaths {
  switch (platform) {
    case 'kiro':
      return { skillsDir: join(targetDir, '.kiro', 'skills'), agentsDir: join(targetDir, '.kiro', 'agents') };
    case 'cursor':
      return { skillsDir: join(targetDir, '.cursor', 'rules'), agentsDir: join(targetDir, '.cursor', 'rules') };
    case 'claude-code':
      return { skillsDir: join(targetDir, '.claude', 'skills'), agentsDir: join(targetDir, '.claude', 'skills') };
    case 'github-copilot':
      return { skillsDir: join(targetDir, '.github', 'skills'), agentsDir: join(targetDir, '.github', 'skills') };
    case 'amazon-q':
      return { skillsDir: join(targetDir, '.amazonq', 'rules'), agentsDir: join(targetDir, '.amazonq', 'cli-agents') };
  }
}

export async function generateFiles(
  answers: WizardAnswers,
  targetDir: string = process.cwd()
): Promise<void> {
  const spinner = ora('Generating configuration...').start();

  try {
    const platforms: Platform[] = answers.platforms || [answers.aiTool === 'amazon-q' ? 'amazon-q' : 'kiro'];
    const ruleIds = isCustomMode(answers)
      ? answers.selectedRules
      : (answers.selectedRules ?? await selectDirectives(answers));

    // Load manifest to get enforcement levels and metadata for selected directives
    const manifest = await loadManifestPublic();
    const directiveInfos: DirectiveInfo[] = ruleIds.map(id => {
      const def = manifest.directives.find(d => d.id === id);
      // Use user-selected enforcement overrides if present, otherwise fall back to manifest
      const enforcement = answers.enforcementOverrides?.[id] ?? def?.enforcement ?? 'contextual';
      return {
        id,
        enforcement,
        description: def?.description ?? '',
        title: def?.title ?? id,
      };
    });

    const allWarnings: GenerationResult['warnings'] = [];

    for (const platform of platforms) {
      // Generate directives with enforcement-aware routing
      const genResult = await generateDirectives(directiveInfos, platform, targetDir);
      allWarnings.push(...genResult.warnings);

      // Generate agent only for platforms that use them, and only if user opted in
      const wantsAgent = answers.generateAgent !== false;
      if (wantsAgent && (platform === 'kiro' || platform === 'amazon-q')) {
        const paths = getPlatformPaths(platform, targetDir);
        await fs.mkdir(paths.agentsDir, { recursive: true });
        await generateAgent(answers, paths.agentsDir, platform);
      } else if (platform === 'kiro' || platform === 'amazon-q') {
        const paths = getPlatformPaths(platform, targetDir);
        await patchExistingAgents(paths.agentsDir, platform);
      }
    }

    spinner.succeed(chalk.green('Configuration generated successfully!'));

    // Print warnings
    if (allWarnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      for (const warn of allWarnings) {
        console.log(chalk.yellow(`  - ${warn.message}`));
      }
    }

    // Show summary
    console.log(chalk.bold('\n📁 Generated files:'));
    for (const platform of platforms) {
      console.log(chalk.cyan(`  Platform: ${platform}`));
      for (const info of directiveInfos) {
        console.log(chalk.gray(`    - ${info.id} (${info.enforcement})`));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate configuration'));
    throw error;
  }
}

async function generateAgent(
  answers: WizardAnswers,
  targetDir: string,
  platform: Platform
): Promise<string> {
  const templatePath = join(__dirname, '..', '..', 'curated-presets', 'templates', 'agent-template.hbs');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);

  const templateVars = buildTemplateVars(answers, platform);
  const agentJson = template(templateVars);

  // Use agent name from template vars for filename
  const agentName = templateVars.AGENT_NAME || 'agent';
  const targetPath = join(targetDir, `${agentName}.json`);
  await fs.writeFile(targetPath, agentJson, 'utf-8');
  
  return agentName;
}

async function patchExistingAgents(agentsDir: string, platform: Platform): Promise<void> {
  try {
    await fs.access(agentsDir);
  } catch {
    return; // No agents directory — nothing to patch
  }

  const files = await fs.readdir(agentsDir);
  const agentFiles = files.filter(f => f.endsWith('.json'));
  if (agentFiles.length === 0) return;

  const resourceEntry = getResourcesPath(platform);
  if (!resourceEntry) return;

  // Parse agents and check which already have skills
  const agents: { file: string; name: string; hasSkills: boolean }[] = [];
  for (const file of agentFiles) {
    try {
      const content = await fs.readFile(join(agentsDir, file), 'utf-8');
      const agent = JSON.parse(content);
      const resources: string[] = agent.resources || [];
      agents.push({
        file,
        name: agent.name || file.replace('.json', ''),
        hasSkills: resources.some((r: string) => r.includes('skill://') || r.includes('skills')),
      });
    } catch {
      // Skip files that aren't valid JSON (e.g. .DS_Store, malformed)
    }
  }

  const needsPatch = agents.filter(a => !a.hasSkills);
  if (needsPatch.length === 0) {
    console.log(chalk.gray('\n  All existing agents already reference skills.'));
    return;
  }

  console.log(chalk.bold(`\n🔗 Found ${agents.length} existing agent(s) without skill references:`));
  needsPatch.forEach(a => console.log(chalk.gray(`  - ${a.name} (${a.file})`)));

  const wantsPatch = await confirm({
    message: 'Add skill references to existing agents?',
    default: true,
  });

  if (!wantsPatch) return;

  let agentsToPatch: string[];

  if (needsPatch.length === 1) {
    agentsToPatch = [needsPatch[0]!.file];
  } else {
    const mode = await select({
      message: 'Which agents should reference skills?',
      choices: [
        { name: 'All agents', value: 'all' as const },
        { name: 'Select specific agents', value: 'pick' as const },
      ],
    });

    if (mode === 'all') {
      agentsToPatch = needsPatch.map(a => a.file);
    } else {
      agentsToPatch = await checkbox({
        message: 'Select agents to patch:',
        choices: needsPatch.map(a => ({ name: `${a.name} (${a.file})`, value: a.file, checked: true })),
        required: true,
      });
    }
  }

  for (const file of agentsToPatch) {
    const filePath = join(agentsDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const agent = JSON.parse(content);
    if (!agent.resources) agent.resources = [];
    agent.resources.push(resourceEntry);
    await fs.writeFile(filePath, JSON.stringify(agent, null, 2) + '\n', 'utf-8');
  }

  console.log(chalk.green(`  ✓ Patched ${agentsToPatch.length} agent(s) with skill references`));
}

function getResourcesPath(platform: Platform): string {
  switch (platform) {
    case 'kiro': return 'skill://.kiro/skills/*/SKILL.md';
    case 'cursor': return 'file://.cursor/rules/*-directive.mdc';
    case 'amazon-q': return 'file://.amazonq/rules/*.md';
    default: return '';
  }
}

function getSkillsDir(platform: Platform): string {
  switch (platform) {
    case 'kiro': return '.kiro/skills';
    case 'cursor': return '.cursor/rules';
    case 'claude-code': return '.claude/skills';
    case 'github-copilot': return '.github/skills';
    case 'amazon-q': return '.amazonq/rules';
  }
}

function buildTemplateVars(answers: WizardAnswers, platform: Platform = 'kiro'): Record<string, any> {
  // Handle custom mode
  if (isCustomMode(answers)) {
    const mcpServersJson = buildMcpServersJson(answers.mcpServers);
    
    return {
      AGENT_NAME: 'dev-agent',
      AGENT_DESCRIPTION: 'Custom development agent',
      AGENT_PROMPT: `You are a developer. You follow best practices and the skills defined in ${getSkillsDir(platform)}/ directory.`,
      
      TYPESCRIPT: false, JAVASCRIPT: false, PYTHON: false, LUA: false,
      REACT: false, REACT_NATIVE: false, NEXT_JS: false,
      
      PACKAGE_MANAGER: 'npm',
      PACKAGE_MANAGER_NPM: true, PACKAGE_MANAGER_YARN: false, PACKAGE_MANAGER_PNPM: false,
      
      HAS_MCP_SERVERS: answers.mcpServers.length > 0,
      MCP_SERVERS_JSON: mcpServersJson,
      MCP_SERVERS_PATH: join(homedir(), 'mcp-servers'),
      
      USE_GIT: false, USE_ENV_VARS: false, ENV_PROD_PROTECTION: false,
      USE_TESTING: false, TESTING_FRAMEWORK: 'none',
      
      RESOURCES_PATH: getResourcesPath(platform),
      RULES_PATH: getSkillsDir(platform),
      AGENTS_PATH: platform === 'amazon-q' ? '.amazonq/cli-agents' : '.kiro/agents',
      IS_AMAZON_Q: platform === 'amazon-q',
    };
  }
  
  // Quick or detailed mode — answers is QuickSetupAnswers | DetailedSetupAnswers
  const mcpServersJson = buildMcpServersJson(answers.mcpServers);
  const packageManager = isDetailedMode(answers) ? (answers.packageManager || 'npm') : 'npm';
  const envVarStrategy = isDetailedMode(answers) ? answers.envVarStrategy : 'no';
  const testingFramework = isDetailedMode(answers) ? answers.testingFramework : 'none';
  
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
    PACKAGE_MANAGER: packageManager,
    PACKAGE_MANAGER_NPM: packageManager === 'npm',
    PACKAGE_MANAGER_YARN: packageManager === 'yarn',
    PACKAGE_MANAGER_PNPM: packageManager === 'pnpm',
    
    // MCP Servers
    HAS_MCP_SERVERS: answers.mcpServers.length > 0,
    MCP_SERVERS_JSON: mcpServersJson,
    MCP_SERVERS_PATH: join(homedir(), 'mcp-servers'),
    
    // Features
    USE_GIT: answers.useGit,
    USE_ENV_VARS: envVarStrategy !== 'no',
    ENV_PROD_PROTECTION: envVarStrategy === 'yes-with-prod-protection',
    USE_TESTING: testingFramework !== 'none',
    TESTING_FRAMEWORK: testingFramework,
    
    // Paths
    RESOURCES_PATH: getResourcesPath(platform),
    RULES_PATH: getSkillsDir(platform),
    AGENTS_PATH: platform === 'amazon-q' ? '.amazonq/cli-agents' : '.kiro/agents',
    IS_AMAZON_Q: platform === 'amazon-q',
  };
}

function buildMcpServersJson(mcpServers: string[]): string {
  if (mcpServers.length === 0) return '';
  
  const mcpPath = join(homedir(), 'mcp-servers');
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

function generateDescription(answers: QuickSetupAnswers | DetailedSetupAnswers): string {
  const type = answers.projectType === 'ui' ? 'Frontend' : 
               answers.projectType === 'backend' ? 'Backend' :
               answers.projectType === 'fullstack' ? 'Full-stack' : 'Development';
  
  const lang = answers.language.charAt(0).toUpperCase() + answers.language.slice(1);
  const framework = answers.framework !== 'none' ? ` with ${answers.framework}` : '';
  
  return `${type} development agent for ${lang}${framework}`;
}

function generatePrompt(answers: QuickSetupAnswers | DetailedSetupAnswers): string {
  const type = answers.projectType === 'ui' ? 'frontend developer' :
               answers.projectType === 'backend' ? 'backend developer' :
               answers.projectType === 'fullstack' ? 'full-stack developer' :
               'developer';
  
  const lang = answers.language;
  const framework = answers.framework !== 'none' ? ` and ${answers.framework}` : '';
  
  return `You are a ${type} specializing in ${lang}${framework}. You follow best practices and the skills available in your workspace.`;
}
