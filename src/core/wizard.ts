import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { WizardMode, QuickSetupAnswers, DetailedSetupAnswers, Framework } from '../types/wizard';
import { detectMCPServers } from '../utils/mcp-detector';

export async function runWizard(): Promise<QuickSetupAnswers | DetailedSetupAnswers> {
  console.log(chalk.bold.blue('\n🚀 Ordaiv - AI Development Initialization\n'));

  const { mode } = await inquirer.prompt<{ mode: WizardMode }>([
    {
      type: 'list',
      name: 'mode',
      message: 'How would you like to configure your project?',
      choices: [
        { name: 'Quick Setup (High-level, recommended)', value: 'quick' },
        { name: 'Detailed Setup (Granular control)', value: 'detailed' },
        { name: 'Custom (Create your own rules)', value: 'custom' },
      ],
    },
  ]);

  if (mode === 'custom') {
    console.log(chalk.yellow('\n⚠️  Custom mode not implemented yet'));
    process.exit(0);
  }

  return mode === 'quick' ? await runQuickSetup() : await runDetailedSetup();
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
      choices: ['TypeScript', 'JavaScript', 'Python', 'Lua'],
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

  const aiToolAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'aiTool',
      message: 'Which AI tool(s) will you use?',
      choices: [
        { name: 'kiro-cli', value: 'kiro-cli' },
        { name: 'Amazon Q Developer', value: 'amazon-q' },
        { name: 'Both', value: 'both' },
      ],
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

  return {
    ...answers,
    framework: frameworkAnswer.framework || 'none',
    useGit: gitAnswer.useGit,
    aiTool: aiToolAnswer.aiTool,
    mcpServers: mcpAnswer.mcpServers || [],
  };
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
  return ['None'];
}

function getTestingFrameworkChoices(language: string): string[] {
  if (language === 'typescript' || language === 'javascript') {
    return ['Jest', 'Vitest', 'None'];
  }
  if (language === 'python') {
    return ['pytest', 'None'];
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
  return ['None'];
}
