/**
 * Wizard Flow Smoke Tests
 */

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
  detectMCPServers: jest.fn(() => [
    { name: 'amazon-q-history', path: '/mock/path/amazon-q-history' },
    { name: 'gpt', path: '/mock/path/gpt' },
  ]),
}));

jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  }));
});

import { runWizard } from '../src/core/wizard';
import { QuickSetupAnswers } from '../src/types/wizard';

describe('Wizard Smoke Tests', () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
  });

  it('should complete wizard with all default selections', async () => {
    mockSelect
      .mockResolvedValueOnce('quick')
      .mockResolvedValueOnce('ui')
      .mockResolvedValueOnce('typescript')
      .mockResolvedValueOnce('react');
    mockConfirm
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mockCheckbox
      .mockResolvedValueOnce(['kiro'])
      .mockResolvedValueOnce(['amazon-q-history', 'gpt']);

    const result = await runWizard() as QuickSetupAnswers;

    expect(result).toBeDefined();
    expect(result.projectType).toBeDefined();
    expect(result.language).toBeDefined();
    expect(result.framework).toBeDefined();
    expect(result.aiTool).toBeDefined();
  });
});
