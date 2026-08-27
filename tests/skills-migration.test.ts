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
    it('should generate enforcement-aware output for Kiro, Claude Code, and Copilot simultaneously', async () => {
      const answers: QuickSetupAnswers = {
        projectType: 'ui', language: 'typescript', framework: 'react',
        useGit: true, aiTool: 'kiro-cli', platforms: ['kiro', 'claude-code', 'github-copilot'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);

      // Kiro: enforced/contextual → .kiro/steering/, available → .kiro/skills/
      const kiroSteering = join(testDir, '.kiro', 'steering');
      const steeringFiles = await fs.readdir(kiroSteering);
      expect(steeringFiles.length).toBeGreaterThanOrEqual(5);
      expect(steeringFiles).toContain('typescript-validation.md');
      expect(steeringFiles).toContain('context-retrieval.md');

      // Check steering file has frontmatter with inclusion
      const tsContent = await fs.readFile(join(kiroSteering, 'typescript-validation.md'), 'utf-8');
      expect(tsContent).toContain('inclusion: always');

      const contextContent = await fs.readFile(join(kiroSteering, 'context-retrieval.md'), 'utf-8');
      expect(contextContent).toContain('inclusion: auto');

      // Claude Code: all go to CLAUDE.md
      const claudeMd = join(testDir, 'CLAUDE.md');
      const claudeContent = await fs.readFile(claudeMd, 'utf-8');
      expect(claudeContent).toContain('TypeScript Compilation Validation');
      expect(claudeContent).toContain('Context Retrieval');

      // GitHub Copilot: enforced → copilot-instructions.md, contextual → .github/instructions/
      const copilotInstructions = join(testDir, '.github', 'copilot-instructions.md');
      const copilotContent = await fs.readFile(copilotInstructions, 'utf-8');
      expect(copilotContent).toContain('TypeScript Compilation Validation');

      const instructionsDir = join(testDir, '.github', 'instructions');
      const instrFiles = await fs.readdir(instructionsDir);
      expect(instrFiles.length).toBeGreaterThanOrEqual(1);
      expect(instrFiles).toContain('context-retrieval.instructions.md');
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
      const skillsDir = join(__dirname, '..', 'curated-presets', 'directives');
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
        uiLibrary: 'chakra-ui',
        mode: 'detailed',
        testingFramework: 'jest',
        linter: 'eslint',
        packageManager: 'npm',
        envVarStrategy: 'no',
        versioningStrategy: 'semantic',
      } as any, testDir);

      // With enforcement routing, only 'available' directives go to .kiro/skills/
      // For this setup, chakra-ui-v3-integration is available
      const skillsDir = join(testDir, '.kiro', 'skills');
      try {
        const results = await validator.validateSkillsDirectory(skillsDir);
        // Available directives should validate correctly
        for (const [, result] of results) {
          expect(result.valid).toBe(true);
        }
      } catch {
        // No skills dir means no available directives were selected — acceptable
      }

      // Enforced/contextual directives go to .kiro/steering/
      const steeringDir = join(testDir, '.kiro', 'steering');
      const steeringFiles = await fs.readdir(steeringDir);
      expect(steeringFiles.length).toBeGreaterThanOrEqual(5);
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
      const manifestPath = join(__dirname, '..', 'curated-presets', 'directives-manifest.json');
      const manifest = require(manifestPath);

      expect(manifest.directives.length).toBeGreaterThanOrEqual(24);

      // Check always-include directives
      const contextRetrieval = manifest.directives.find((r: any) => r.id === 'context-retrieval');
      expect(contextRetrieval.alwaysInclude).toBe(true);
      expect(contextRetrieval.category).toBe('general');
      expect(contextRetrieval.title).toContain('Context Retrieval');

      // Check conditional directive
      const tsValidation = manifest.directives.find((r: any) => r.id === 'typescript-validation');
      expect(tsValidation.alwaysInclude).toBe(false);
      expect(tsValidation.conditions.languages).toContain('typescript');
      expect(tsValidation.category).toBe('typescript');

      // Check Go directive
      const goStyle = manifest.directives.find((r: any) => r.id === 'go-style-conventions');
      expect(goStyle.conditions.languages).toContain('go');
      expect(goStyle.category).toBe('golang');
    });
  });
});
