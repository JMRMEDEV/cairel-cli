import { selectRules } from '../src/core/rules-selector';
import { QuickSetupAnswers } from '../src/types/wizard';

describe('Rules Selector', () => {
  describe('UI TypeScript React with Git', () => {
    it('should select correct rules', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'ui',
        language: 'typescript',
        framework: 'react',
        useGit: true,
        aiTool: 'kiro-cli',
        mcpServers: ['amazon-q-history'],
      };

      const rules = await selectRules(answers);

      // Always included
      expect(rules).toContain('context-retrieval');
      expect(rules).toContain('implementation-approval');

      // TypeScript
      expect(rules).toContain('typescript-validation');
      expect(rules).toContain('package-manager-safety');
      expect(rules).toContain('package-json-management');

      // React
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');

      // Git
      expect(rules).toContain('git-management');

      // UI
      expect(rules).toContain('visual-verification');
      expect(rules).toContain('mock-data-strategy');

      // Should NOT include detailed-only rules
      expect(rules).not.toContain('eslint-configuration');
      expect(rules).not.toContain('semantic-versioning');
      expect(rules).not.toContain('chakra-ui-v3-integration');
    });
  });

  describe('Backend Python without Git', () => {
    it('should select only always-include rules', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'backend',
        language: 'python',
        framework: 'fastapi',
        useGit: false,
        aiTool: 'amazon-q',
        mcpServers: [],
      };

      const rules = await selectRules(answers);

      // Only always-included rules
      expect(rules).toContain('context-retrieval');
      expect(rules).toContain('implementation-approval');

      // Should NOT include language-specific rules
      expect(rules).not.toContain('typescript-validation');
      expect(rules).not.toContain('package-manager-safety');
      expect(rules).not.toContain('git-management');
      expect(rules).not.toContain('visual-verification');

      expect(rules.length).toBe(2);
    });
  });

  describe('Additional rules', () => {
    it('should include user-selected additional rules', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'backend',
        language: 'python',
        framework: 'none',
        useGit: false,
        aiTool: 'kiro-cli',
        mcpServers: [],
        additionalRules: ['absolute-imports'],
      };

      const rules = await selectRules(answers);

      expect(rules).toContain('context-retrieval');
      expect(rules).toContain('implementation-approval');
      expect(rules).toContain('absolute-imports');
      expect(rules.length).toBe(3);
    });
  });
});
