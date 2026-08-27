import { selectDirectives } from '../src/core/directives-selector';

describe('Go Language Support', () => {
  test('selects Go style directive for Go backend project', async () => {
    const answers = {
      projectType: 'backend',
      language: 'go',
      framework: 'gin',
      useGit: true,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: [],
      additionalRules: [],
    };

    const directives = await selectDirectives(answers);

    expect(directives).toContain('go-style-conventions');
    expect(directives).toContain('context-retrieval');
    expect(directives).toContain('implementation-approval');
    expect(directives).toContain('git-management');
  });

  test('selects Go style directive for Go CLI project', async () => {
    const answers = {
      projectType: 'cli',
      language: 'go',
      framework: 'none',
      useGit: false,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: [],
      additionalRules: [],
    };

    const directives = await selectDirectives(answers);

    expect(directives).toContain('go-style-conventions');
    expect(directives).toContain('context-retrieval');
    expect(directives).toContain('implementation-approval');
    expect(directives.length).toBeGreaterThanOrEqual(3);
  });
});
