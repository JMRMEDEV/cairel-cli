/**
 * Tests for TASK-017: Update command with enforcement-level awareness
 * Covers:
 * - Scanning deployed directives across all platforms
 * - Building update plans (content changes, enforcement changes, new directives)
 * - Moving directives between enforcement levels
 * - Backup creation before destructive operations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  scanDeployedDirectives,
  buildUpdatePlan,
  moveDirective,
  updateDirectiveInPlace,
  getTargetPath,
  DeployedDirective,
  UpdateCandidate,
} from '../src/core/enforcement-updater';
import { DirectivesManifest } from '../src/core/directives-selector';

/** Check if a file/directory exists (native fs alternative to fs-extra's pathExists). */
async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

describe('Enforcement Updater', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-update-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  // ─── Scanning ─────────────────────────────────────────────────────────────

  describe('scanDeployedDirectives', () => {
    describe('Kiro platform', () => {
      it('should detect enforced directives in .kiro/steering', async () => {
        const dir = join(testDir, '.kiro', 'steering');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'git-management.md'), [
          '---',
          'inclusion: always',
          '---',
          '',
          '# Git Management',
          'Follow conventional commits.',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'kiro');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('git-management');
        expect(deployed[0].enforcement).toBe('enforced');
        expect(deployed[0].platform).toBe('kiro');
      });

      it('should detect contextual directives in .kiro/steering with inclusion: auto', async () => {
        const dir = join(testDir, '.kiro', 'steering');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'context-retrieval.md'), [
          '---',
          'inclusion: auto',
          'name: context-retrieval',
          'description: Token optimization',
          '---',
          '',
          '# Context Retrieval',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'kiro');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('context-retrieval');
        expect(deployed[0].enforcement).toBe('contextual');
      });

      it('should detect available directives in .kiro/skills', async () => {
        const dir = join(testDir, '.kiro', 'skills', 'chakra-ui-v3-integration');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'SKILL.md'), [
          '---',
          'name: chakra-ui-v3-integration',
          'description: Chakra UI v3 integration',
          '---',
          '',
          '# Chakra UI v3',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'kiro');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('chakra-ui-v3-integration');
        expect(deployed[0].enforcement).toBe('available');
      });

      it('should detect directives across all enforcement levels simultaneously', async () => {
        // Enforced
        const steeringDir = join(testDir, '.kiro', 'steering');
        await fs.mkdir(steeringDir, { recursive: true });
        await fs.writeFile(join(steeringDir, 'git-management.md'), '---\ninclusion: always\n---\n# Git');

        // Contextual
        await fs.writeFile(join(steeringDir, 'context-retrieval.md'), '---\ninclusion: auto\nname: context-retrieval\ndescription: Token opt\n---\n# Context');

        // Available
        const skillDir = join(testDir, '.kiro', 'skills', 'chakra-ui');
        await fs.mkdir(skillDir, { recursive: true });
        await fs.writeFile(join(skillDir, 'SKILL.md'), '---\nname: chakra-ui\ndescription: UI\n---\n# Chakra');

        const deployed = await scanDeployedDirectives(testDir, 'kiro');
        expect(deployed).toHaveLength(3);

        const enforced = deployed.filter(d => d.enforcement === 'enforced');
        const contextual = deployed.filter(d => d.enforcement === 'contextual');
        const available = deployed.filter(d => d.enforcement === 'available');

        expect(enforced).toHaveLength(1);
        expect(contextual).toHaveLength(1);
        expect(available).toHaveLength(1);
      });
    });

    describe('Cursor platform', () => {
      it('should detect enforced directives (alwaysApply: true)', async () => {
        const dir = join(testDir, '.cursor', 'rules');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'git-management-directive.mdc'), [
          '---',
          'description: "Git management"',
          'alwaysApply: true',
          '---',
          '',
          '# Git Management',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'cursor');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('git-management');
        expect(deployed[0].enforcement).toBe('enforced');
      });

      it('should detect contextual directives (no alwaysApply)', async () => {
        const dir = join(testDir, '.cursor', 'rules');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'context-retrieval-directive.mdc'), [
          '---',
          'description: "Context retrieval"',
          '---',
          '',
          '# Context Retrieval',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'cursor');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('context-retrieval');
        expect(deployed[0].enforcement).toBe('contextual');
      });

      it('should detect available directives (alwaysApply: false)', async () => {
        const dir = join(testDir, '.cursor', 'rules');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'chakra-ui-directive.mdc'), [
          '---',
          'description: "Chakra UI"',
          'alwaysApply: false',
          '---',
          '',
          '# Chakra UI',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'cursor');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].id).toBe('chakra-ui');
        expect(deployed[0].enforcement).toBe('available');
      });
    });

    describe('Claude Code platform', () => {
      it('should detect enforced directives from CLAUDE.md sections', async () => {
        await fs.writeFile(join(testDir, 'CLAUDE.md'), [
          '# Project Directives',
          '',
          '## Git Management',
          '',
          'Use conventional commits.',
          '',
          '## Context Retrieval',
          '',
          'Minimize token usage.',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'claude-code');
        expect(deployed).toHaveLength(2);
        expect(deployed.every(d => d.enforcement === 'enforced')).toBe(true);
        expect(deployed[0].id).toBe('git-management');
        expect(deployed[1].id).toBe('context-retrieval');
      });
    });

    describe('GitHub Copilot platform', () => {
      it('should detect enforced directives from copilot-instructions.md', async () => {
        const dir = join(testDir, '.github');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'copilot-instructions.md'), [
          '# Instructions',
          '',
          '## Git Management',
          '',
          'Use conventional commits.',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'github-copilot');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].enforcement).toBe('enforced');
        expect(deployed[0].id).toBe('git-management');
      });

      it('should detect contextual directives from .github/instructions/', async () => {
        const dir = join(testDir, '.github', 'instructions');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'context-retrieval.instructions.md'), [
          '---',
          'applyTo: "**/*"',
          '---',
          '',
          '# Context Retrieval',
        ].join('\n'));

        const deployed = await scanDeployedDirectives(testDir, 'github-copilot');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].enforcement).toBe('contextual');
        expect(deployed[0].id).toBe('context-retrieval');
      });

      it('should detect available directives from .github/skills/', async () => {
        const dir = join(testDir, '.github', 'skills', 'chakra-ui');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'SKILL.md'), '---\nname: chakra-ui\n---\n# Chakra');

        const deployed = await scanDeployedDirectives(testDir, 'github-copilot');
        expect(deployed).toHaveLength(1);
        expect(deployed[0].enforcement).toBe('available');
        expect(deployed[0].id).toBe('chakra-ui');
      });
    });

    describe('Amazon Q platform', () => {
      it('should detect all directives as enforced', async () => {
        const dir = join(testDir, '.amazonq', 'rules');
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(join(dir, 'git-management.md'), '# Git Management\nUse conventional commits.');
        await fs.writeFile(join(dir, 'context-retrieval.md'), '# Context\nMinimize tokens.');

        const deployed = await scanDeployedDirectives(testDir, 'amazon-q');
        expect(deployed).toHaveLength(2);
        expect(deployed.every(d => d.enforcement === 'enforced')).toBe(true);
      });
    });

    it('should return empty array for platform with no configuration', async () => {
      const deployed = await scanDeployedDirectives(testDir, 'kiro');
      expect(deployed).toHaveLength(0);
    });
  });

  // ─── Update Plan Building ────────────────────────────────────────────────

  describe('buildUpdatePlan', () => {
    const testManifest: DirectivesManifest = {
      directives: [
        {
          id: 'git-management',
          title: 'Git Management',
          description: 'Git ops',
          category: 'git',
          enforcement: 'enforced',
        },
        {
          id: 'context-retrieval',
          title: 'Context Retrieval',
          description: 'Token opt',
          category: 'general',
          enforcement: 'contextual',
        },
        {
          id: 'new-directive',
          title: 'New Directive',
          description: 'Brand new',
          category: 'general',
          enforcement: 'enforced',
        },
      ],
    };

    it('should identify directives with changed enforcement (manifest differs from deployed)', () => {
      const deployed: DeployedDirective[] = [
        {
          id: 'git-management',
          platform: 'kiro',
          enforcement: 'contextual', // deployed as contextual, manifest says enforced
          filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
          content: '---\ninclusion: auto\nname: git-management\ndescription: Git\n---\n# Git Management\nGit ops',
        },
      ];

      const contentMap = new Map<string, string>();
      contentMap.set('git-management', '---\nname: git-management\n---\n# Git Management\nGit ops');

      const plan = buildUpdatePlan(deployed, testManifest, 'kiro', contentMap);

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].id).toBe('git-management');
      expect(plan.updates[0].currentEnforcement).toBe('contextual');
      expect(plan.updates[0].recommendedEnforcement).toBe('enforced');
      expect(plan.updates[0].hasEnforcementChange).toBe(true);
    });

    it('should identify directives with updated content (same enforcement)', () => {
      const deployed: DeployedDirective[] = [
        {
          id: 'git-management',
          platform: 'kiro',
          enforcement: 'enforced',
          filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
          content: '---\ninclusion: always\n---\n\n# Git Management\nOld content here',
        },
      ];

      const contentMap = new Map<string, string>();
      contentMap.set('git-management', '---\nname: git-management\n---\n\n# Git Management\nNew updated content');

      const plan = buildUpdatePlan(deployed, testManifest, 'kiro', contentMap);

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].id).toBe('git-management');
      expect(plan.updates[0].hasContentUpdate).toBe(true);
      expect(plan.updates[0].hasEnforcementChange).toBe(false);
    });

    it('should identify new directives not yet deployed', () => {
      const deployed: DeployedDirective[] = [
        {
          id: 'git-management',
          platform: 'kiro',
          enforcement: 'enforced',
          filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
          content: '---\ninclusion: always\n---\n\n# Git Management\nGit ops',
        },
      ];

      const contentMap = new Map<string, string>();
      contentMap.set('git-management', '---\nname: git-management\n---\n\n# Git Management\nGit ops');

      const plan = buildUpdatePlan(deployed, testManifest, 'kiro', contentMap);

      expect(plan.newDirectives).toHaveLength(2); // context-retrieval and new-directive
      expect(plan.newDirectives.map(n => n.id)).toContain('context-retrieval');
      expect(plan.newDirectives.map(n => n.id)).toContain('new-directive');
      expect(plan.newDirectives[0].isNew).toBe(true);
    });

    it('should classify unchanged directives correctly', () => {
      const deployed: DeployedDirective[] = [
        {
          id: 'git-management',
          platform: 'kiro',
          enforcement: 'enforced',
          filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
          content: '---\ninclusion: always\n---\n\n# Git Management\nGit ops',
        },
      ];

      const contentMap = new Map<string, string>();
      // Same content after normalization
      contentMap.set('git-management', '---\nname: git-management\n---\n\n# Git Management\nGit ops');

      const plan = buildUpdatePlan(deployed, testManifest, 'kiro', contentMap);

      expect(plan.unchanged).toHaveLength(1);
      expect(plan.unchanged[0].id).toBe('git-management');
    });

    it('should handle empty deployed list (all directives are new)', () => {
      const plan = buildUpdatePlan([], testManifest, 'kiro', new Map());

      expect(plan.newDirectives).toHaveLength(3);
      expect(plan.updates).toHaveLength(0);
      expect(plan.unchanged).toHaveLength(0);
    });
  });

  // ─── Target Path Resolution ───────────────────────────────────────────────

  describe('getTargetPath', () => {
    describe('Kiro', () => {
      it('should route enforced to .kiro/steering/', () => {
        const target = getTargetPath(testDir, 'kiro', 'git-management', 'enforced');
        expect(target).toBe(join(testDir, '.kiro', 'steering', 'git-management.md'));
      });

      it('should route contextual to .kiro/steering/', () => {
        const target = getTargetPath(testDir, 'kiro', 'context-retrieval', 'contextual');
        expect(target).toBe(join(testDir, '.kiro', 'steering', 'context-retrieval.md'));
      });

      it('should route available to .kiro/skills/<id>/SKILL.md', () => {
        const target = getTargetPath(testDir, 'kiro', 'chakra-ui', 'available');
        expect(target).toBe(join(testDir, '.kiro', 'skills', 'chakra-ui', 'SKILL.md'));
      });
    });

    describe('Cursor', () => {
      it('should always route to .cursor/rules/<id>-directive.mdc', () => {
        expect(getTargetPath(testDir, 'cursor', 'git-management', 'enforced'))
          .toBe(join(testDir, '.cursor', 'rules', 'git-management-directive.mdc'));
        expect(getTargetPath(testDir, 'cursor', 'git-management', 'contextual'))
          .toBe(join(testDir, '.cursor', 'rules', 'git-management-directive.mdc'));
        expect(getTargetPath(testDir, 'cursor', 'git-management', 'available'))
          .toBe(join(testDir, '.cursor', 'rules', 'git-management-directive.mdc'));
      });
    });

    describe('GitHub Copilot', () => {
      it('should route enforced to copilot-instructions.md', () => {
        const target = getTargetPath(testDir, 'github-copilot', 'git-management', 'enforced');
        expect(target).toBe(join(testDir, '.github', 'copilot-instructions.md'));
      });

      it('should route contextual to .github/instructions/', () => {
        const target = getTargetPath(testDir, 'github-copilot', 'context-retrieval', 'contextual');
        expect(target).toBe(join(testDir, '.github', 'instructions', 'context-retrieval.instructions.md'));
      });

      it('should route available to .github/skills/<id>/SKILL.md', () => {
        const target = getTargetPath(testDir, 'github-copilot', 'chakra-ui', 'available');
        expect(target).toBe(join(testDir, '.github', 'skills', 'chakra-ui', 'SKILL.md'));
      });
    });

    describe('Amazon Q', () => {
      it('should always route to .amazonq/rules/<id>.md', () => {
        expect(getTargetPath(testDir, 'amazon-q', 'git-management', 'enforced'))
          .toBe(join(testDir, '.amazonq', 'rules', 'git-management.md'));
      });
    });
  });

  // ─── Moving Directives ────────────────────────────────────────────────────

  describe('moveDirective', () => {
    it('should backup old file before moving', async () => {
      // Set up old file
      const oldDir = join(testDir, '.kiro', 'skills', 'git-management');
      await fs.mkdir(oldDir, { recursive: true });
      const oldFile = join(oldDir, 'SKILL.md');
      await fs.writeFile(oldFile, '---\nname: git-management\n---\n# Old Content');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      const result = await moveDirective(
        testDir,
        'kiro',
        'git-management',
        oldFile,
        'enforced',
        '---\ninclusion: always\n---\n\n# Git Management\nNew enforced content',
        backupDir
      );

      // Verify backup was created
      expect(await pathExists(result.backedUpPath)).toBe(true);
      const backupContent = await fs.readFile(result.backedUpPath, 'utf-8');
      expect(backupContent).toContain('Old Content');
    });

    it('should write new content at new enforcement location', async () => {
      const oldDir = join(testDir, '.kiro', 'skills', 'git-management');
      await fs.mkdir(oldDir, { recursive: true });
      const oldFile = join(oldDir, 'SKILL.md');
      await fs.writeFile(oldFile, '# Old');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      const newContent = '---\ninclusion: always\n---\n\n# Git Management\nNew enforced content';
      const result = await moveDirective(
        testDir,
        'kiro',
        'git-management',
        oldFile,
        'enforced',
        newContent,
        backupDir
      );

      // Verify new file written
      const expectedPath = join(testDir, '.kiro', 'steering', 'git-management.md');
      expect(result.newPath).toBe(expectedPath);
      expect(await pathExists(expectedPath)).toBe(true);
      const written = await fs.readFile(expectedPath, 'utf-8');
      expect(written).toBe(newContent);
    });

    it('should remove old file after successful write', async () => {
      const oldDir = join(testDir, '.kiro', 'skills', 'git-management');
      await fs.mkdir(oldDir, { recursive: true });
      const oldFile = join(oldDir, 'SKILL.md');
      await fs.writeFile(oldFile, '# Old');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      await moveDirective(
        testDir,
        'kiro',
        'git-management',
        oldFile,
        'enforced',
        '---\ninclusion: always\n---\n# New',
        backupDir
      );

      // Old file should be removed
      expect(await pathExists(oldFile)).toBe(false);
    });

    it('should clean up empty parent directory after removal', async () => {
      const oldDir = join(testDir, '.kiro', 'skills', 'git-management');
      await fs.mkdir(oldDir, { recursive: true });
      const oldFile = join(oldDir, 'SKILL.md');
      await fs.writeFile(oldFile, '# Old');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      await moveDirective(
        testDir,
        'kiro',
        'git-management',
        oldFile,
        'enforced',
        '---\ninclusion: always\n---\n# New',
        backupDir
      );

      // Empty parent directory should be removed
      expect(await pathExists(oldDir)).toBe(false);
    });

    it('should move from steering to skills (enforced → available)', async () => {
      const steeringDir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(steeringDir, { recursive: true });
      const oldFile = join(steeringDir, 'chakra-ui.md');
      await fs.writeFile(oldFile, '---\ninclusion: always\n---\n# Chakra UI');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      const result = await moveDirective(
        testDir,
        'kiro',
        'chakra-ui',
        oldFile,
        'available',
        '---\nname: chakra-ui\ndescription: UI\n---\n# Chakra UI\nAvailable skill',
        backupDir
      );

      const expectedPath = join(testDir, '.kiro', 'skills', 'chakra-ui', 'SKILL.md');
      expect(result.newPath).toBe(expectedPath);
      expect(await pathExists(expectedPath)).toBe(true);
      expect(await pathExists(oldFile)).toBe(false);
    });
  });

  // ─── In-place Update ──────────────────────────────────────────────────────

  describe('updateDirectiveInPlace', () => {
    it('should backup existing file before overwriting', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      const filePath = join(dir, 'git-management.md');
      await fs.writeFile(filePath, '# Old content');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      const backupPath = await updateDirectiveInPlace(filePath, '# New content', backupDir, testDir);

      expect(await pathExists(backupPath)).toBe(true);
      const backed = await fs.readFile(backupPath, 'utf-8');
      expect(backed).toBe('# Old content');
    });

    it('should write new content to the same path', async () => {
      const dir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(dir, { recursive: true });
      const filePath = join(dir, 'git-management.md');
      await fs.writeFile(filePath, '# Old');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await updateDirectiveInPlace(filePath, '# Updated content', backupDir, testDir);

      const updated = await fs.readFile(filePath, 'utf-8');
      expect(updated).toBe('# Updated content');
    });

    it('should create parent directories if needed', async () => {
      const filePath = join(testDir, '.kiro', 'steering', 'new-directive.md');
      const backupDir = join(testDir, '.cairel-backup', 'test');

      await updateDirectiveInPlace(filePath, '# New', backupDir, testDir);

      expect(await pathExists(filePath)).toBe(true);
    });
  });

  // ─── Cross-platform Detection ─────────────────────────────────────────────

  describe('Cross-platform detection', () => {
    it('should detect directives across multiple platforms simultaneously', async () => {
      // Kiro enforced
      const kiroDir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(kiroDir, { recursive: true });
      await fs.writeFile(join(kiroDir, 'git-management.md'), '---\ninclusion: always\n---\n# Git');

      // Cursor contextual
      const cursorDir = join(testDir, '.cursor', 'rules');
      await fs.mkdir(cursorDir, { recursive: true });
      await fs.writeFile(join(cursorDir, 'context-retrieval-directive.mdc'), '---\ndescription: "Context"\n---\n# Context');

      // Amazon Q
      const aqDir = join(testDir, '.amazonq', 'rules');
      await fs.mkdir(aqDir, { recursive: true });
      await fs.writeFile(join(aqDir, 'eslint-configuration.md'), '# ESLint config');

      const kiro = await scanDeployedDirectives(testDir, 'kiro');
      const cursor = await scanDeployedDirectives(testDir, 'cursor');
      const amazonQ = await scanDeployedDirectives(testDir, 'amazon-q');

      expect(kiro).toHaveLength(1);
      expect(kiro[0].enforcement).toBe('enforced');

      expect(cursor).toHaveLength(1);
      expect(cursor[0].enforcement).toBe('contextual');

      expect(amazonQ).toHaveLength(1);
      expect(amazonQ[0].enforcement).toBe('enforced');
    });
  });

  // ─── Enforcement Level Change Scenarios ────────────────────────────────────

  describe('Enforcement level change scenarios', () => {
    it('should plan enforcement change: contextual → enforced', () => {
      const manifest: DirectivesManifest = {
        directives: [{
          id: 'git-management',
          title: 'Git Management',
          description: 'Git ops',
          category: 'git',
          enforcement: 'enforced',
        }],
      };

      const deployed: DeployedDirective[] = [{
        id: 'git-management',
        platform: 'kiro',
        enforcement: 'contextual',
        filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
        content: '---\ninclusion: auto\nname: git-management\ndescription: Git\n---\n# Git',
      }];

      const plan = buildUpdatePlan(deployed, manifest, 'kiro', new Map([['git-management', '---\n---\n# Git']]));

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].currentEnforcement).toBe('contextual');
      expect(plan.updates[0].recommendedEnforcement).toBe('enforced');
      expect(plan.updates[0].hasEnforcementChange).toBe(true);
    });

    it('should plan enforcement change: enforced → available', () => {
      const manifest: DirectivesManifest = {
        directives: [{
          id: 'chakra-ui-v3-integration',
          title: 'Chakra UI v3',
          description: 'UI',
          category: 'ui',
          enforcement: 'available',
        }],
      };

      const deployed: DeployedDirective[] = [{
        id: 'chakra-ui-v3-integration',
        platform: 'kiro',
        enforcement: 'enforced',
        filePath: join(testDir, '.kiro', 'steering', 'chakra-ui-v3-integration.md'),
        content: '---\ninclusion: always\n---\n# Chakra UI',
      }];

      const plan = buildUpdatePlan(deployed, manifest, 'kiro', new Map([['chakra-ui-v3-integration', '---\n---\n# Chakra UI']]));

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].currentEnforcement).toBe('enforced');
      expect(plan.updates[0].recommendedEnforcement).toBe('available');
      expect(plan.updates[0].hasEnforcementChange).toBe(true);
    });

    it('should plan enforcement change: available → contextual', () => {
      const manifest: DirectivesManifest = {
        directives: [{
          id: 'component-structure',
          title: 'Component Structure',
          description: 'Organization',
          category: 'typescript',
          enforcement: 'contextual',
        }],
      };

      const deployed: DeployedDirective[] = [{
        id: 'component-structure',
        platform: 'kiro',
        enforcement: 'available',
        filePath: join(testDir, '.kiro', 'skills', 'component-structure', 'SKILL.md'),
        content: '---\nname: component-structure\ndescription: Organization\n---\n# Component Structure',
      }];

      const plan = buildUpdatePlan(deployed, manifest, 'kiro', new Map([['component-structure', '---\n---\n# Component Structure']]));

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].currentEnforcement).toBe('available');
      expect(plan.updates[0].recommendedEnforcement).toBe('contextual');
      expect(plan.updates[0].hasEnforcementChange).toBe(true);
    });

    it('should detect both content change AND enforcement change simultaneously', () => {
      const manifest: DirectivesManifest = {
        directives: [{
          id: 'git-management',
          title: 'Git Management',
          description: 'Git ops',
          category: 'git',
          enforcement: 'enforced',
        }],
      };

      const deployed: DeployedDirective[] = [{
        id: 'git-management',
        platform: 'kiro',
        enforcement: 'contextual', // different enforcement
        filePath: join(testDir, '.kiro', 'steering', 'git-management.md'),
        content: '---\ninclusion: auto\n---\n\n# Git Management\nOld content', // different content
      }];

      const contentMap = new Map([['git-management', '---\n---\n\n# Git Management\nBrand new content']]);
      const plan = buildUpdatePlan(deployed, manifest, 'kiro', contentMap);

      expect(plan.updates).toHaveLength(1);
      expect(plan.updates[0].hasContentUpdate).toBe(true);
      expect(plan.updates[0].hasEnforcementChange).toBe(true);
    });

    it('should execute full move from available to enforced for Kiro', async () => {
      // Set up available skill
      const skillDir = join(testDir, '.kiro', 'skills', 'git-management');
      await fs.mkdir(skillDir, { recursive: true });
      const oldFile = join(skillDir, 'SKILL.md');
      await fs.writeFile(oldFile, '---\nname: git-management\ndescription: Git\n---\n# Git Management\nUse conventional commits.');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      // Move to enforced
      const newContent = '---\ninclusion: always\n---\n\n# Git Management\nMUST use conventional commits.';
      const result = await moveDirective(testDir, 'kiro', 'git-management', oldFile, 'enforced', newContent, backupDir);

      // Verify: new file in steering
      const enforcedPath = join(testDir, '.kiro', 'steering', 'git-management.md');
      expect(result.newPath).toBe(enforcedPath);
      expect(await pathExists(enforcedPath)).toBe(true);
      const content = await fs.readFile(enforcedPath, 'utf-8');
      expect(content).toContain('inclusion: always');

      // Verify: old file removed
      expect(await pathExists(oldFile)).toBe(false);

      // Verify: backup exists
      expect(await pathExists(result.backedUpPath)).toBe(true);
    });

    it('should execute full move from enforced to available for Kiro', async () => {
      // Set up enforced steering file
      const steeringDir = join(testDir, '.kiro', 'steering');
      await fs.mkdir(steeringDir, { recursive: true });
      const oldFile = join(steeringDir, 'chakra-ui.md');
      await fs.writeFile(oldFile, '---\ninclusion: always\n---\n\n# Chakra UI\nUse Chakra components.');

      const backupDir = join(testDir, '.cairel-backup', 'test');
      await fs.mkdir(backupDir, { recursive: true });

      // Move to available
      const newContent = '---\nname: chakra-ui\ndescription: Chakra UI v3 integration\n---\n\n# Chakra UI\nUse when needed.';
      const result = await moveDirective(testDir, 'kiro', 'chakra-ui', oldFile, 'available', newContent, backupDir);

      // Verify: new file in skills
      const availablePath = join(testDir, '.kiro', 'skills', 'chakra-ui', 'SKILL.md');
      expect(result.newPath).toBe(availablePath);
      expect(await pathExists(availablePath)).toBe(true);

      // Verify: old file removed
      expect(await pathExists(oldFile)).toBe(false);
    });
  });
});
