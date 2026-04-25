/**
 * Wizard Flow Integration Tests using @inquirer/prompts mocking
 */

import { QuickSetupAnswers, DetailedSetupAnswers } from '../src/types/wizard';

// Mock @inquirer/prompts
const mockSelect = jest.fn();
const mockCheckbox = jest.fn();
const mockConfirm = jest.fn();
jest.mock('@inquirer/prompts', () => ({
  select: (...args: any[]) => mockSelect(...args),
  checkbox: (...args: any[]) => mockCheckbox(...args),
  confirm: (...args: any[]) => mockConfirm(...args),
  Separator: jest.fn((text: string) => ({ type: 'separator', line: text })),
}));

// Mock MCP detector
jest.mock('../src/utils/mcp-detector', () => ({
  detectMCPServers: jest.fn(() => [
    { name: 'amazon-q-history', path: '/mock/path/amazon-q-history' },
    { name: 'gpt', path: '/mock/path/gpt' },
  ]),
}));

// Mock ora spinner
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});

import { runWizard } from '../src/core/wizard';

describe('Wizard Flows with @inquirer/prompts Mocking', () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
  });

  describe('Quick Setup Mode', () => {
    it('should complete UI TypeScript React flow', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')       // mode
        .mockResolvedValueOnce('ui')           // projectType
        .mockResolvedValueOnce('typescript')   // language
        .mockResolvedValueOnce('react');       // framework
      mockConfirm
        .mockResolvedValueOnce(true)           // useGit
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])       // platforms
        .mockResolvedValueOnce(['amazon-q-history', 'gpt']); // mcpServers

      const result = await runWizard();

      expect(result.projectType).toBe('ui');
      expect(result.language).toBe('typescript');
      expect(result.framework).toBe('react');
      expect(result.useGit).toBe(true);
      expect(result.aiTool).toBe('kiro-cli');
      expect(result.platforms).toEqual(['kiro']);
    });

    it('should complete Backend Python flow', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('backend')
        .mockResolvedValueOnce('python')
        .mockResolvedValueOnce('flask');
      mockConfirm
        .mockResolvedValueOnce(true)           // useGit
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce(['amazon-q-history']);

      const result = await runWizard();

      expect(result.projectType).toBe('backend');
      expect(result.language).toBe('python');
      expect(result.useGit).toBe(true);
    });

    it('should complete Fullstack Next.js flow', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('fullstack')
        .mockResolvedValueOnce('typescript');
      // fullstack+typescript has no framework choices (falls through to ['None']), so no framework select
      mockConfirm
        .mockResolvedValueOnce(true)           // useGit
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro', 'amazon-q'])
        .mockResolvedValueOnce(['amazon-q-history', 'gpt']);

      const result = await runWizard();

      expect(result.projectType).toBe('fullstack');
      expect(result.framework).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no MCP servers', async () => {
      const { detectMCPServers } = require('../src/utils/mcp-detector');
      detectMCPServers.mockReturnValueOnce([]);

      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('ui')
        .mockResolvedValueOnce('typescript')
        .mockResolvedValueOnce('react');
      mockConfirm
        .mockResolvedValueOnce(true)           // useGit
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro']);       // platforms only, no MCP prompt

      const result = await runWizard();

      expect(result.mcpServers).toEqual([]);
    });
  });
});
