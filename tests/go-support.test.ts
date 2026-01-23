import { selectRules } from '../src/core/rules-selector';

describe('Go Language Support', () => {
  test('selects Go style rule for Go backend project', async () => {
    const answers = {
      projectType: 'backend',
      language: 'go',
      framework: 'gin',
      useGit: true,
      aiTool: 'kiro-cli',
      mcpServers: [],
      additionalRules: [],
    };

    const rules = await selectRules(answers);

    expect(rules).toContain('go-style-conventions');
    expect(rules).toContain('context-retrieval');
    expect(rules).toContain('implementation-approval');
    expect(rules).toContain('git-management');
  });

  test('selects Go style rule for Go CLI project', async () => {
    const answers = {
      projectType: 'cli',
      language: 'go',
      framework: 'none',
      useGit: false,
      aiTool: 'kiro-cli',
      mcpServers: [],
      additionalRules: [],
    };

    const rules = await selectRules(answers);

    expect(rules).toContain('go-style-conventions');
    expect(rules).toContain('context-retrieval');
    expect(rules).toContain('implementation-approval');
    expect(rules.length).toBeGreaterThanOrEqual(3);
  });
});
