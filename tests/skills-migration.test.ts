import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { QuickSetupAnswers } from '../src/types/wizard';

// Mock @inquirer/prompts (ESM module)
jest.mock('@inquirer/prompts', () => ({
  select: jest.fn(),
  checkbox: jest.fn(),
  confirm: jest.fn(),
  Separator: jest.fn(),
}));

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
    green: jest.fn((s: string) => s), blue: jest.fn((s: string) => s),
    yellow: jest.fn((s: string) => s), red: jest.fn((s: string) => s),
    cyan: jest.fn((s: string) => s), gray: jest.fn((s: string) => s),
    bold: jest.fn((s: string) => s),
  },
  green: jest.fn((s: string) => s), blue: jest.fn((s: string) => s),
  yellow: jest.fn((s: string) => s), red: jest.fn((s: string) => s),
  cyan: jest.fn((s: string) => s), gray: jest.fn((s: string) => s),
  bold: jest.fn((s: string) => s),
}));

import { generateFiles } from '../src/core/generator';
import { Validator } from '../src/core/validator';

describe('Skills Migration (v2.0)', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-skills-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Multi-Platform Output', () => {
    it('should generate skill folders for Kiro, Claude Code, and Copilot simultaneously', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'ui', language: 'typescript', framework: 'react',
        useGit: true, aiTool: 'kiro-cli', platforms: ['kiro', 'claude-code', 'github-copilot'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      // All three platforms get skill folders
      for (const dir of ['.kiro/skills', '.claude/skills', '.github/skills']) {
        const skills = await fs.readdir(join(testDir, dir));
        expect(skills.length).toBeGreaterThanOrEqual(10);
        expect(skills).toContain('typescript-validation');
        expect(skills).toContain('context-retrieval');

        // Each skill is a folder with SKILL.md
        const skillFile = join(testDir, dir, 'typescript-validation', 'SKILL.md');
        expect(await fs.stat(skillFile)).toBeTruthy();
        const content = await fs.readFile(skillFile, 'utf-8');
        expect(content).toContain('name: typescript-validation');
      }
    });

    it('should generate agent JSON only for Kiro (not Claude/Copilot)', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'backend', language: 'typescript', framework: 'express',
        useGit: false, aiTool: 'kiro-cli', platforms: ['kiro', 'claude-code'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      // Kiro gets agent JSON
      const kiroAgent = join(testDir, '.kiro', 'agents', 'dev-agent.json');
      expect(await fs.stat(kiroAgent)).toBeTruthy();

      // Claude Code does NOT get agent JSON in a separate agents dir
      const claudeAgentDir = join(testDir, '.claude', 'agents');
      await expect(fs.stat(claudeAgentDir)).rejects.toThrow();
    });

    it('should use skill:// URI for Kiro agent resources', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'ui', language: 'typescript', framework: 'react',
        useGit: false, aiTool: 'kiro-cli', platforms: ['kiro'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      const agent = JSON.parse(await fs.readFile(join(testDir, '.kiro', 'agents', 'dev-agent.json'), 'utf-8'));
      expect(agent.resources).toContain('skill://.kiro/skills/*/SKILL.md');
    });

    it('should use file:// URI for Amazon Q agent resources', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'backend', language: 'python', framework: 'none',
        useGit: false, aiTool: 'amazon-q', platforms: ['amazon-q'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      const agent = JSON.parse(await fs.readFile(join(testDir, '.amazonq', 'cli-agents', 'dev-agent.json'), 'utf-8'));
      expect(agent.resources).toContain('file://.amazonq/rules/*.md');
    });
  });

  describe('Amazon Q Legacy Flat Format', () => {
    it('should generate flat .md files (not skill folders) for Amazon Q', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'ui', language: 'typescript', framework: 'react',
        useGit: true, aiTool: 'amazon-q', platforms: ['amazon-q'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      const rulesDir = join(testDir, '.amazonq', 'rules');
      const files = await fs.readdir(rulesDir);

      // All entries are .md files, not directories
      for (const file of files) {
        expect(file).toMatch(/\.md$/);
        const stat = await fs.stat(join(rulesDir, file));
        expect(stat.isFile()).toBe(true);
      }
    });
  });

  describe('Skills Validation', () => {
    const validator = new Validator();

    it('should validate all curated skills', async () => {
      const skillsDir = join(__dirname, '..', 'curated-presets', 'skills');
      const results = await validator.validateSkillsDirectory(skillsDir);

      expect(results.size).toBeGreaterThanOrEqual(24);
      for (const [name, result] of results) {
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should validate generated skill folders', async () => {
      await generateFiles({
        projectType: 'ui', language: 'typescript', framework: 'react',
        useGit: true, aiTool: 'kiro-cli', platforms: ['kiro'], mcpServers: [],
      } as QuickSetupAnswers, testDir);

      const results = await validator.validateSkillsDirectory(join(testDir, '.kiro', 'skills'));
      expect(results.size).toBeGreaterThanOrEqual(10);
      for (const [, result] of results) {
        expect(result.valid).toBe(true);
      }
    });

    it('should detect invalid skill name format', async () => {
      const badSkillDir = join(testDir, 'Bad-Skill');
      await fs.mkdir(badSkillDir, { recursive: true });
      await fs.writeFile(join(badSkillDir, 'SKILL.md'), `---
name: Bad-Skill
description: Invalid name with uppercase
---
# Bad Skill`);

      const result = await validator.validateSkill(badSkillDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should detect skill name not matching directory', async () => {
      const mismatchDir = join(testDir, 'wrong-dir');
      await fs.mkdir(mismatchDir, { recursive: true });
      await fs.writeFile(join(mismatchDir, 'SKILL.md'), `---
name: correct-name
description: Name does not match directory
---
# Mismatch`);

      const result = await validator.validateSkill(mismatchDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('does not match'))).toBe(true);
    });

    it('should detect missing SKILL.md', async () => {
      const emptyDir = join(testDir, 'empty-skill');
      await fs.mkdir(emptyDir, { recursive: true });

      const result = await validator.validateSkill(emptyDir);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing SKILL.md'))).toBe(true);
    });
  });

  describe('Manifest from Skills', () => {
    it('should generate manifest with correct fields from skills', () => {
      const manifestPath = join(__dirname, '..', 'curated-presets', 'rules-manifest.json');
      const manifest = require(manifestPath);

      expect(manifest.rules.length).toBeGreaterThanOrEqual(24);

      // Check always-include skills
      const contextRetrieval = manifest.rules.find((r: any) => r.id === 'context-retrieval');
      expect(contextRetrieval.alwaysInclude).toBe(true);
      expect(contextRetrieval.category).toBe('general');
      expect(contextRetrieval.title).toContain('Context Retrieval');

      // Check conditional skill
      const tsValidation = manifest.rules.find((r: any) => r.id === 'typescript-validation');
      expect(tsValidation.alwaysInclude).toBe(false);
      expect(tsValidation.conditions.languages).toContain('typescript');
      expect(tsValidation.category).toBe('typescript');

      // Check Go skill
      const goStyle = manifest.rules.find((r: any) => r.id === 'go-style-conventions');
      expect(goStyle.conditions.languages).toContain('go');
      expect(goStyle.category).toBe('golang');
    });
  });
});
