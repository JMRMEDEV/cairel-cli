import { selectRules } from '../src/core/rules-selector';
import { QuickSetupAnswers, DetailedSetupAnswers } from '../src/types/wizard';

describe('Comprehensive Scenario Testing', () => {
  describe('Quick Setup - Language Variations', () => {
    const baseAnswers = {
      projectType: 'ui' as const,
      framework: 'react' as const,
      useGit: true,
      aiTool: 'kiro-cli' as const,
      mcpServers: [],
    };

    it('TypeScript + React', async () => {
      const rules = await selectRules({ ...baseAnswers, language: 'typescript' });
      
      expect(rules).toContain('typescript-validation');
      expect(rules).toContain('component-structure');
      expect(rules).toContain('package-manager-safety');
      expect(rules).toContain('react-props-destructuring');
    });

    it('JavaScript + React', async () => {
      const rules = await selectRules({ ...baseAnswers, language: 'javascript' });
      
      expect(rules).not.toContain('typescript-validation');
      expect(rules).toContain('component-structure');
      expect(rules).toContain('package-manager-safety');
      expect(rules).toContain('react-props-destructuring');
    });

    it('Python (no React rules)', async () => {
      const rules = await selectRules({ ...baseAnswers, language: 'python', framework: 'none' });
      
      expect(rules).not.toContain('typescript-validation');
      expect(rules).not.toContain('component-structure');
      expect(rules).not.toContain('package-manager-safety');
      expect(rules).not.toContain('react-props-destructuring');
    });
  });

  describe('Quick Setup - Framework Variations', () => {
    const baseAnswers = {
      projectType: 'ui' as const,
      language: 'typescript' as const,
      useGit: true,
      aiTool: 'kiro-cli' as const,
      mcpServers: [],
    };

    it('React', async () => {
      const rules = await selectRules({ ...baseAnswers, framework: 'react' });
      
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');
    });

    it('React Native', async () => {
      const rules = await selectRules({ ...baseAnswers, framework: 'react-native' });
      
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');
    });

    it('Next.js', async () => {
      const rules = await selectRules({ ...baseAnswers, framework: 'next-js' });
      
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');
    });

    it('Vue (no React rules)', async () => {
      const rules = await selectRules({ ...baseAnswers, framework: 'vue' });
      
      expect(rules).not.toContain('react-props-destructuring');
      expect(rules).not.toContain('component-structure');
    });
  });

  describe('Quick Setup - Project Type Variations', () => {
    const baseAnswers = {
      language: 'typescript' as const,
      framework: 'none' as const,
      useGit: true,
      aiTool: 'kiro-cli' as const,
      mcpServers: [],
    };

    it('UI project', async () => {
      const rules = await selectRules({ ...baseAnswers, projectType: 'ui' });
      
      expect(rules).toContain('visual-verification');
      expect(rules).toContain('mock-data-strategy');
    });

    it('Backend project', async () => {
      const rules = await selectRules({ ...baseAnswers, projectType: 'backend' });
      
      expect(rules).not.toContain('visual-verification');
      expect(rules).not.toContain('mock-data-strategy');
    });

    it('Fullstack project', async () => {
      const rules = await selectRules({ ...baseAnswers, projectType: 'fullstack' });
      
      expect(rules).toContain('visual-verification');
      expect(rules).toContain('mock-data-strategy');
    });

    it('CLI project', async () => {
      const rules = await selectRules({ ...baseAnswers, projectType: 'cli' });
      
      expect(rules).not.toContain('visual-verification');
      expect(rules).not.toContain('mock-data-strategy');
    });
  });

  describe('Quick Setup - Git Variations', () => {
    const baseAnswers = {
      projectType: 'backend' as const,
      language: 'typescript' as const,
      framework: 'none' as const,
      aiTool: 'kiro-cli' as const,
      mcpServers: [],
    };

    it('With Git', async () => {
      const rules = await selectRules({ ...baseAnswers, useGit: true });
      expect(rules).toContain('git-management');
    });

    it('Without Git', async () => {
      const rules = await selectRules({ ...baseAnswers, useGit: false });
      expect(rules).not.toContain('git-management');
    });
  });

  describe('Detailed Setup - Additional Options', () => {
    const baseAnswers: DetailedSetupAnswers = {
      projectType: 'ui' as const,
      language: 'typescript' as const,
      framework: 'react' as const,
      useGit: true,
      aiTool: 'kiro-cli' as const,
      mcpServers: [],
      testingFramework: 'none' as const,
      linter: 'none' as const,
      envVarStrategy: 'no' as const,
      versioningStrategy: 'none' as const,
    };

    it('With ESLint', async () => {
      const rules = await selectRules({ ...baseAnswers, linter: 'eslint' });
      expect(rules).toContain('eslint-configuration');
    });

    it('Without ESLint', async () => {
      const rules = await selectRules({ ...baseAnswers, linter: 'none' });
      expect(rules).not.toContain('eslint-configuration');
    });

    it('With Semantic Versioning', async () => {
      const rules = await selectRules({ ...baseAnswers, versioningStrategy: 'semantic' });
      expect(rules).toContain('semantic-versioning');
    });

    it('Without Semantic Versioning', async () => {
      const rules = await selectRules({ ...baseAnswers, versioningStrategy: 'none' });
      expect(rules).not.toContain('semantic-versioning');
    });

    it('With Chakra UI', async () => {
      const rules = await selectRules({ ...baseAnswers, uiLibrary: 'chakra-ui' });
      expect(rules).toContain('chakra-ui-v3-integration');
    });

    it('With GlueStack UI', async () => {
      const rules = await selectRules({ ...baseAnswers, uiLibrary: 'gluestack-ui' });
      expect(rules).toContain('gluestack-ui-v1-themed');
    });

    it('Without UI Library', async () => {
      const rules = await selectRules({ ...baseAnswers, uiLibrary: 'none' });
      expect(rules).not.toContain('chakra-ui-v3-integration');
      expect(rules).not.toContain('gluestack-ui-v1-themed');
    });

    it('With Environment Variables (protected)', async () => {
      const rules = await selectRules({ ...baseAnswers, envVarStrategy: 'yes-with-prod-protection' });
      expect(rules).toContain('multi-environment-management');
    });

    it('With Environment Variables (unprotected)', async () => {
      const rules = await selectRules({ ...baseAnswers, envVarStrategy: 'yes-without-protection' });
      expect(rules).toContain('multi-environment-management');
    });

    it('Without Environment Variables', async () => {
      const rules = await selectRules({ ...baseAnswers, envVarStrategy: 'no' });
      expect(rules).not.toContain('multi-environment-management');
    });
  });

  describe('Real-World Scenarios', () => {
    it('Full-stack Next.js TypeScript with all features', async () => {
      const answers: DetailedSetupAnswers = {
        projectType: 'fullstack',
        language: 'typescript',
        framework: 'next-js',
        useGit: true,
        aiTool: 'kiro-cli',
        mcpServers: ['amazon-q-history'],
        testingFramework: 'jest',
        linter: 'eslint',
        uiLibrary: 'chakra-ui',
        packageManager: 'pnpm',
        envVarStrategy: 'yes-with-prod-protection',
        versioningStrategy: 'semantic',
      };

      const rules = await selectRules(answers);

      // Should have comprehensive rule set
      expect(rules).toContain('context-retrieval');
      expect(rules).toContain('implementation-approval');
      expect(rules).toContain('typescript-validation');
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');
      expect(rules).toContain('git-management');
      expect(rules).toContain('visual-verification');
      expect(rules).toContain('eslint-configuration');
      expect(rules).toContain('chakra-ui-v3-integration');
      expect(rules).toContain('multi-environment-management');
      expect(rules).toContain('semantic-versioning');
      
      expect(rules.length).toBeGreaterThan(10);
    });

    it('Simple Python backend with minimal setup', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'backend',
        language: 'python',
        framework: 'fastapi',
        useGit: false,
        aiTool: 'amazon-q',
        mcpServers: [],
      };

      const rules = await selectRules(answers);

      // Should have minimal rule set
      expect(rules).toContain('context-retrieval');
      expect(rules).toContain('implementation-approval');
      expect(rules).toContain('markdown-maintenance');
      expect(rules).toContain('development-workflow-meta');
      
      // Should have always-include + rules matching backend project type
      expect(rules.length).toBeGreaterThanOrEqual(2); // At least always-include
      expect(rules.length).toBeLessThan(10); // But not all rules
    });

    it('React Native TypeScript mobile app', async () => {
      const answers: DetailedSetupAnswers = {
        projectType: 'ui',
        language: 'typescript',
        framework: 'react-native',
        useGit: true,
        aiTool: 'kiro-cli',
        mcpServers: [],
        testingFramework: 'jest',
        linter: 'eslint',
        uiLibrary: 'gluestack-ui',
        packageManager: 'yarn',
        envVarStrategy: 'yes-with-prod-protection',
        versioningStrategy: 'semantic',
      };

      const rules = await selectRules(answers);

      expect(rules).toContain('typescript-validation');
      expect(rules).toContain('react-props-destructuring');
      expect(rules).toContain('component-structure');
      expect(rules).toContain('gluestack-ui-v1-themed');
      expect(rules).toContain('visual-verification');
      expect(rules).toContain('eslint-configuration');
    });
  });
});
