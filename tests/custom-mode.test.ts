import inquirer from 'inquirer';
import { runWizard } from '../src/core/wizard';
import { detectMCPServers } from '../src/utils/mcp-detector';

jest.mock('../src/utils/mcp-detector');
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});
jest.mock('inquirer');

describe('Custom Mode Tests', () => {
  const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;
  const mockDetectMCPServers = detectMCPServers as jest.MockedFunction<typeof detectMCPServers>;
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
    throw new Error(`process.exit: ${code}`);
  });

  beforeEach(() => {
    mockPrompt.mockReset();
    mockExit.mockClear();
    mockDetectMCPServers.mockReturnValue([
      { name: 'amazon-q-history', path: '/home/user/mcp-servers/amazon-q-history' },
    ]);
  });

  describe('Custom Mode Selection', () => {
    test('allows user to select custom mode', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ 
          selectedRules: ['context-retrieval', 'implementation-approval', 'typescript-validation'] 
        })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history'] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result).toHaveProperty('aiTool', 'kiro-cli');
      expect(result).toHaveProperty('selectedRules');
      expect((result as any).selectedRules).toContain('context-retrieval');
      expect((result as any).selectedRules).toContain('implementation-approval');
      expect((result as any).selectedRules).toContain('typescript-validation');
    });

    test('custom mode with no MCP servers', async () => {
      mockDetectMCPServers.mockReturnValue([]);

      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'amazon-q' })
        .mockResolvedValueOnce({ 
          selectedRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({}) // Empty object when MCP prompt is skipped
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result).toHaveProperty('aiTool', 'amazon-q');
      expect((result as any).mcpServers).toEqual([]);
    });

    test('custom mode with multiple rules selected', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'both' })
        .mockResolvedValueOnce({ 
          selectedRules: [
            'context-retrieval',
            'implementation-approval',
            'typescript-validation',
            'component-structure',
            'git-management',
          ] 
        })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(5);
      expect((result as any).selectedRules).toContain('git-management');
    });
  });

  describe('Review Step - Quick Mode', () => {
    test('quick mode without review proceeds directly', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result).toHaveProperty('projectType', 'ui');
      expect(result).toHaveProperty('language', 'typescript');
    });

    test('quick mode with review allows rule selection', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'python' })
        .mockResolvedValueOnce({ framework: 'fastapi' })
        .mockResolvedValueOnce({ useGit: false })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({ confirmed: true });

      const result = await runWizard();

      expect((result as any).selectedRules).toEqual([
        'context-retrieval',
        'implementation-approval',
      ]);
    });

    test('quick mode review can be cancelled', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({ confirmed: false });

      await expect(runWizard()).rejects.toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Review Step - Detailed Mode', () => {
    test('detailed mode without review proceeds directly', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'fullstack', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'next-js' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ 
          testingFramework: 'jest',
          linter: 'eslint',
          uiLibrary: 'chakra-ui',
          packageManager: 'pnpm',
          envVarStrategy: 'yes-with-prod-protection',
          versioningStrategy: 'semantic',
        })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result).toHaveProperty('testingFramework', 'jest');
      expect(result).toHaveProperty('linter', 'eslint');
    });

    test('detailed mode with review allows rule customization', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'detailed' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'amazon-q' })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history'] })
        .mockResolvedValueOnce({ 
          testingFramework: 'vitest',
          linter: 'eslint',
          uiLibrary: 'gluestack-ui',
          packageManager: 'yarn',
          envVarStrategy: 'no',
          versioningStrategy: 'none',
        })
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: [
            'context-retrieval',
            'implementation-approval',
            'typescript-validation',
            'component-structure',
          ] 
        })
        .mockResolvedValueOnce({ confirmed: true });

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(4);
      expect((result as any).selectedRules).toContain('typescript-validation');
    });
  });

  describe('Review Step - Custom Mode', () => {
    test('custom mode with review allows further customization', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ 
          selectedRules: [
            'context-retrieval',
            'implementation-approval',
            'typescript-validation',
            'git-management',
          ] 
        })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({ confirmed: true });

      const result = await runWizard();

      expect((result as any).selectedRules).toEqual([
        'context-retrieval',
        'implementation-approval',
      ]);
    });

    test('custom mode review can be cancelled', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ 
          selectedRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({ mcpServers: [] })
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: ['context-retrieval'] 
        })
        .mockResolvedValueOnce({ confirmed: false });

      await expect(runWizard()).rejects.toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Edge Cases', () => {
    test('custom mode with all rules selected', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'custom' })
        .mockResolvedValueOnce({ aiTool: 'both' })
        .mockResolvedValueOnce({ 
          selectedRules: [
            'context-retrieval',
            'implementation-approval',
            'package-manager-safety',
            'typescript-validation',
            'component-structure',
            'git-management',
            'visual-verification',
            'multi-environment-management',
            'semantic-versioning',
            'react-props-destructuring',
            'mock-data-strategy',
            'icon-usage-patterns',
            'absolute-imports',
            'chakra-ui-v3-integration',
            'gluestack-ui-v1-themed',
            'eslint-configuration',
            'package-json-management',
          ] 
        })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history'] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(17);
    });

    test('review step with minimal rules (only required)', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'cli', language: 'lua' })
        .mockResolvedValueOnce({}) // No framework prompt (returns empty)
        .mockResolvedValueOnce({ useGit: false })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({}) // No MCP servers
        .mockResolvedValueOnce({ wantsReview: true })
        .mockResolvedValueOnce({ 
          finalRules: ['context-retrieval', 'implementation-approval'] 
        })
        .mockResolvedValueOnce({ confirmed: true });

      const result = await runWizard();

      expect(result).toHaveProperty('selectedRules');
      expect((result as any).selectedRules).toContain('context-retrieval');
      expect((result as any).selectedRules).toContain('implementation-approval');
    });
  });
});
