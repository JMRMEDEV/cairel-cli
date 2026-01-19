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
      mcpServers: ['amazon-q-history'],
    };

    await generateFiles(answers, testDir);

    // Check directories exist
    const rulesDir = join(testDir, '.kiro', 'steering');
    const agentsDir = join(testDir, '.kiro', 'agents');

    expect(await fs.stat(rulesDir)).toBeTruthy();
    expect(await fs.stat(agentsDir)).toBeTruthy();

    // Check agent file exists and has correct content
    const agentFile = join(agentsDir, 'dev-agent.json');
    expect(await fs.stat(agentFile)).toBeTruthy();

    const agentContent = await fs.readFile(agentFile, 'utf-8');
    const agent = JSON.parse(agentContent);

    expect(agent.name).toBe('dev-agent');
    expect(agent.description).toContain('Typescript'); // Note: lowercase 't' from generator
    expect(agent.prompt).toContain('frontend developer');
    expect(agent.prompt).toContain('typescript');
    expect(agent.prompt).toContain('react');

    // Check rules exist and are correct
    const rules = await fs.readdir(rulesDir);
    
    // Always included
    expect(rules).toContain('context-retrieval.md');
    expect(rules).toContain('implementation-approval.md');
    
    // TypeScript specific
    expect(rules).toContain('typescript-validation.md');
    expect(rules).toContain('package-manager-safety.md');
    expect(rules).toContain('package-json-management.md');
    
    // React specific
    expect(rules).toContain('react-props-destructuring.md');
    expect(rules).toContain('component-structure.md');
    
    // Git
    expect(rules).toContain('git-management.md');
    
    // UI specific
    expect(rules).toContain('visual-verification.md');
    expect(rules).toContain('mock-data-strategy.md');
    
    // General rules that match all project types
    expect(rules).toContain('markdown-maintenance.md');
    expect(rules).toContain('development-workflow-meta.md');
    
    // Should NOT have detailed-only rules
    expect(rules).not.toContain('eslint-configuration.md');
    expect(rules).not.toContain('semantic-versioning.md');
    expect(rules).not.toContain('icon-usage-patterns.md'); // Requires UI library
    
    // Should have a reasonable number of rules for UI TypeScript React
    expect(rules.length).toBeGreaterThanOrEqual(10); // At least 10 rules
    expect(rules.length).toBeLessThan(20); // But not all rules

    // Verify rule content (spot check)
    const tsValidationContent = await fs.readFile(
      join(rulesDir, 'typescript-validation.md'),
      'utf-8'
    );
    expect(tsValidationContent).toContain('TypeScript Compilation Validation');
    expect(tsValidationContent).toContain('npx tsc --noEmit');
  });

  it('should generate files for Amazon Q', async () => {
    const answers: QuickSetupAnswers = {
      projectType: 'backend',
      language: 'python',
      framework: 'none',
      useGit: false,
      aiTool: 'amazon-q',
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
