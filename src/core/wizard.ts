import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import { join } from 'path';
import { WizardMode, QuickSetupAnswers, DetailedSetupAnswers, CustomModeAnswers, Framework, AITool } from '../types/wizard';
import { detectMCPServers } from '../utils/mcp-detector';
import { selectRules } from './rules-selector';

function getTerminalPageSize(): number {
  return (process.stdout.rows || 24) - 3;
}

interface OptionalRule {
  id: string;
  title: string;
  description: string;
}

async function getOptionalRules(answers: Partial<QuickSetupAnswers>): Promise<OptionalRule[]> {
  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);
  
  const unclassified = manifest.rules.filter((r: any) => !r.alwaysInclude && !r.conditions);
  
  // For now, return empty array since all rules are classified
  // In the future, this will show rules without conditions
  return unclassified.map((r: any) => ({
    id: r.id,
    title: r.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    description: `Additional rule from ${r.category} category`,
  }));
}

export async function runWizard(): Promise<QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers> {
  console.log(chalk.bold.blue('\n🚀 Cairel - AI Development Initialization\n'));

  const { mode } = await inquirer.prompt<{ mode: WizardMode }>([
    {
      type: 'list',
      name: 'mode',
      message: 'How would you like to configure your project?',
      choices: [
        { name: 'Quick Setup (High-level, recommended)', value: 'quick' },
        { name: 'Detailed Setup (Granular control)', value: 'detailed' },
        { name: 'Custom (Select specific skills)', value: 'custom' },
      ],
    },
  ]);

  if (mode === 'custom') {
    return await runCustomSetup();
  }

  const answers = mode === 'quick' ? await runQuickSetup() : await runDetailedSetup();
  
  // Optional review step with rule selection
  const { wantsReview } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'wantsReview',
      message: 'Would you like to review and customize the skills before generating files?',
      default: false,
    },
  ]);

  if (wantsReview) {
    const selectedRules = await reviewAndSelectRules(answers);
    if (!selectedRules) {
      console.log(chalk.yellow('\n❌ Configuration cancelled'));
      process.exit(0);
    }
    // Override with user-selected rules
    (answers as any).selectedRules = selectedRules;
  }
  
  return answers;
}

async function runQuickSetup(): Promise<QuickSetupAnswers> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project is this?',
      choices: [
        { name: 'UI (Frontend)', value: 'ui' },
        { name: 'Backend (API/Server)', value: 'backend' },
        { name: 'CLI Tool', value: 'cli' },
        { name: 'Library/Package', value: 'library' },
        { name: 'Full-stack', value: 'fullstack' },
      ],
    },
    {
      type: 'list',
      name: 'language',
      message: 'Primary language?',
      choices: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Lua'],
      filter: (val: string) => val.toLowerCase(),
    },
  ]);

  const frameworkChoices = getFrameworkChoices(answers.projectType, answers.language);
  
  const frameworkAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Framework?',
      choices: frameworkChoices,
      when: () => frameworkChoices.length > 1,
    },
  ]);

  const gitAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useGit',
      message: 'Use Git for version control?',
      default: true,
    },
  ]);

  const platformAnswer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Which platforms will you use? (select all that apply)',
      choices: [
        { name: 'Kiro', value: 'kiro', checked: true },
        { name: 'Claude Code', value: 'claude-code' },
        { name: 'GitHub Copilot', value: 'github-copilot' },
        { name: 'Amazon Q Developer', value: 'amazon-q' },
      ],
      validate: (input: string[]) => input.length > 0 ? true : 'Select at least one platform',
    },
  ]);

  const spinner = ora('Detecting MCP servers...').start();
  const detectedServers = detectMCPServers();
  spinner.succeed(`Found ${detectedServers.length} MCP server(s)`);

  const mcpChoices = detectedServers.map(s => ({
    name: `${s.name} (${s.path})`,
    value: s.name,
    checked: true,
  }));

  const mcpAnswer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'mcpServers',
      message: 'Select MCP servers to configure:',
      choices: mcpChoices,
      when: () => mcpChoices.length > 0,
    },
  ]);

  const platforms = platformAnswer.platforms;
  const result = {
    ...answers,
    framework: frameworkAnswer.framework || 'none',
    useGit: gitAnswer.useGit,
    aiTool: (platforms.includes('kiro') ? 'kiro-cli' : platforms.includes('amazon-q') ? 'amazon-q' : 'kiro-cli') as AITool,
    platforms,
    mcpServers: mcpAnswer.mcpServers || [],
  };

  // Offer optional rules
  const optionalRules = await getOptionalRules(result);
  if (optionalRules.length > 0) {
    const optionalAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'additionalRules',
        message: 'Select additional skills (optional):',
        choices: optionalRules.map(r => ({
          name: `${r.title} - ${r.description}`,
          value: r.id,
        })),
      },
    ]);
    (result as any).additionalRules = optionalAnswer.additionalRules || [];
  }

  return result;
}

async function runDetailedSetup(): Promise<DetailedSetupAnswers> {
  const quickAnswers = await runQuickSetup();

  const additionalAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'testingFramework',
      message: 'Testing framework?',
      choices: getTestingFrameworkChoices(quickAnswers.language),
    },
    {
      type: 'list',
      name: 'linter',
      message: 'Linting tool?',
      choices: getLinterChoices(quickAnswers.language),
    },
    {
      type: 'list',
      name: 'uiLibrary',
      message: 'UI library?',
      choices: ['Chakra UI', 'GlueStack UI', 'Tailwind CSS', 'Material UI', 'None'],
      filter: (val: string) => val.toLowerCase().replace(/\s+/g, '-'),
      when: () => quickAnswers.projectType === 'ui' || quickAnswers.projectType === 'fullstack',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager?',
      choices: ['npm', 'yarn', 'pnpm'],
      when: () => quickAnswers.language === 'typescript' || quickAnswers.language === 'javascript',
    },
    {
      type: 'list',
      name: 'envVarStrategy',
      message: 'Environment variables?',
      choices: [
        { name: 'Yes, with production protection', value: 'yes-with-prod-protection' },
        { name: 'Yes, without protection', value: 'yes-without-protection' },
        { name: 'No', value: 'no' },
      ],
    },
    {
      type: 'list',
      name: 'versioningStrategy',
      message: 'Versioning strategy?',
      choices: [
        { name: 'Semantic Versioning (semver)', value: 'semantic' },
        { name: 'Calendar Versioning (calver)', value: 'calver' },
        { name: 'None', value: 'none' },
      ],
    },
  ]);

  return { ...quickAnswers, ...additionalAnswers };
}

function getFrameworkChoices(projectType: string, language: string): string[] {
  if (projectType === 'ui' && (language === 'typescript' || language === 'javascript')) {
    return ['React', 'React Native', 'Next.js', 'Vue', 'None'];
  }
  if (projectType === 'backend' && (language === 'typescript' || language === 'javascript')) {
    return ['Express', 'Fastify', 'NestJS', 'None'];
  }
  if (projectType === 'backend' && language === 'python') {
    return ['Flask', 'Django', 'FastAPI', 'None'];
  }
  if (projectType === 'backend' && language === 'go') {
    return ['Gin', 'Echo', 'Fiber', 'Chi', 'None'];
  }
  return ['None'];
}

function getTestingFrameworkChoices(language: string): string[] {
  if (language === 'typescript' || language === 'javascript') {
    return ['Jest', 'Vitest', 'None'];
  }
  if (language === 'python') {
    return ['pytest', 'None'];
  }
  if (language === 'go') {
    return ['testing (built-in)', 'testify', 'None'];
  }
  return ['None'];
}

function getLinterChoices(language: string): string[] {
  if (language === 'typescript' || language === 'javascript') {
    return ['ESLint', 'None'];
  }
  if (language === 'python') {
    return ['Ruff', 'None'];
  }
  if (language === 'lua') {
    return ['Luacheck', 'None'];
  }
  if (language === 'go') {
    return ['golangci-lint', 'None'];
  }
  return ['None'];
}

async function runCustomSetup(): Promise<CustomModeAnswers> {
  console.log(chalk.yellow('\n📝 Custom Mode: Select specific rules for your project\n'));

  // Load all available rules
  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  // Group rules by category
  const rulesByCategory: Record<string, any[]> = {};
  manifest.rules.forEach((rule: any) => {
    const category = rule.category || 'other';
    if (!rulesByCategory[category]) {
      rulesByCategory[category] = [];
    }
    rulesByCategory[category].push(rule);
  });

  // Select platforms first
  const { platforms } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Which platforms will you use? (select all that apply)',
      choices: [
        { name: 'Kiro', value: 'kiro', checked: true },
        { name: 'Claude Code', value: 'claude-code' },
        { name: 'GitHub Copilot', value: 'github-copilot' },
        { name: 'Amazon Q Developer', value: 'amazon-q' },
      ],
      validate: (input: string[]) => input.length > 0 ? true : 'Select at least one platform',
    },
  ]);

  const aiTool: AITool = platforms.includes('kiro') ? 'kiro-cli' : platforms.includes('amazon-q') ? 'amazon-q' : 'kiro-cli';

  // Show rules grouped by category
  const ruleChoices = Object.entries(rulesByCategory).flatMap(([category, rules]) => [
    new inquirer.Separator(chalk.bold.cyan(`\n${category.toUpperCase()}`)),
    ...rules.map((rule: any) => ({
      name: `${rule.id.replace(/-/g, ' ')} ${chalk.gray(`(${rule.description || 'No description'})`)}`,
      value: rule.id,
      checked: rule.alwaysInclude || false,
    })),
  ]);

  const { selectedRules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRules',
      message: 'Select rules to include:',
      choices: ruleChoices,
      pageSize: getTerminalPageSize(),
      loop: false,
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one rule';
        }
        return true;
      },
    },
  ]);

  // MCP servers
  const spinner = ora('Detecting MCP servers...').start();
  const detectedServers = detectMCPServers();
  spinner.succeed(`Found ${detectedServers.length} MCP server(s)`);

  const mcpChoices = detectedServers.map(s => ({
    name: `${s.name} (${s.path})`,
    value: s.name,
    checked: false,
  }));

  const mcpAnswer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'mcpServers',
      message: 'Select MCP servers to configure:',
      choices: mcpChoices,
      when: () => mcpChoices.length > 0,
    },
  ]);

  const result: CustomModeAnswers = {
    aiTool,
    platforms,
    selectedRules,
    mcpServers: mcpAnswer.mcpServers || [],
  };

  // Optional review step for custom mode
  const { wantsReview } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'wantsReview',
      message: 'Would you like to review and customize the skills before generating files?',
      default: false,
    },
  ]);

  if (wantsReview) {
    const reviewedRules = await reviewAndSelectRulesCustom(result.selectedRules, manifest.rules);
    if (!reviewedRules) {
      console.log(chalk.yellow('\n❌ Configuration cancelled'));
      process.exit(0);
    }
    result.selectedRules = reviewedRules;
  }

  return result;
}

async function reviewAndSelectRules(answers: QuickSetupAnswers | DetailedSetupAnswers): Promise<string[] | null> {
  console.log(chalk.bold.cyan('\n📋 Review & Customize Rules\n'));

  // Get rules that would be selected
  const selectedRules = await selectRules(answers);
  
  // Load manifest to get descriptions
  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  // Create choices with descriptions
  const ruleChoices = selectedRules.map(ruleId => {
    const rule = manifest.rules.find((r: any) => r.id === ruleId);
    const description = rule?.description || 'No description';
    return {
      name: `${ruleId.replace(/-/g, ' ')} ${chalk.gray(`- ${description}`)}`,
      value: ruleId,
      checked: true,
    };
  });

  const { finalRules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'finalRules',
      message: 'Select rules to include (uncheck to exclude):',
      choices: ruleChoices,
      pageSize: getTerminalPageSize(),
      loop: false,
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one rule';
        }
        return true;
      },
    },
  ]);

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `\nProceed with ${finalRules.length} rule(s)?`,
      default: true,
    },
  ]);

  return confirmed ? finalRules : null;
}

async function reviewAndSelectRulesCustom(selectedRules: string[], allRules: any[]): Promise<string[] | null> {
  console.log(chalk.bold.cyan('\n📋 Review & Customize Rules\n'));

  // Create choices with descriptions
  const ruleChoices = selectedRules.map(ruleId => {
    const rule = allRules.find((r: any) => r.id === ruleId);
    const description = rule?.description || 'No description';
    return {
      name: `${ruleId.replace(/-/g, ' ')} ${chalk.gray(`- ${description}`)}`,
      value: ruleId,
      checked: true,
    };
  });

  const { finalRules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'finalRules',
      message: 'Select rules to include (uncheck to exclude):',
      choices: ruleChoices,
      pageSize: getTerminalPageSize(),
      loop: false,
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one rule';
        }
        return true;
      },
    },
  ]);

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `\nProceed with ${finalRules.length} rule(s)?`,
      default: true,
    },
  ]);

  return confirmed ? finalRules : null;
}

async function reviewConfiguration(answers: QuickSetupAnswers | DetailedSetupAnswers): Promise<boolean> {
  console.log(chalk.bold.cyan('\n📋 Review Configuration\n'));

  // Get selected rules
  const rules = await selectRules(answers);

  // Show configuration summary
  console.log(chalk.bold('Project Configuration:'));
  console.log(chalk.gray(`  Project Type: ${answers.projectType}`));
  console.log(chalk.gray(`  Language: ${answers.language}`));
  console.log(chalk.gray(`  Framework: ${answers.framework}`));
  console.log(chalk.gray(`  Git: ${answers.useGit ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  AI Tool: ${answers.aiTool}`));

  if ('testingFramework' in answers) {
    console.log(chalk.gray(`  Testing: ${answers.testingFramework}`));
    console.log(chalk.gray(`  Linter: ${answers.linter}`));
    if (answers.uiLibrary) {
      console.log(chalk.gray(`  UI Library: ${answers.uiLibrary}`));
    }
    if (answers.packageManager) {
      console.log(chalk.gray(`  Package Manager: ${answers.packageManager}`));
    }
    console.log(chalk.gray(`  Environment Variables: ${answers.envVarStrategy}`));
    console.log(chalk.gray(`  Versioning: ${answers.versioningStrategy}`));
  }

  console.log(chalk.bold(`\nRules to be included (${rules.length}):`));
  rules.forEach(rule => console.log(chalk.gray(`  ✓ ${rule}`)));

  if (answers.mcpServers.length > 0) {
    console.log(chalk.bold(`\nMCP Servers (${answers.mcpServers.length}):`));
    answers.mcpServers.forEach(server => console.log(chalk.gray(`  ✓ ${server}`)));
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '\nProceed with this configuration?',
      default: true,
    },
  ]);

  return confirmed;
}

async function reviewCustomConfiguration(answers: CustomModeAnswers, allRules: any[]): Promise<boolean> {
  console.log(chalk.bold.cyan('\n📋 Review Configuration\n'));

  console.log(chalk.bold('Project Configuration:'));
  console.log(chalk.gray(`  AI Tool: ${answers.aiTool}`));

  console.log(chalk.bold(`\nRules to be included (${answers.selectedRules.length}):`));
  answers.selectedRules.forEach(ruleId => {
    const rule = allRules.find((r: any) => r.id === ruleId);
    const description = rule?.description || 'No description';
    console.log(chalk.gray(`  ✓ ${ruleId.replace(/-/g, ' ')} ${chalk.dim(`(${description})`)}`));
  });

  if (answers.mcpServers.length > 0) {
    console.log(chalk.bold(`\nMCP Servers (${answers.mcpServers.length}):`));
    answers.mcpServers.forEach(server => console.log(chalk.gray(`  ✓ ${server}`)));
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: '\nProceed with this configuration?',
      default: true,
    },
  ]);

  return confirmed;
}
