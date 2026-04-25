/**
 * Detailed Setup Mode Tests
 */

import { DetailedSetupAnswers } from '../src/types/wizard';

const mockSelect = jest.fn();
const mockCheckbox = jest.fn();
const mockConfirm = jest.fn();
jest.mock('@inquirer/prompts', () => ({
  select: (...args: any[]) => mockSelect(...args),
  checkbox: (...args: any[]) => mockCheckbox(...args),
  confirm: (...args: any[]) => mockConfirm(...args),
  Separator: jest.fn((text: string) => ({ type: 'separator', line: text })),
}));

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

import { runWizard } from '../src/core/wizard';

describe('Detailed Setup Mode', () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
  });

  // Helper: set up quick setup mocks for detailed mode
  function mockQuickSetup(opts: {
    projectType: string; language: string; framework?: string;
    useGit: boolean; platforms: string[]; generateAgent?: boolean;
  }) {
    const s = mockSelect
      .mockResolvedValueOnce('detailed')
      .mockResolvedValueOnce(opts.projectType)
      .mockResolvedValueOnce(opts.language);
    if (opts.framework) {
      s.mockResolvedValueOnce(opts.framework);
    }
    mockConfirm
      .mockResolvedValueOnce(opts.useGit)
      .mockResolvedValueOnce(opts.generateAgent ?? true);
    mockCheckbox
      .mockResolvedValueOnce(opts.platforms);
  }

  describe('TypeScript/JavaScript Projects', () => {
    it('should configure Jest + ESLint + npm for TypeScript UI', async () => {
      mockQuickSetup({ projectType: 'ui', language: 'typescript', framework: 'react', useGit: true, platforms: ['kiro'] });
      // Detailed selects: testing, linter, uiLibrary, packageManager, envVar, versioning
      mockSelect
        .mockResolvedValueOnce('jest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('chakra-ui')
        .mockResolvedValueOnce('npm')
        .mockResolvedValueOnce('yes-with-prod-protection')
        .mockResolvedValueOnce('semantic');
      mockConfirm.mockResolvedValueOnce(false); // wantsReview

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('jest');
      expect(result.linter).toBe('eslint');
      expect(result.uiLibrary).toBe('chakra-ui');
      expect(result.packageManager).toBe('npm');
      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
      expect(result.versioningStrategy).toBe('semantic');
    });

    it('should configure Vitest + pnpm for JavaScript fullstack', async () => {
      mockQuickSetup({ projectType: 'fullstack', language: 'javascript', useGit: true, platforms: ['kiro', 'amazon-q'] });
      mockSelect
        .mockResolvedValueOnce('vitest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('gluestack-ui')
        .mockResolvedValueOnce('pnpm')
        .mockResolvedValueOnce('yes-without-protection')
        .mockResolvedValueOnce('calver');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('vitest');
      expect(result.packageManager).toBe('pnpm');
      expect(result.uiLibrary).toBe('gluestack-ui');
      expect(result.versioningStrategy).toBe('calver');
    });

    it('should configure yarn for TypeScript backend', async () => {
      mockQuickSetup({ projectType: 'backend', language: 'typescript', framework: 'express', useGit: false, platforms: ['amazon-q'] });
      mockSelect
        .mockResolvedValueOnce('jest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('yarn')     // no uiLibrary for backend
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('none');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.packageManager).toBe('yarn');
      expect(result.testingFramework).toBe('jest');
      expect(result.linter).toBe('eslint');
    });
  });

  describe('Python Projects', () => {
    it('should configure pytest + Ruff for Python backend', async () => {
      mockQuickSetup({ projectType: 'backend', language: 'python', framework: 'fastapi', useGit: true, platforms: ['kiro'] });
      mockSelect
        .mockResolvedValueOnce('pytest')
        .mockResolvedValueOnce('ruff')
        .mockResolvedValueOnce('yes-with-prod-protection')  // no uiLibrary, no packageManager
        .mockResolvedValueOnce('semantic');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('pytest');
      expect(result.linter).toBe('ruff');
      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
    });

    it('should handle Python without testing or linting', async () => {
      mockQuickSetup({ projectType: 'backend', language: 'python', framework: 'django', useGit: false, platforms: ['amazon-q'] });
      mockSelect
        .mockResolvedValueOnce('none')
        .mockResolvedValueOnce('none')
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('none');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.testingFramework).toBe('none');
      expect(result.linter).toBe('none');
    });
  });

  describe('UI Library Options', () => {
    it('should configure Tailwind CSS', async () => {
      mockQuickSetup({ projectType: 'ui', language: 'typescript', framework: 'vue', useGit: true, platforms: ['kiro'] });
      mockSelect
        .mockResolvedValueOnce('vitest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('tailwind-css')
        .mockResolvedValueOnce('pnpm')
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('none');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.uiLibrary).toBe('tailwind-css');
    });

    it('should configure Material UI', async () => {
      mockQuickSetup({ projectType: 'fullstack', language: 'javascript', useGit: true, platforms: ['kiro', 'amazon-q'] });
      mockSelect
        .mockResolvedValueOnce('jest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('material-ui')
        .mockResolvedValueOnce('yarn')
        .mockResolvedValueOnce('yes-without-protection')
        .mockResolvedValueOnce('calver');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.uiLibrary).toBe('material-ui');
      expect(result.platforms).toEqual(['kiro', 'amazon-q']);
    });
  });

  describe('Environment Variable Strategies', () => {
    it('should configure with production protection', async () => {
      mockQuickSetup({ projectType: 'backend', language: 'typescript', framework: 'nestjs', useGit: true, platforms: ['kiro'] });
      mockSelect
        .mockResolvedValueOnce('jest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('npm')
        .mockResolvedValueOnce('yes-with-prod-protection')
        .mockResolvedValueOnce('semantic');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.envVarStrategy).toBe('yes-with-prod-protection');
    });

    it('should configure without protection', async () => {
      mockQuickSetup({ projectType: 'cli', language: 'javascript', useGit: false, platforms: ['amazon-q'] });
      mockSelect
        .mockResolvedValueOnce('none')
        .mockResolvedValueOnce('none')
        .mockResolvedValueOnce('npm')
        .mockResolvedValueOnce('yes-without-protection')
        .mockResolvedValueOnce('none');
      mockConfirm.mockResolvedValueOnce(false);

      const result = await runWizard() as DetailedSetupAnswers;

      expect(result.envVarStrategy).toBe('yes-without-protection');
    });
  });
});
