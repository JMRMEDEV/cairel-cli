/**
 * Wizard Flow Integration Tests using Inquirer mocking
 */

import inquirer from 'inquirer';
import { runWizard } from '../src/core/wizard';
import { QuickSetupAnswers, DetailedSetupAnswers } from '../src/types/wizard';

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

// Mock inquirer
jest.mock('inquirer');

describe('Wizard Flows with Inquirer Mocking', () => {
  const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    mockPrompt.mockReset();
  });

  describe('Quick Setup Mode', () => {
    it('should complete UI TypeScript React flow', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history', 'gpt'] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result.projectType).toBe('ui');
      expect(result.language).toBe('typescript');
      expect(result.framework).toBe('react');
      expect(result.useGit).toBe(true);
      expect(result.aiTool).toBe('kiro-cli');
    });

    it('should complete Backend Python flow', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'backend', language: 'python' })
        .mockResolvedValueOnce({ framework: 'flask' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history'] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result.projectType).toBe('backend');
      expect(result.language).toBe('python');
      expect(result.useGit).toBe(true);
    });

    it('should complete Fullstack Next.js flow', async () => {
      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'fullstack', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'next-js' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'both' })
        .mockResolvedValueOnce({ mcpServers: ['amazon-q-history', 'gpt'] })
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result.projectType).toBe('fullstack');
      expect(result.framework).toBe('next-js');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no MCP servers', async () => {
      const { detectMCPServers } = require('../src/utils/mcp-detector');
      detectMCPServers.mockReturnValueOnce([]);

      mockPrompt
        .mockResolvedValueOnce({ mode: 'quick' })
        .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
        .mockResolvedValueOnce({ framework: 'react' })
        .mockResolvedValueOnce({ useGit: true })
        .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
        .mockResolvedValueOnce({}) // No MCP servers
        .mockResolvedValueOnce({ wantsReview: false });

      const result = await runWizard();

      expect(result.mcpServers).toEqual([]);
    });
  });
});

