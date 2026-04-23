import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateFiles } from '../src/core/generator';
import { QuickSetupAnswers } from '../src/types/wizard';

// Mock ora
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: '',
  };
  return jest.fn(() => mockSpinner);
});

describe('MCP Server JSON Generation', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-mcp-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('should generate valid JSON without HTML entities', async () => {
    const answers: QuickSetupAnswers = {
      mode: 'quick',
      projectType: 'ui',
      language: 'typescript',
      framework: 'react',
      useGit: true,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: ['gpt', 'web-scraper'],
    };

    await generateFiles(answers, testDir);

    const agentFile = join(testDir, '.kiro', 'agents', 'dev-agent.json');
    const agentContent = await fs.readFile(agentFile, 'utf-8');
    
    // Should not contain HTML entities
    expect(agentContent).not.toContain('&quot;');
    expect(agentContent).not.toContain('&amp;');
    expect(agentContent).not.toContain('&lt;');
    expect(agentContent).not.toContain('&gt;');

    // Should be valid JSON
    const agent = JSON.parse(agentContent);
    
    // Should have mcpServers
    expect(agent.mcpServers).toBeDefined();
    expect(agent.mcpServers.gpt).toBeDefined();
    expect(agent.mcpServers['web-scraper']).toBeDefined();
    
    // Should have proper structure
    expect(agent.mcpServers.gpt.type).toBe('stdio');
    expect(agent.mcpServers.gpt.command).toBe('node');
    expect(agent.mcpServers.gpt.args).toBeInstanceOf(Array);
  });

  test('should handle single MCP server', async () => {
    const answers: QuickSetupAnswers = {
      mode: 'quick',
      projectType: 'backend',
      language: 'python',
      framework: 'none',
      useGit: false,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: ['amazon-q-history'],
    };

    await generateFiles(answers, testDir);

    const agentFile = join(testDir, '.kiro', 'agents', 'dev-agent.json');
    const agentContent = await fs.readFile(agentFile, 'utf-8');
    const agent = JSON.parse(agentContent);

    expect(agent.mcpServers).toBeDefined();
    expect(Object.keys(agent.mcpServers)).toHaveLength(1);
    expect(agent.mcpServers['amazon-q-history']).toBeDefined();
  });

  test('should handle no MCP servers', async () => {
    const answers: QuickSetupAnswers = {
      mode: 'quick',
      projectType: 'cli',
      language: 'lua',
      framework: 'none',
      useGit: false,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: [],
    };

    await generateFiles(answers, testDir);

    const agentFile = join(testDir, '.kiro', 'agents', 'dev-agent.json');
    const agentContent = await fs.readFile(agentFile, 'utf-8');
    const agent = JSON.parse(agentContent);

    // Should not have mcpServers key when empty
    expect(agent.mcpServers).toBeUndefined();
  });

  test('should properly format multiple MCP servers with commas', async () => {
    const answers: QuickSetupAnswers = {
      mode: 'quick',
      projectType: 'ui',
      language: 'typescript',
      framework: 'react',
      useGit: true,
      aiTool: 'kiro-cli',
      platforms: ['kiro'],
      mcpServers: ['amazon-q-history', 'gpt', 'web-scraper', 'cypress', 'chakra-ui'],
    };

    await generateFiles(answers, testDir);

    const agentFile = join(testDir, '.kiro', 'agents', 'dev-agent.json');
    const agentContent = await fs.readFile(agentFile, 'utf-8');
    
    // Should be valid JSON (will throw if malformed)
    const agent = JSON.parse(agentContent);
    
    // Should have all 5 servers
    expect(Object.keys(agent.mcpServers)).toHaveLength(5);
    expect(agent.mcpServers['amazon-q-history']).toBeDefined();
    expect(agent.mcpServers.gpt).toBeDefined();
    expect(agent.mcpServers['web-scraper']).toBeDefined();
    expect(agent.mcpServers.cypress).toBeDefined();
    expect(agent.mcpServers['chakra-ui']).toBeDefined();
  });
});
