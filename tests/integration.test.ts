import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { QuickSetupAnswers } from '../src/types/wizard';

// Mock ora and chalk
jest.mock('ora', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: '',
  })),
}));

jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    green: jest.fn((str) => str),
    blue: jest.fn((str) => str),
    yellow: jest.fn((str) => str),
    red: jest.fn((str) => str),
    cyan: jest.fn((str) => str),
    gray: jest.fn((str) => str),
    bold: jest.fn((str) => str),
  },
  green: jest.fn((str) => str),
  blue: jest.fn((str) => str),
  yellow: jest.fn((str) => str),
  red: jest.fn((str) => str),
  cyan: jest.fn((str) => str),
  gray: jest.fn((str) => str),
  bold: jest.fn((str) => str),
}));

import { generateFiles } from '../src/core/generator';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('File Generation Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should generate files for UI TypeScript React project', async () => {
    const answers: QuickSetupAnswers = {
      projectType: 'ui',
      language: 'typescript',
      framework: 'react',
      useGit: true,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: ['amazon-q-history'],
    };

    await generateFiles(answers, testDir);

    // Check directories exist
    const skillsDir = join(testDir, '.kiro', 'skills');
    const agentsDir = join(testDir, '.kiro', 'agents');

    expect(await fs.stat(skillsDir)).toBeTruthy();
    expect(await fs.stat(agentsDir)).toBeTruthy();

    // Check agent file exists and has correct content
    const agentFile = join(agentsDir, 'dev-agent.json');
    expect(await fs.stat(agentFile)).toBeTruthy();

    const agentContent = await fs.readFile(agentFile, 'utf-8');
    const agent = JSON.parse(agentContent);

    expect(agent.name).toBe('dev-agent');
    expect(agent.description).toContain('Typescript');
    expect(agent.prompt).toContain('frontend developer');
    expect(agent.prompt).toContain('typescript');
    expect(agent.prompt).toContain('react');

    // Check skill folders exist
    const skills = await fs.readdir(skillsDir);
    
    // Always included
    expect(skills).toContain('context-retrieval');
    expect(skills).toContain('implementation-approval');
    
    // TypeScript specific
    expect(skills).toContain('typescript-validation');
    expect(skills).toContain('package-manager-safety');
    
    // React specific
    expect(skills).toContain('react-props-destructuring');
    expect(skills).toContain('component-structure');
    
    // Git
    expect(skills).toContain('git-management');
    
    // UI specific
    expect(skills).toContain('visual-verification');
    expect(skills).toContain('mock-data-strategy');

    // Each skill should have SKILL.md
    const tsSkillPath = join(skillsDir, 'typescript-validation', 'SKILL.md');
    const tsContent = await fs.readFile(tsSkillPath, 'utf-8');
    expect(tsContent).toContain('TypeScript Compilation Validation');
    expect(tsContent).toContain('npx tsc --noEmit');
    
    expect(skills.length).toBeGreaterThanOrEqual(10);
    expect(skills.length).toBeLessThan(20);
  });

  it('should generate files for Amazon Q', async () => {
    const answers: QuickSetupAnswers = {
      projectType: 'backend',
      language: 'python',
      framework: 'none',
      useGit: false,
      aiTool: 'amazon-q',
      platforms: ['amazon-q'],
      mcpServers: [],
    };

    await generateFiles(answers, testDir);

    // Check Amazon Q directories
    const rulesDir = join(testDir, '.amazonq', 'rules');
    const agentsDir = join(testDir, '.amazonq', 'cli-agents');

    expect(await fs.stat(rulesDir)).toBeTruthy();
    expect(await fs.stat(agentsDir)).toBeTruthy();

    // Check agent content
    const agentFile = join(agentsDir, 'dev-agent.json');
    const agentContent = await fs.readFile(agentFile, 'utf-8');
    const agent = JSON.parse(agentContent);

    expect(agent.name).toBe('dev-agent');
    expect(agent.description).toContain('Backend');
    expect(agent.description).toContain('Python');
    expect(agent.prompt).toContain('backend developer');
    expect(agent.prompt).toContain('python');
    expect(agent.resources).toContain('file://.amazonq/rules/*.md');

    // Check minimal rules (only always-include)
    const rules = await fs.readdir(rulesDir);
    expect(rules).toContain('context-retrieval.md');
    expect(rules).toContain('implementation-approval.md');
    expect(rules).toContain('markdown-maintenance.md');
    expect(rules).toContain('development-workflow-meta.md');
    
    // Should NOT have language/framework specific rules
    expect(rules).not.toContain('typescript-validation.md');
    expect(rules).not.toContain('git-management.md');
    expect(rules).not.toContain('visual-verification.md');
    
    // Should have minimal rules for backend Python
    expect(rules.length).toBeGreaterThanOrEqual(2); // At least always-include
    expect(rules.length).toBeLessThan(10); // But not many

    // Verify rule content
    const contextContent = await fs.readFile(
      join(rulesDir, 'context-retrieval.md'),
      'utf-8'
    );
    expect(contextContent).toContain('Context Retrieval');
    expect(contextContent).toContain('token');
  });
});
