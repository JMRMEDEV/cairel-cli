import { select, checkbox, confirm, Separator } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'fs';
import { join } from 'path';
import { WizardMode, QuickSetupAnswers, DetailedSetupAnswers, CustomModeAnswers, Framework, AITool, Platform, TestingFramework, Linter, UILibrary, PackageManager, EnvVarStrategy, VersioningStrategy } from '../types/wizard';
import { detectMCPServers } from '../utils/mcp-detector';
import { selectRules } from './rules-selector';

function getTerminalPageSize(): number {
  return Math.min((process.stdout.rows || 24) - 3, 15);
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
  
  return unclassified.map((r: any) => ({
    id: r.id,
    title: r.id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    description: `Additional rule from ${r.category} category`,
  }));
}

export async function runWizard(): Promise<QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers> {
  console.log(chalk.bold.blue('\n🚀 Cairel - AI Development Initialization\n'));

  const mode = await select<WizardMode>({
    message: 'How would you like to configure your project?',
    choices: [
      { name: 'Quick Setup (High-level, recommended)', value: 'quick' },
      { name: 'Detailed Setup (Granular control)', value: 'detailed' },
      { name: 'Custom (Select specific skills)', value: 'custom' },
    ],
  });

  if (mode === 'custom') {
    return await runCustomSetup();
  }

  const answers = mode === 'quick' ? await runQuickSetup() : await runDetailedSetup();
  
  const wantsReview = await confirm({
    message: 'Would you like to review and customize the skills before generating files?',
    default: false,
  });

  if (wantsReview) {
    const selectedRules = await reviewAndSelectRules(answers);
    if (!selectedRules) {
      console.log(chalk.yellow('\n❌ Configuration cancelled'));
      process.exit(0);
    }
    (answers as any).selectedRules = selectedRules;
  }
  
  return answers;
}

async function runQuickSetup(): Promise<QuickSetupAnswers> {
  const projectType = await select({
    message: 'What type of project is this?',
    choices: [
      { name: 'UI (Frontend)', value: 'ui' as const },
      { name: 'Backend (API/Server)', value: 'backend' as const },
      { name: 'CLI Tool', value: 'cli' as const },
      { name: 'Library/Package', value: 'library' as const },
      { name: 'Full-stack', value: 'fullstack' as const },
    ],
  });

  const language = await select({
    message: 'Primary language?',
    choices: [
      { name: 'TypeScript', value: 'typescript' as const },
      { name: 'JavaScript', value: 'javascript' as const },
      { name: 'Python', value: 'python' as const },
      { name: 'Go', value: 'go' as const },
      { name: 'Lua', value: 'lua' as const },
    ],
  });

  const frameworkChoices = getFrameworkChoices(projectType, language);
  
  let framework: Framework = 'none';
  if (frameworkChoices.length > 1) {
    framework = await select<Framework>({
      message: 'Framework?',
      choices: frameworkChoices.map(f => ({ name: f, value: f.toLowerCase().replace(/\./g, '-').replace(/\s+/g, '-') as Framework })),
    });
  }

  const useGit = await confirm({
    message: 'Use Git for version control?',
    default: true,
  });

  const platforms = await checkbox<Platform>({
    message: 'Which platforms will you use? (select all that apply)',
    choices: [
      { name: 'Kiro', value: 'kiro' as const, checked: true },
      { name: 'Claude Code', value: 'claude-code' as const },
      { name: 'GitHub Copilot', value: 'github-copilot' as const },
      { name: 'Amazon Q Developer', value: 'amazon-q' as const },
    ],
    required: true,
  });

  const spinner = ora('Detecting MCP servers...').start();
  const detectedServers = detectMCPServers();
  spinner.succeed(`Found ${detectedServers.length} MCP server(s)`);

  let mcpServers: string[] = [];
  if (detectedServers.length > 0) {
    mcpServers = await checkbox({
      message: 'Select MCP servers to configure:',
      choices: detectedServers.map(s => ({
        name: `${s.name} (${s.path})`,
        value: s.name,
        checked: true,
      })),
    });
  }

  const supportsAgents = platforms.some(p => p === 'kiro' || p === 'amazon-q');
  let generateAgent = false;
  if (supportsAgents) {
    generateAgent = await confirm({
      message: 'Generate a default agent based on your selected skills?',
      default: true,
    });
  }

  const result: QuickSetupAnswers = {
    projectType,
    language,
    framework,
    useGit,
    aiTool: (platforms.includes('kiro') ? 'kiro-cli' : platforms.includes('amazon-q') ? 'amazon-q' : 'kiro-cli') as AITool,
    platforms,
    mcpServers,
    generateAgent,
  };

  const optionalRules = await getOptionalRules(result);
  if (optionalRules.length > 0) {
    result.additionalRules = await checkbox({
      message: 'Select additional skills (optional):',
      choices: optionalRules.map(r => ({
        name: `${r.title} - ${r.description}`,
        value: r.id,
      })),
    });
  }

  return result;
}

async function runDetailedSetup(): Promise<DetailedSetupAnswers> {
  const quickAnswers = await runQuickSetup();

  const testingFramework = await select<TestingFramework>({
    message: 'Testing framework?',
    choices: getTestingFrameworkChoices(quickAnswers.language).map(c => ({ name: c, value: c.toLowerCase() as TestingFramework })),
  });

  const linter = await select<Linter>({
    message: 'Linting tool?',
    choices: getLinterChoices(quickAnswers.language).map(c => ({ name: c, value: c.toLowerCase() as Linter })),
  });

  let uiLibrary: UILibrary | undefined;
  if (quickAnswers.projectType === 'ui' || quickAnswers.projectType === 'fullstack') {
    uiLibrary = await select<UILibrary>({
      message: 'UI library?',
      choices: ['Chakra UI', 'GlueStack UI', 'Tailwind CSS', 'Material UI', 'None'].map(c => ({
        name: c,
        value: c.toLowerCase().replace(/\s+/g, '-') as UILibrary,
      })),
    });
  }

  let packageManager: PackageManager | undefined;
  if (quickAnswers.language === 'typescript' || quickAnswers.language === 'javascript') {
    packageManager = await select<PackageManager>({
      message: 'Package manager?',
      choices: (['npm', 'yarn', 'pnpm'] as const).map(c => ({ name: c, value: c })),
    });
  }

  const envVarStrategy = await select<EnvVarStrategy>({
    message: 'Environment variables?',
    choices: [
      { name: 'Yes, with production protection', value: 'yes-with-prod-protection' as const },
      { name: 'Yes, without protection', value: 'yes-without-protection' as const },
      { name: 'No', value: 'no' as const },
    ],
  });

  const versioningStrategy = await select<VersioningStrategy>({
    message: 'Versioning strategy?',
    choices: [
      { name: 'Semantic Versioning (semver)', value: 'semantic' as const },
      { name: 'Calendar Versioning (calver)', value: 'calver' as const },
      { name: 'None', value: 'none' as const },
    ],
  });

  const detailed: DetailedSetupAnswers = {
    ...quickAnswers,
    testingFramework,
    linter,
    envVarStrategy,
    versioningStrategy,
  };
  if (uiLibrary) detailed.uiLibrary = uiLibrary;
  if (packageManager) detailed.packageManager = packageManager;

  return detailed;
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

  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  const rulesByCategory: Record<string, any[]> = {};
  manifest.rules.forEach((rule: any) => {
    const category = rule.category || 'other';
    if (!rulesByCategory[category]) {
      rulesByCategory[category] = [];
    }
    rulesByCategory[category].push(rule);
  });

  const platforms = await checkbox<Platform>({
    message: 'Which platforms will you use? (select all that apply)',
    choices: [
      { name: 'Kiro', value: 'kiro' as const, checked: true },
      { name: 'Claude Code', value: 'claude-code' as const },
      { name: 'GitHub Copilot', value: 'github-copilot' as const },
      { name: 'Amazon Q Developer', value: 'amazon-q' as const },
    ],
    required: true,
  });

  const aiTool: AITool = platforms.includes('kiro') ? 'kiro-cli' : platforms.includes('amazon-q') ? 'amazon-q' : 'kiro-cli';

  const ruleChoices = Object.entries(rulesByCategory).flatMap(([category, rules]) => [
    new Separator(`── ${category.toUpperCase()} ──`),
    ...rules.map((rule: any) => ({
      name: `${rule.id.replace(/-/g, ' ')} (${rule.description || 'No description'})`,
      value: rule.id,
      checked: rule.alwaysInclude || false,
    })),
  ]);

  const selectedRules = await checkbox({
    message: 'Select rules to include:',
    choices: ruleChoices,
    pageSize: getTerminalPageSize(),
    loop: false,
    required: true,
  });

  const spinner = ora('Detecting MCP servers...').start();
  const detectedServers = detectMCPServers();
  spinner.succeed(`Found ${detectedServers.length} MCP server(s)`);

  let mcpServers: string[] = [];
  if (detectedServers.length > 0) {
    mcpServers = await checkbox({
      message: 'Select MCP servers to configure:',
      choices: detectedServers.map(s => ({
        name: `${s.name} (${s.path})`,
        value: s.name,
      })),
    });
  }

  const supportsAgents = platforms.some(p => p === 'kiro' || p === 'amazon-q');
  let generateAgent = false;
  if (supportsAgents) {
    generateAgent = await confirm({
      message: 'Generate a default agent based on your selected skills?',
      default: true,
    });
  }

  const result: CustomModeAnswers = {
    aiTool,
    platforms,
    selectedRules,
    mcpServers,
    generateAgent,
  };

  const wantsReview = await confirm({
    message: 'Would you like to review and customize the skills before generating files?',
    default: false,
  });

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

  const selectedRules = await selectRules(answers);
  
  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  const ruleChoices = selectedRules.map(ruleId => {
    const rule = manifest.rules.find((r: any) => r.id === ruleId);
    const description = rule?.description || 'No description';
    return {
      name: `${ruleId.replace(/-/g, ' ')} - ${description}`,
      value: ruleId,
      checked: true,
    };
  });

  const finalRules = await checkbox({
    message: 'Select rules to include (uncheck to exclude):',
    choices: ruleChoices,
    pageSize: getTerminalPageSize(),
    loop: false,
    required: true,
  });

  const confirmed = await confirm({
    message: `Proceed with ${finalRules.length} rule(s)?`,
    default: true,
  });

  return confirmed ? finalRules : null;
}

async function reviewAndSelectRulesCustom(selectedRules: string[], allRules: any[]): Promise<string[] | null> {
  console.log(chalk.bold.cyan('\n📋 Review & Customize Rules\n'));

  const ruleChoices = selectedRules.map(ruleId => {
    const rule = allRules.find((r: any) => r.id === ruleId);
    const description = rule?.description || 'No description';
    return {
      name: `${ruleId.replace(/-/g, ' ')} - ${description}`,
      value: ruleId,
      checked: true,
    };
  });

  const finalRules = await checkbox({
    message: 'Select rules to include (uncheck to exclude):',
    choices: ruleChoices,
    pageSize: getTerminalPageSize(),
    loop: false,
    required: true,
  });

  const confirmed = await confirm({
    message: `Proceed with ${finalRules.length} rule(s)?`,
    default: true,
  });

  return confirmed ? finalRules : null;
}
