/**
 * Tests for TASK-014: Wizard enforcement selection step
 * Covers all three wizard modes: quick, detailed, custom
 */

import { EnforcementLevel, EnforcementOverrides } from '../src/types/wizard';

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
  detectMCPServers: jest.fn(() => []),
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

import {
  selectEnforcementQuick,
  selectEnforcementDetailed,
  selectEnforcementCustom,
  selectEnforcement,
  getDefaultEnforcement,
} from '../src/core/enforcement-selector';
import { DirectivesManifest } from '../src/core/directives-selector';

// Sample manifest for testing
const testManifest: DirectivesManifest = {
  directives: [
    {
      id: 'context-retrieval',
      title: 'Context Retrieval',
      description: 'Token optimization',
      category: 'general',
      alwaysInclude: true,
      enforcement: 'contextual',
    },
    {
      id: 'conventional-commits',
      title: 'Conventional Commits',
      description: 'Commit format',
      category: 'git',
      alwaysInclude: false,
      enforcement: 'enforced',
      conditions: { requiresGit: true },
    },
    {
      id: 'chakra-ui-v3-integration',
      title: 'Chakra UI v3',
      description: 'Chakra integration',
      category: 'ui',
      alwaysInclude: false,
      enforcement: 'available',
      conditions: { uiLibrary: ['chakra-ui'] },
    },
    {
      id: 'typescript-validation',
      title: 'TypeScript Validation',
      description: 'TS strict mode',
      category: 'typescript',
      alwaysInclude: false,
      enforcement: 'enforced',
      conditions: { languages: ['typescript'] },
    },
    {
      id: 'git-management',
      title: 'Git Management',
      description: 'Safe git ops',
      category: 'git',
      alwaysInclude: false,
      enforcement: 'contextual',
      conditions: { requiresGit: true },
    },
  ],
};

const testDirectiveIds = [
  'context-retrieval',
  'conventional-commits',
  'chakra-ui-v3-integration',
  'typescript-validation',
  'git-management',
];

describe('Enforcement Selector', () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
  });

  describe('getDefaultEnforcement', () => {
    it('should return manifest defaults for known directives', () => {
      const defaults = getDefaultEnforcement(testDirectiveIds, testManifest);

      expect(defaults['context-retrieval']).toBe('contextual');
      expect(defaults['conventional-commits']).toBe('enforced');
      expect(defaults['chakra-ui-v3-integration']).toBe('available');
      expect(defaults['typescript-validation']).toBe('enforced');
      expect(defaults['git-management']).toBe('contextual');
    });

    it('should default to contextual for unknown directives', () => {
      const defaults = getDefaultEnforcement(['unknown-directive'], testManifest);
      expect(defaults['unknown-directive']).toBe('contextual');
    });

    it('should handle empty directive list', () => {
      const defaults = getDefaultEnforcement([], testManifest);
      expect(defaults).toEqual({});
    });
  });

  describe('Quick Mode (selectEnforcementQuick)', () => {
    it('should return defaults without any prompts', () => {
      const result = selectEnforcementQuick(testDirectiveIds, testManifest);

      // No prompts should be called
      expect(mockSelect).not.toHaveBeenCalled();
      expect(mockCheckbox).not.toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();

      // Should return manifest defaults
      expect(result['context-retrieval']).toBe('contextual');
      expect(result['conventional-commits']).toBe('enforced');
      expect(result['chakra-ui-v3-integration']).toBe('available');
    });

    it('should produce zero extra prompts (acceptance criteria)', () => {
      selectEnforcementQuick(testDirectiveIds, testManifest);

      expect(mockSelect).toHaveBeenCalledTimes(0);
      expect(mockCheckbox).toHaveBeenCalledTimes(0);
      expect(mockConfirm).toHaveBeenCalledTimes(0);
    });
  });

  describe('Detailed Mode (selectEnforcementDetailed)', () => {
    it('should show summary and accept defaults', async () => {
      mockSelect.mockResolvedValueOnce('accept');

      const result = await selectEnforcementDetailed(testDirectiveIds, testManifest);

      // Should have asked accept/customize
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Accept default enforcement levels or customize?',
      }));

      // Should return defaults
      expect(result['context-retrieval']).toBe('contextual');
      expect(result['conventional-commits']).toBe('enforced');
      expect(result['chakra-ui-v3-integration']).toBe('available');
    });

    it('should allow customization when user chooses customize', async () => {
      // User chooses to customize
      mockSelect
        .mockResolvedValueOnce('customize')     // Accept defaults or customize?
        .mockResolvedValueOnce('enforced')       // Move to which level?
        .mockResolvedValueOnce('done');          // Continue customizing?

      // User selects directives to move to enforced
      mockCheckbox.mockResolvedValueOnce(['context-retrieval', 'git-management']);

      const result = await selectEnforcementDetailed(testDirectiveIds, testManifest);

      // Should have moved selected directives to enforced
      expect(result['context-retrieval']).toBe('enforced');
      expect(result['git-management']).toBe('enforced');
      // Others unchanged
      expect(result['conventional-commits']).toBe('enforced');
      expect(result['chakra-ui-v3-integration']).toBe('available');
    });

    it('should allow multiple rounds of customization', async () => {
      mockSelect
        .mockResolvedValueOnce('customize')     // Accept defaults or customize?
        .mockResolvedValueOnce('available')      // Move to which level?
        .mockResolvedValueOnce('continue')       // Continue customizing?
        .mockResolvedValueOnce('enforced')       // Move to which level?
        .mockResolvedValueOnce('done');          // Continue customizing?

      mockCheckbox
        .mockResolvedValueOnce(['context-retrieval'])   // Move to available
        .mockResolvedValueOnce(['git-management']);     // Move to enforced

      const result = await selectEnforcementDetailed(testDirectiveIds, testManifest);

      expect(result['context-retrieval']).toBe('available');
      expect(result['git-management']).toBe('enforced');
    });

    it('should show enforcement summary (acceptance criteria)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockSelect.mockResolvedValueOnce('accept');

      await selectEnforcementDetailed(testDirectiveIds, testManifest);

      // Check that summary was displayed
      const logCalls = consoleSpy.mock.calls.map(c => c[0]).join('\n');
      expect(logCalls).toContain('Enforcement Level Summary');

      consoleSpy.mockRestore();
    });
  });

  describe('Custom Mode (selectEnforcementCustom)', () => {
    it('should ask enforcement level for each directive', async () => {
      // Mock each directive's enforcement selection
      mockSelect
        .mockResolvedValueOnce('enforced')       // context-retrieval
        .mockResolvedValueOnce('contextual')     // conventional-commits
        .mockResolvedValueOnce('available')      // chakra-ui-v3-integration
        .mockResolvedValueOnce('enforced')       // typescript-validation
        .mockResolvedValueOnce('contextual');    // git-management

      const result = await selectEnforcementCustom(testDirectiveIds, testManifest);

      expect(mockSelect).toHaveBeenCalledTimes(5);
      expect(result['context-retrieval']).toBe('enforced');
      expect(result['conventional-commits']).toBe('contextual');
      expect(result['chakra-ui-v3-integration']).toBe('available');
      expect(result['typescript-validation']).toBe('enforced');
      expect(result['git-management']).toBe('contextual');
    });

    it('should show directive ID with default in prompt', async () => {
      mockSelect
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('contextual');

      await selectEnforcementCustom(testDirectiveIds, testManifest);

      // Verify the first call has directive ID in message
      expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('context-retrieval'),
      }));
    });

    it('should allow per-directive enforcement selection (acceptance criteria)', async () => {
      // All set to available
      mockSelect
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('available')
        .mockResolvedValueOnce('available');

      const result = await selectEnforcementCustom(testDirectiveIds, testManifest);

      // All should be available
      for (const id of testDirectiveIds) {
        expect(result[id]).toBe('available');
      }
    });
  });

  describe('selectEnforcement (main entry)', () => {
    it('should route quick mode correctly (no prompts)', async () => {
      const result = await selectEnforcement('quick', testDirectiveIds, testManifest);

      expect(mockSelect).not.toHaveBeenCalled();
      expect(result['context-retrieval']).toBe('contextual');
    });

    it('should route detailed mode correctly', async () => {
      mockSelect.mockResolvedValueOnce('accept');

      const result = await selectEnforcement('detailed', testDirectiveIds, testManifest);

      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(result['conventional-commits']).toBe('enforced');
    });

    it('should route custom mode correctly', async () => {
      mockSelect
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('enforced')
        .mockResolvedValueOnce('enforced');

      const result = await selectEnforcement('custom', testDirectiveIds, testManifest);

      expect(mockSelect).toHaveBeenCalledTimes(5);
      for (const id of testDirectiveIds) {
        expect(result[id]).toBe('enforced');
      }
    });
  });
});

describe('Enforcement integration with Wizard', () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockCheckbox.mockReset();
    mockConfirm.mockReset();
  });

  describe('Quick mode wizard flow', () => {
    it('should include enforcementOverrides in answers without extra prompts', async () => {
      const { runWizard } = require('../src/core/wizard');

      // Quick mode flow
      mockSelect
        .mockResolvedValueOnce('quick')        // mode
        .mockResolvedValueOnce('ui')           // projectType
        .mockResolvedValueOnce('typescript')   // language
        .mockResolvedValueOnce('react');       // framework
      mockConfirm
        .mockResolvedValueOnce(true)           // useGit
        .mockResolvedValueOnce(true)           // generateAgent
        .mockResolvedValueOnce(false);         // wantsReview
      mockCheckbox
        .mockResolvedValueOnce(['kiro'])       // platforms
        .mockResolvedValueOnce([]);            // mcpServers (empty - no servers detected)

      const result = await runWizard();

      expect(result.mode).toBe('quick');
      expect(result.enforcementOverrides).toBeDefined();
      expect(typeof result.enforcementOverrides).toBe('object');
      // Quick mode should NOT ask any enforcement-related questions
      // All select calls should be for: mode, projectType, language, framework
      const selectCalls = mockSelect.mock.calls;
      const enforcementCalls = selectCalls.filter((call: any) =>
        call[0]?.message?.includes('enforcement') ||
        call[0]?.message?.includes('Enforcement')
      );
      expect(enforcementCalls).toHaveLength(0);
    });
  });

  describe('Enforcement overrides in generator', () => {
    it('should respect enforcementOverrides from answers', async () => {
      const { generateFiles } = require('../src/core/generator');
      const { promises: fs } = require('fs');
      const { join } = require('path');
      const os = require('os');
      const path = require('path');

      const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'cairel-enforce-test-'));

      try {
        // Simulate answers with enforcement overrides
        const answers = {
          mode: 'custom' as const,
          aiTool: 'kiro-cli' as const,
          platforms: ['kiro' as const],
          selectedRules: ['context-retrieval'],
          mcpServers: [],
          generateAgent: false,
          enforcementOverrides: {
            'context-retrieval': 'enforced' as EnforcementLevel,
          },
        };

        await generateFiles(answers, tmpDir);

        // context-retrieval is normally 'contextual' in manifest,
        // but we overrode to 'enforced', so it should be in .kiro/steering/
        const enforcedPath = join(tmpDir, '.kiro', 'steering', 'context-retrieval.md');
        const exists = await fs.access(enforcedPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // Should NOT be in .kiro/skills/
        const skillPath = join(tmpDir, '.kiro', 'skills', 'context-retrieval', 'SKILL.md');
        const skillExists = await fs.access(skillPath).then(() => true).catch(() => false);
        expect(skillExists).toBe(false);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });

    it('should fall back to manifest defaults when no overrides', async () => {
      const { generateFiles } = require('../src/core/generator');
      const { promises: fs } = require('fs');
      const { join } = require('path');
      const os = require('os');

      const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'cairel-enforce-test-'));

      try {
        const answers = {
          mode: 'custom' as const,
          aiTool: 'kiro-cli' as const,
          platforms: ['kiro' as const],
          selectedRules: ['context-retrieval'],
          mcpServers: [],
          generateAgent: false,
          // No enforcementOverrides — should use manifest default ('contextual')
        };

        await generateFiles(answers, tmpDir);

        // context-retrieval default is 'contextual' → .kiro/steering/ with auto inclusion
        const steeringPath = join(tmpDir, '.kiro', 'steering', 'context-retrieval.md');
        const exists = await fs.access(steeringPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // Read content and verify inclusion: auto
        const content = await fs.readFile(steeringPath, 'utf-8');
        expect(content).toContain('inclusion: auto');
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });

    it('should use override to set available level', async () => {
      const { generateFiles } = require('../src/core/generator');
      const { promises: fs } = require('fs');
      const { join } = require('path');
      const os = require('os');

      const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'cairel-enforce-test-'));

      try {
        const answers = {
          mode: 'custom' as const,
          aiTool: 'kiro-cli' as const,
          platforms: ['kiro' as const],
          selectedRules: ['conventional-commits'],
          mcpServers: [],
          generateAgent: false,
          enforcementOverrides: {
            'conventional-commits': 'available' as EnforcementLevel,
          },
        };

        await generateFiles(answers, tmpDir);

        // conventional-commits normally 'enforced' → .kiro/steering/
        // But overridden to 'available' → .kiro/skills/
        const skillPath = join(tmpDir, '.kiro', 'skills', 'conventional-commits', 'SKILL.md');
        const exists = await fs.access(skillPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);

        // Should NOT be in steering
        const steeringPath = join(tmpDir, '.kiro', 'steering', 'conventional-commits.md');
        const steeringExists = await fs.access(steeringPath).then(() => true).catch(() => false);
        expect(steeringExists).toBe(false);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
