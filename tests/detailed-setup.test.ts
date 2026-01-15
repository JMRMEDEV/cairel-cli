/**
 * Detailed Setup Mode Tests
 * Tests all additional options in detailed setup
 */

import inquirer from 'inquirer';
import { runWizard } from '../src/core/wizard';
import { DetailedSetupAnswers } from '../src/types/wizard';

jest.mock('../src/utils/mcp-detector', () => ({
  detectMCPServers: jest.fn(() => []),
}));

jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});

jest.mock('inquirer');

describe('Detailed Setup Mode', () => {
  const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    mockPrompt.mockReset();
  });

  describe('TypeScript/JavaScript Projects', () => {
    it('should configure Jest + ESLint + npm for TypeScript UI', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'jest',
          linter: 'eslint',
          uiLibrary: 'chakra-ui',
          packageManager: 'npm',
          envVarStrategy: 'yes-with-prod-protection',
          versioningStrategy: 'semantic',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('jest');
      expect(result.linter).toBe('eslint');
      expect(result.uiLibrary).toBe('chakra-ui');
      expect(result.packageManager).toBe('npm');
      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
      expect(result.versioningStrategy).toBe('semantic');
    });

    it('should configure Vitest + pnpm for JavaScript fullstack', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'fullstack', language: 'javascript' })
        .mockResolvedValueOnce({ framework: 'next-js' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'both' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'vitest',
          linter: 'eslint',
          uiLibrary: 'gluestack-ui',
          packageManager: 'pnpm',
          envVarStrategy: 'yes-without-protection',
          versioningStrategy: 'calver',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('vitest');
      expect(result.packageManager).toBe('pnpm');
      expect(result.uiLibrary).toBe('gluestack-ui');
      expect(result.versioningStrategy).toBe('calver');
    });

    it('should configure yarn for TypeScript backend', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'express' })
        .mockResolvedValueOnce({ useGit: false })
        .mockResolvedValueOnce({ aiTool: 'amazon-q' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'jest',
          linter: 'eslint',
          packageManager: 'yarn',
          envVarStrategy: 'no',
          versioningStrategy: 'none',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.packageManager).toBe('yarn');
      expect(result.testingFramework).toBe('jest');
      expect(result.linter).toBe('eslint');
    });
  });

  describe('Python Projects', () => {
    it('should configure pytest + Ruff for Python backend', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'python' })
        .mockResolvedValueOnce({ framework: 'fastapi' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'pytest',
          linter: 'ruff',
          envVarStrategy: 'yes-with-prod-protection',
          versioningStrategy: 'semantic',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('pytest');
      expect(result.linter).toBe('ruff');
      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
    });

    it('should handle Python without testing or linting', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'python' })
        .mockResolvedValueOnce({ framework: 'django' })
        .mockResolvedValueOnce({ useGit: false })
        .mockResolvedValueOnce({ aiTool: 'amazon-q' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'none',
          linter: 'none',
          envVarStrategy: 'no',
          versioningStrategy: 'none',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('none');
      expect(result.linter).toBe('none');
    });
  });

  describe('UI Library Options', () => {
    it('should configure Tailwind CSS', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'vue' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'vitest',
          linter: 'eslint',
          uiLibrary: 'tailwind-css',
          packageManager: 'pnpm',
          envVarStrategy: 'no',
          versioningStrategy: 'none',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.uiLibrary).toBe('tailwind-css');
    });

    it('should configure Material UI', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'fullstack', language: 'javascript' })
        .mockResolvedValueOnce({ framework: 'next-js' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'both' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'jest',
          linter: 'eslint',
          uiLibrary: 'material-ui',
          packageManager: 'yarn',
          envVarStrategy: 'yes-without-protection',
          versioningStrategy: 'calver',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.uiLibrary).toBe('material-ui');
      expect(result.aiTool).toBe('both');
    });
  });

  describe('Environment Variable Strategies', () => {
    it('should configure with production protection', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'nestjs' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'jest',
          linter: 'eslint',
          packageManager: 'npm',
          envVarStrategy: 'yes-with-prod-protection',
          versioningStrategy: 'semantic',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
    });

    it('should configure without protection', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'cli', language: 'javascript' })
        .mockResolvedValueOnce({ framework: 'none' })
        .mockResolvedValueOnce({ useGit: false })
        .mockResolvedValueOnce({ aiTool: 'amazon-q' })
        .mockResolvedValueOnce({ additionalRules: [] })
        .mockResolvedValueOnce({
          testingFramework: 'none',
          linter: 'none',
          packageManager: 'npm',
          envVarStrategy: 'yes-without-protection',
          versioningStrategy: 'none',
        });

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.envVarStrategy).toBe('yes-without-protection');
    });
  });
});
