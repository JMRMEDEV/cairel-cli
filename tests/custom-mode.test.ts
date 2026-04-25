import { detectMCPServers } from '../src/utils/mcp-detector';

const mockSelect = jest.fn();
const mockCheckbox = jest.fn();
const mockConfirm = jest.fn();
jest.mock('@inquirer/prompts', () => ({
  select: (...args: any[]) => mockSelect(...args),
  checkbox: (...args: any[]) => mockCheckbox(...args),
  confirm: (...args: any[]) => mockConfirm(...args),
  Separator: jest.fn((text: string) => ({ type: 'separator', line: text })),
}));

jest.mock('../src/utils/mcp-detector');
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});

import { runWizard } from '../src/core/wizard';

describe('Custom Mode Tests', () => {
  const mockDetectMCPServers = detectMCPServers as jest.MockedFunction<typeof detectMCPServers>;
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
    throw new Error(`process.exit: ${code}`);
  });

  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
    mockExit.mockClear();
    mockDetectMCPServers.mockReturnValue([
      { name: 'amazon-q-history', path: '/home/user/mcp-servers/amazon-q-history' },
    ]);
  });

  describe('Custom Mode Selection', () => {
    test('allows user to select custom mode', async () => {
      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])       // platforms
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval', 'typescript-validation']) // rules
        .mockResolvedValueOnce(['amazon-q-history']); // mcpServers
      mockConfirm
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview

      const result = await runWizard();

      expect(result).toHaveProperty('platforms', ['kiro']);
      expect((result as any).selectedRules).toContain('context-retrieval');
      expect((result as any).selectedRules).toContain('typescript-validation');
    });

    test('custom mode with no MCP servers', async () => {
      mockDetectMCPServers.mockReturnValue([]);

      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['amazon-q'])   // platforms
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval']); // rules, no MCP prompt
      mockConfirm
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview

      const result = await runWizard();

      expect(result).toHaveProperty('platforms', ['amazon-q']);
      expect((result as any).mcpServers).toEqual([]);
    });

    test('custom mode with multiple rules selected', async () => {
      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['kiro', 'amazon-q'])
        .mockResolvedValueOnce([
          'context-retrieval', 'implementation-approval',
          'typescript-validation', 'component-structure', 'git-management',
        ])
        .mockResolvedValueOnce([]); // mcpServers
      mockConfirm
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(5);
      expect((result as any).selectedRules).toContain('git-management');
    });
  });

  describe('Review Step - Quick Mode', () => {
    test('quick mode without review proceeds directly', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('ui')
        .mockResolvedValueOnce('typescript')
        .mockResolvedValueOnce('react');
      mockConfirm
        .mockResolvedValueOnce(true)   // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(false); // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce([]);    // mcpServers

      const result = await runWizard();

      expect(result).toHaveProperty('projectType', 'ui');
      expect(result).toHaveProperty('language', 'typescript');
    });

    test('quick mode with review allows rule selection', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('backend')
        .mockResolvedValueOnce('python')
        .mockResolvedValueOnce('fastapi');
      mockConfirm
        .mockResolvedValueOnce(false)  // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(true);  // confirmed
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce([])     // mcpServers
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval']); // finalRules

      const result = await runWizard();

      expect((result as any).selectedRules).toEqual([
        'context-retrieval',
        'implementation-approval',
      ]);
    });

    test('quick mode review can be cancelled', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('ui')
        .mockResolvedValueOnce('typescript')
        .mockResolvedValueOnce('react');
      mockConfirm
        .mockResolvedValueOnce(true)   // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(false); // confirmed = no
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval']);

      await expect(runWizard()).rejects.toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Review Step - Detailed Mode', () => {
    test('detailed mode without review proceeds directly', async () => {
      mockSelect
        .mockResolvedValueOnce('detailed')
        .mockResolvedValueOnce('fullstack')
        .mockResolvedValueOnce('typescript')
        // no framework select for fullstack
        // detailed selects
        .mockResolvedValueOnce('jest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('chakra-ui')
        .mockResolvedValueOnce('pnpm')
        .mockResolvedValueOnce('yes-with-prod-protection')
        .mockResolvedValueOnce('semantic');
      mockConfirm
        .mockResolvedValueOnce(true)   // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(false); // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce([]);

      const result = await runWizard();

      expect(result).toHaveProperty('testingFramework', 'jest');
      expect(result).toHaveProperty('linter', 'eslint');
    });

    test('detailed mode with review allows rule customization', async () => {
      mockSelect
        .mockResolvedValueOnce('detailed')
        .mockResolvedValueOnce('ui')
        .mockResolvedValueOnce('typescript')
        .mockResolvedValueOnce('react')
        .mockResolvedValueOnce('vitest')
        .mockResolvedValueOnce('eslint')
        .mockResolvedValueOnce('gluestack-ui')
        .mockResolvedValueOnce('yarn')
        .mockResolvedValueOnce('no')
        .mockResolvedValueOnce('none');
      mockConfirm
        .mockResolvedValueOnce(true)   // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(true);  // confirmed
      mockCheckbox
        .mockResolvedValueOnce(['amazon-q'])
        .mockResolvedValueOnce(['amazon-q-history'])
        .mockResolvedValueOnce([
          'context-retrieval', 'implementation-approval',
          'typescript-validation', 'component-structure',
        ]);

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(4);
      expect((result as any).selectedRules).toContain('typescript-validation');
    });
  });

  describe('Review Step - Custom Mode', () => {
    test('custom mode with review allows further customization', async () => {
      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce([
          'context-retrieval', 'implementation-approval',
          'typescript-validation', 'git-management',
        ])
        .mockResolvedValueOnce([])     // mcpServers
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval']); // finalRules
      mockConfirm
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(true);  // confirmed

      const result = await runWizard();

      expect((result as any).selectedRules).toEqual([
        'context-retrieval',
        'implementation-approval',
      ]);
    });

    test('custom mode review can be cancelled', async () => {
      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['context-retrieval']);
      mockConfirm
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(false); // confirmed = no

      await expect(runWizard()).rejects.toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Edge Cases', () => {
    test('custom mode with all rules selected', async () => {
      mockSelect.mockResolvedValueOnce('custom');
      mockCheckbox
        .mockResolvedValueOnce(['kiro', 'amazon-q'])
        .mockResolvedValueOnce([
          'context-retrieval', 'implementation-approval', 'package-manager-safety',
          'typescript-validation', 'component-structure', 'git-management',
          'visual-verification', 'multi-environment-management', 'semantic-versioning',
          'react-props-destructuring', 'mock-data-strategy', 'icon-usage-patterns',
          'absolute-imports', 'chakra-ui-v3-integration', 'gluestack-ui-v1-themed',
          'eslint-configuration', 'package-json-management',
        ])
        .mockResolvedValueOnce(['amazon-q-history']);
      mockConfirm
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await runWizard();

      expect((result as any).selectedRules).toHaveLength(17);
    });

    test('review step with minimal rules (only required)', async () => {
      mockSelect
        .mockResolvedValueOnce('quick')
        .mockResolvedValueOnce('cli')
        .mockResolvedValueOnce('lua');
      // No framework select (cli+lua has only ['None'])
      mockConfirm
        .mockResolvedValueOnce(false)  // useGit
        .mockResolvedValueOnce(true)   // generateAgent
        .mockResolvedValueOnce(true)   // wantsReview
        .mockResolvedValueOnce(true);  // confirmed
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])       // platforms
        .mockResolvedValueOnce([])             // mcpServers
        .mockResolvedValueOnce(['context-retrieval', 'implementation-approval']); // finalRules in review

      const result = await runWizard();

      expect((result as any).selectedRules).toContain('context-retrieval');
      expect((result as any).selectedRules).toContain('implementation-approval');
    });
  });
});
