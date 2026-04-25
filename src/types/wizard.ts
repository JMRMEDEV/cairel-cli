export type WizardMode = 'quick' | 'detailed' | 'custom';

export type ProjectType = 'ui' | 'backend' | 'cli' | 'library' | 'fullstack';
export type Language = 'typescript' | 'javascript' | 'python' | 'lua';
export type Framework = 'react' | 'react-native' | 'next-js' | 'vue' | 'express' | 'fastify' | 'nest-js' | 'flask' | 'django' | 'fastapi' | 'none';
export type AITool = 'kiro-cli' | 'amazon-q' | 'both';
export type Platform = 'kiro' | 'claude-code' | 'github-copilot' | 'amazon-q';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type TestingFramework = 'jest' | 'vitest' | 'pytest' | 'none';
export type Linter = 'eslint' | 'ruff' | 'luacheck' | 'none';
export type UILibrary = 'chakra-ui' | 'gluestack-ui' | 'tailwind' | 'material-ui' | 'none';
export type EnvVarStrategy = 'yes-with-prod-protection' | 'yes-without-protection' | 'no';
export type VersioningStrategy = 'semantic' | 'calver' | 'none';

export interface QuickSetupAnswers {
  projectType: ProjectType;
  language: Language;
  framework: Framework;
  useGit: boolean;
  aiTool: AITool;
  platforms: Platform[];
  mcpServers: string[];
  additionalRules?: string[];
  generateAgent?: boolean;
}

export interface DetailedSetupAnswers extends QuickSetupAnswers {
  testingFramework: TestingFramework;
  linter: Linter;
  uiLibrary?: UILibrary;
  packageManager?: PackageManager;
  envVarStrategy: EnvVarStrategy;
  versioningStrategy: VersioningStrategy;
}

export interface MCPServer {
  name: string;
  path: string;
}

export interface CustomModeAnswers {
  aiTool: AITool;
  platforms: Platform[];
  selectedRules: string[];
  mcpServers: string[];
  generateAgent?: boolean;
}
