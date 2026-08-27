import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { validateEnforcement } from '../src/core/enforcement-validator';

describe('Enforcement Validator', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-enforcement-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  // ─── Kiro Platform ──────────────────────────────────────────────────────

  describe('Kiro platform', () => {
    it('should validate enforced steering file with inclusion: always', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'git-management.md'), [
        '---',
        'inclusion: always',
        '---',
        '',
        '# Git Management',
        'MUST use conventional commits.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives).toHaveLength(1);
      expect(kiroDirectives[0].enforcement).toBe('enforced');
      expect(kiroDirectives[0].valid).toBe(true);
      expect(kiroDirectives[0].errors).toHaveLength(0);
    });

    it('should validate contextual steering file with inclusion: auto', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'context-retrieval.md'), [
        '---',
        'inclusion: auto',
        'name: context-retrieval',
        'description: Minimize token usage through efficient context loading.',
        '---',
        '',
        '# Context Retrieval',
        'Load minimal context needed.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives).toHaveLength(1);
      expect(kiroDirectives[0].enforcement).toBe('contextual');
      expect(kiroDirectives[0].valid).toBe(true);
      expect(kiroDirectives[0].errors).toHaveLength(0);
    });

    it('should error on contextual steering file missing name', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'context-retrieval.md'), [
        '---',
        'inclusion: auto',
        'description: Some description',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(false);
      expect(kiroDirectives[0].errors.some(e => e.includes('name'))).toBe(true);
    });

    it('should error on contextual steering file missing description', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'context-retrieval.md'), [
        '---',
        'inclusion: auto',
        'name: context-retrieval',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(false);
      expect(kiroDirectives[0].errors.some(e => e.includes('description'))).toBe(true);
    });

    it('should error on invalid inclusion value', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'bad.md'), [
        '---',
        'inclusion: manual',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(false);
      expect(kiroDirectives[0].errors.some(e => e.includes('Invalid inclusion value'))).toBe(true);
    });

    it('should error on steering file missing frontmatter', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'no-frontmatter.md'), '# Just content\nNo frontmatter here.');

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(false);
      expect(kiroDirectives[0].errors.some(e => e.includes('Missing frontmatter'))).toBe(true);
    });

    it('should validate available skill with SKILL.md', async () => {
      const dir = join(testDir, '.kiro', 'skills', 'chakra-ui-v3-integration');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'SKILL.md'), [
        '---',
        'name: chakra-ui-v3-integration',
        'description: Integrate Chakra UI v3 components using MCP tools.',
        '---',
        '',
        '# Chakra UI v3 Integration',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives).toHaveLength(1);
      expect(kiroDirectives[0].enforcement).toBe('available');
      expect(kiroDirectives[0].valid).toBe(true);
    });

    it('should error on skill with name mismatch', async () => {
      const dir = join(testDir, '.kiro', 'skills', 'my-skill');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'SKILL.md'), [
        '---',
        'name: wrong-name',
        'description: Test',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(false);
      expect(kiroDirectives[0].errors.some(e => e.includes('does not match directory'))).toBe(true);
    });

    it('should warn on enforced directive exceeding 30 lines', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      const longContent = Array(35).fill('Line content here').join('\n');
      await fs.writeFile(join(dir, 'long-rule.md'), [
        '---',
        'inclusion: always',
        '---',
        '',
        longContent,
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const kiroDirectives = result.directives.filter(d => d.platform === 'kiro');

      expect(kiroDirectives[0].valid).toBe(true);
      expect(kiroDirectives[0].warnings.length).toBeGreaterThan(0);
      expect(kiroDirectives[0].warnings[0]).toContain('lines');
    });
  });

  // ─── Cursor Platform ────────────────────────────────────────────────────

  describe('Cursor platform', () => {
    it('should validate enforced .mdc file with alwaysApply: true', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'git-management-directive.mdc'), [
        '---',
        'description: "Manage git operations safely."',
        'alwaysApply: true',
        '---',
        '',
        '# Git Management',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives).toHaveLength(1);
      expect(cursorDirectives[0].enforcement).toBe('enforced');
      expect(cursorDirectives[0].valid).toBe(true);
    });

    it('should validate contextual .mdc file with description only', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'context-retrieval-directive.mdc'), [
        '---',
        'description: "Minimize token usage."',
        '---',
        '',
        '# Context Retrieval',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives).toHaveLength(1);
      expect(cursorDirectives[0].enforcement).toBe('contextual');
      expect(cursorDirectives[0].valid).toBe(true);
    });

    it('should validate available .mdc file with alwaysApply: false', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'chakra-ui-directive.mdc'), [
        '---',
        'description: "Chakra UI v3 integration."',
        'alwaysApply: false',
        '---',
        '',
        '# Chakra UI',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives).toHaveLength(1);
      expect(cursorDirectives[0].enforcement).toBe('available');
      expect(cursorDirectives[0].valid).toBe(true);
    });

    it('should error on .mdc file missing description', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'bad-directive.mdc'), [
        '---',
        'alwaysApply: true',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives[0].valid).toBe(false);
      expect(cursorDirectives[0].errors.some(e => e.includes('description'))).toBe(true);
    });

    it('should error on .mdc file missing frontmatter', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'no-fm-directive.mdc'), '# Just content\nNo frontmatter.');

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives[0].valid).toBe(false);
      expect(cursorDirectives[0].errors.some(e => e.includes('Missing frontmatter'))).toBe(true);
    });

    it('should warn on oversized enforced .mdc file', async () => {
      const dir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(dir, { recursive: true });
      const longContent = Array(35).fill('Long line content').join('\n');
      await fs.writeFile(join(dir, 'big-directive.mdc'), [
        '---',
        'description: "Big directive."',
        'alwaysApply: true',
        '---',
        '',
        longContent,
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const cursorDirectives = result.directives.filter(d => d.platform === 'cursor');

      expect(cursorDirectives[0].valid).toBe(true);
      expect(cursorDirectives[0].warnings.length).toBeGreaterThan(0);
      expect(cursorDirectives[0].warnings[0]).toContain('lines');
    });
  });

  // ─── Claude Code Platform ──────────────────────────────────────────────

  describe('Claude Code platform', () => {
    it('should validate CLAUDE.md with section headings as enforced directives', async () => {
      await fs.writeFile(join(testDir, 'CLAUDE.md'), [
        '# Project Directives',
        '',
        '## Git Management',
        '',
        'MUST use conventional commits.',
        '',
        '---',
        '',
        '## Context Retrieval',
        '',
        'Load minimal context.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const claudeDirectives = result.directives.filter(d => d.platform === 'claude-code');

      expect(claudeDirectives).toHaveLength(2);
      expect(claudeDirectives[0].enforcement).toBe('enforced');
      expect(claudeDirectives[0].name).toBe('Git Management');
      expect(claudeDirectives[1].name).toBe('Context Retrieval');
      expect(claudeDirectives.every(d => d.valid)).toBe(true);
    });

    it('should warn when CLAUDE.md exceeds 150 lines', async () => {
      const longContent = Array(160).fill('Line of content').join('\n');
      await fs.writeFile(join(testDir, 'CLAUDE.md'), [
        '# Project Directives',
        '',
        '## Big Section',
        '',
        longContent,
      ].join('\n'));

      const result = await validateEnforcement(testDir);

      expect(result.globalWarnings.some(w => w.includes('150 lines'))).toBe(true);
    });

    it('should error when CLAUDE.md has no ## headings', async () => {
      await fs.writeFile(join(testDir, 'CLAUDE.md'), [
        '# Project Directives',
        '',
        'Just some content without sections.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const claudeDirectives = result.directives.filter(d => d.platform === 'claude-code');

      expect(claudeDirectives).toHaveLength(1);
      expect(claudeDirectives[0].valid).toBe(false);
      expect(claudeDirectives[0].errors.some(e => e.includes('no directive sections'))).toBe(true);
    });

    it('should warn on oversized section in CLAUDE.md', async () => {
      const longContent = Array(35).fill('Content line').join('\n');
      await fs.writeFile(join(testDir, 'CLAUDE.md'), [
        '# Project Directives',
        '',
        '## Big Directive',
        '',
        longContent,
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const claudeDirectives = result.directives.filter(d => d.platform === 'claude-code');

      expect(claudeDirectives[0].warnings.length).toBeGreaterThan(0);
      expect(claudeDirectives[0].warnings[0]).toContain('lines');
    });
  });

  // ─── GitHub Copilot Platform ────────────────────────────────────────────

  describe('GitHub Copilot platform', () => {
    it('should validate enforced copilot-instructions.md', async () => {
      const dir = join(testDir, '.github');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'copilot-instructions.md'), [
        '# Copilot Instructions',
        '',
        '## Git Management',
        '',
        'MUST use conventional commits.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const copilotDirectives = result.directives.filter(d => d.platform === 'github-copilot');

      expect(copilotDirectives).toHaveLength(1);
      expect(copilotDirectives[0].enforcement).toBe('enforced');
      expect(copilotDirectives[0].valid).toBe(true);
    });

    it('should validate contextual instruction files', async () => {
      const dir = join(testDir, '.github', 'instructions');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'context-retrieval.instructions.md'), [
        '---',
        'applyTo: "**/*"',
        '---',
        '',
        '# Context Retrieval',
        'Load minimal context needed.',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const copilotDirectives = result.directives.filter(d => d.platform === 'github-copilot');

      expect(copilotDirectives).toHaveLength(1);
      expect(copilotDirectives[0].enforcement).toBe('contextual');
      expect(copilotDirectives[0].valid).toBe(true);
    });

    it('should error on instruction file missing applyTo', async () => {
      const dir = join(testDir, '.github', 'instructions');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'bad.instructions.md'), [
        '---',
        'someField: value',
        '---',
        '',
        '# Content',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const copilotDirectives = result.directives.filter(d => d.platform === 'github-copilot');

      expect(copilotDirectives[0].valid).toBe(false);
      expect(copilotDirectives[0].errors.some(e => e.includes('applyTo'))).toBe(true);
    });

    it('should validate available skills in .github/skills/', async () => {
      const dir = join(testDir, '.github', 'skills', 'chakra-ui');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'SKILL.md'), [
        '---',
        'name: chakra-ui',
        'description: Chakra UI v3 integration.',
        '---',
        '',
        '# Chakra UI',
      ].join('\n'));

      const result = await validateEnforcement(testDir);
      const copilotDirectives = result.directives.filter(d => d.platform === 'github-copilot');

      expect(copilotDirectives).toHaveLength(1);
      expect(copilotDirectives[0].enforcement).toBe('available');
      expect(copilotDirectives[0].valid).toBe(true);
    });
  });

  // ─── Amazon Q Platform ─────────────────────────────────────────────────

  describe('Amazon Q platform', () => {
    it('should validate rules in .amazonq/rules/ as enforced', async () => {
      const dir = join(testDir, '.amazonq', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'git-management.md'), '# Git Management\nMUST use conventional commits.');

      const result = await validateEnforcement(testDir);
      const aqDirectives = result.directives.filter(d => d.platform === 'amazon-q');

      expect(aqDirectives).toHaveLength(1);
      expect(aqDirectives[0].enforcement).toBe('enforced');
      expect(aqDirectives[0].valid).toBe(true);
    });

    it('should error on empty directive file', async () => {
      const dir = join(testDir, '.amazonq', 'rules');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, 'empty.md'), '');

      const result = await validateEnforcement(testDir);
      const aqDirectives = result.directives.filter(d => d.platform === 'amazon-q');

      expect(aqDirectives[0].valid).toBe(false);
      expect(aqDirectives[0].errors.some(e => e.includes('Empty'))).toBe(true);
    });

    it('should warn on oversized Amazon Q directive', async () => {
      const dir = join(testDir, '.amazonq', 'rules');
      await fs.mkdir(dir, { recursive: true });
      const longContent = Array(35).fill('Rule content line').join('\n');
      await fs.writeFile(join(dir, 'long-rule.md'), longContent);

      const result = await validateEnforcement(testDir);
      const aqDirectives = result.directives.filter(d => d.platform === 'amazon-q');

      expect(aqDirectives[0].valid).toBe(true);
      expect(aqDirectives[0].warnings.length).toBeGreaterThan(0);
      expect(aqDirectives[0].warnings[0]).toContain('lines');
    });
  });

  // ─── Cross-Platform Detection ──────────────────────────────────────────

  describe('Cross-platform detection', () => {
    it('should detect directives across all 5 platforms simultaneously', async () => {
      // Kiro
      const kiroDir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(kiroDir, { recursive: true });
      await fs.writeFile(join(kiroDir, 'git.md'), '---\ninclusion: always\n---\n\n# Git');

      // Cursor
      const cursorDir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(cursorDir, { recursive: true });
      await fs.writeFile(join(cursorDir, 'git-directive.mdc'), '---\ndescription: "Git"\nalwaysApply: true\n---\n\n# Git');

      // Claude Code
      await fs.writeFile(join(testDir, 'CLAUDE.md'), '# Directives\n\n## Git\n\nUse git.');

      // GitHub Copilot
      const ghDir = join(testDir, '.github');
      await fs.mkdir(ghDir, { recursive: true });
      await fs.writeFile(join(ghDir, 'copilot-instructions.md'), '# Instructions\n\n## Git\n\nUse git.');

      // Amazon Q
      const aqDir = join(testDir, '.amazonq', 'rules');
      await fs.mkdir(aqDir, { recursive: true });
      await fs.writeFile(join(aqDir, 'git.md'), '# Git\nUse git.');

      const result = await validateEnforcement(testDir);

      const platforms = new Set(result.directives.map(d => d.platform));
      expect(platforms.size).toBe(5);
      expect(platforms.has('kiro')).toBe(true);
      expect(platforms.has('cursor')).toBe(true);
      expect(platforms.has('claude-code')).toBe(true);
      expect(platforms.has('github-copilot')).toBe(true);
      expect(platforms.has('amazon-q')).toBe(true);
    });

    it('should return empty result when no platform directories exist', async () => {
      const result = await validateEnforcement(testDir);

      expect(result.directives).toHaveLength(0);
      expect(result.globalWarnings).toHaveLength(0);
    });
  });
});
