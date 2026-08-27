export type WizardMode = 'quick' | 'detailed' | 'custom';

export type ProjectType = 'ui' | 'backend' | 'cli' | 'library' | 'fullstack';
export type Language = 'typescript' | 'javascript' | 'python' | 'go' | 'lua';
export type Framework = 'react' | 'react-native' | 'next-js' | 'vue' | 'express' | 'fastify' | 'nest-js' | 'nestjs' | 'flask' | 'django' | 'fastapi' | 'gin' | 'echo' | 'fiber' | 'chi' | 'none';
export type AITool = 'kiro-cli' | 'amazon-q' | 'both';
export type Platform = 'kiro' | 'claude-code' | 'github-copilot' | 'amazon-q';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type TestingFramework = 'jest' | 'vitest' | 'pytest' | 'testing (built-in)' | 'testify' | 'none';
export type Linter = 'eslint' | 'ruff' | 'luacheck' | 'golangci-lint' | 'none';
export type UILibrary = 'chakra-ui' | 'gluestack-ui' | 'tailwind-css' | 'material-ui' | 'none';
export type EnvVarStrategy = 'yes-with-prod-protection' | 'yes-without-protection' | 'no';
export type VersioningStrategy = 'semantic' | 'calver' | 'none';

export interface QuickSetupAnswers {
  mode: 'quick';
  projectType: ProjectType;
  language: Language;
  framework: Framework;
  useGit: boolean;
  aiTool: AITool;
  platforms: Platform[];
  mcpServers: string[];
  additionalSkills?: string[];
  generateAgent?: boolean;
  selectedRules?: string[];
}

export interface DetailedSetupAnswers {
  mode: 'detailed';
  projectType: ProjectType;
  language: Language;
  framework: Framework;
  useGit: boolean;
  aiTool: AITool;
  platforms: Platform[];
  mcpServers: string[];
  additionalSkills?: string[];
  generateAgent?: boolean;
  selectedRules?: string[];
  testingFramework: TestingFramework;
  linter: Linter;
  uiLibrary?: UILibrary;
  packageManager?: PackageManager;
  envVarStrategy: EnvVarStrategy;
  versioningStrategy: VersioningStrategy;
}

export interface CustomModeAnswers {
  mode: 'custom';
  aiTool: AITool;
  platforms: Platform[];
  selectedRules: string[];
  mcpServers: string[];
  generateAgent?: boolean;
}

export type WizardAnswers = QuickSetupAnswers | DetailedSetupAnswers | CustomModeAnswers;

// Type guards
export function isCustomMode(answers: WizardAnswers): answers is CustomModeAnswers {
  return answers.mode === 'custom';
}

export function isDetailedMode(answers: WizardAnswers): answers is DetailedSetupAnswers {
  return answers.mode === 'detailed';
}

export function isQuickMode(answers: WizardAnswers): answers is QuickSetupAnswers {
  return answers.mode === 'quick';
}

export function isProjectSetup(answers: WizardAnswers): answers is QuickSetupAnswers | DetailedSetupAnswers {
  return answers.mode === 'quick' || answers.mode === 'detailed';
}

export interface MCPServer {
  name: string;
  path: string;
}

/** Thrown when the user cancels a prompt (Ctrl+C or declines to proceed). */
export class UserCancelledError extends Error {
  constructor(message = 'User cancelled the operation') {
    super(message);
    this.name = 'UserCancelledError';
  }
}
