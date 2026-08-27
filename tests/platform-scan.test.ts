import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { join } from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs-extra';

// Mock @inquirer/prompts (ESM) — imported transitively via generator.
jest.mock('@inquirer/prompts', () => ({
  select: jest.fn(),
  checkbox: jest.fn(),
  confirm: jest.fn(),
  Separator: jest.fn(),
}));

import { generateFiles } from '../src/core/generator';
import { scanPlatforms, summaryLine } from '../src/core/platform-scan';
import { QuickSetupAnswers } from '../src/types/wizard';

/**
 * TASK-022: `cairel validate` (no args) auto-detects all known platform
 * directories and validates everything found, grouped by platform.
 *
 * These tests generate real QA output via generateFiles() into a temp project,
 * then run the scanner against it — exercising multi-platform auto-detection
 * end-to-end with the same output the CLI produces.
 */
describe('platform-scan — no-arg validate auto-detection (TASK-022)', () => {
  describe('multi-platform generated project (Kiro + Cursor + Amazon Q)', () => {
    let testDir: string;

    beforeAll(async () => {
      testDir = join(tmpdir(), `cairel-scan-multi-${Date.now()}`);
      await fs.mkdir(testDir, { recursive: true });

      const answers: QuickSetupAnswers = {
        mode: 'quick',
        projectType: 'ui',
        language: 'typescript',
        framework: 'react',
        useGit: true,
        aiTool: 'both',
        platforms: ['kiro', 'cursor', 'amazon-q'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);
    });

    afterAll(async () => {
      await fs.rm(testDir, { recursive: true, force: true });
    });

    it('detects multiple platforms in generated output', async () => {
      const scan = await scanPlatforms(testDir);
      const platforms = scan.groups.map(g => g.platform);

      expect(platforms).toContain('kiro');
      expect(platforms).toContain('cursor');
      expect(platforms).toContain('amazon-q');
      expect(scan.platformCount).toBe(scan.groups.length);
      expect(scan.platformCount).toBeGreaterThanOrEqual(3);
    });

    it('validates all generated directives successfully', async () => {
      const scan = await scanPlatforms(testDir);

      expect(scan.totalDirectives).toBeGreaterThan(0);
      // Freshly generated directives should all be valid.
      expect(scan.hasErrors).toBe(false);
    });

    it('validates generated agents', async () => {
      const scan = await scanPlatforms(testDir);

      // Kiro + Amazon Q each get a dev-agent.json.
      expect(scan.totalAgents).toBeGreaterThanOrEqual(2);
      const kiroGroup = scan.groups.find(g => g.platform === 'kiro');
      expect(kiroGroup?.agents.length).toBeGreaterThanOrEqual(1);
      const amazonqGroup = scan.groups.find(g => g.platform === 'amazon-q');
      expect(amazonqGroup?.agents.length).toBeGreaterThanOrEqual(1);
    });

    it('produces the required summary line', async () => {
      const scan = await scanPlatforms(testDir);
      const line = summaryLine(scan);

      expect(line).toMatch(
        new RegExp(
          `^Validated ${scan.totalDirectives} directives? and ${scan.totalAgents} agents? across ${scan.platformCount} platforms?$`
        )
      );
      expect(line).toContain('Validated');
      expect(line).toContain('across');
    });

    it('groups directives under their owning platform', async () => {
      const scan = await scanPlatforms(testDir);

      for (const group of scan.groups) {
        for (const d of group.directives) {
          expect(d.platform).toBe(group.platform);
        }
        for (const a of group.agents) {
          expect(a.platform).toBe(group.platform);
        }
      }
    });
  });

  describe('empty platforms are silently skipped', () => {
    let testDir: string;

    beforeAll(async () => {
      testDir = join(tmpdir(), `cairel-scan-single-${Date.now()}`);
      await fs.mkdir(testDir, { recursive: true });

      // Only Kiro output — no Cursor/Claude/Copilot/Amazon Q.
      const answers: QuickSetupAnswers = {
        mode: 'quick',
        projectType: 'backend',
        language: 'typescript',
        framework: 'express',
        useGit: true,
        aiTool: 'kiro-cli',
        platforms: ['kiro'],
        mcpServers: [],
      };

      await generateFiles(answers, testDir);
    });

    afterAll(async () => {
      await fs.rm(testDir, { recursive: true, force: true });
    });

    it('reports only platforms that have files', async () => {
      const scan = await scanPlatforms(testDir);
      const platforms = scan.groups.map(g => g.platform);

      expect(platforms).toContain('kiro');
      expect(platforms).not.toContain('cursor');
      expect(platforms).not.toContain('claude-code');
      expect(platforms).not.toContain('github-copilot');
      expect(platforms).not.toContain('amazon-q');
      expect(scan.platformCount).toBe(1);
    });

    it('uses singular "platform" in the summary for a single platform', async () => {
      const scan = await scanPlatforms(testDir);
      const line = summaryLine(scan);
      expect(line).toMatch(/across 1 platform$/);
    });
  });

  describe('no configuration present', () => {
    it('returns zero groups for an empty project', async () => {
      const emptyDir = join(tmpdir(), `cairel-scan-empty-${Date.now()}`);
      await fs.mkdir(emptyDir, { recursive: true });
      try {
        const scan = await scanPlatforms(emptyDir);
        expect(scan.groups).toHaveLength(0);
        expect(scan.platformCount).toBe(0);
        expect(scan.totalDirectives).toBe(0);
        expect(scan.totalAgents).toBe(0);
        expect(scan.hasErrors).toBe(false);
      } finally {
        await fs.rm(emptyDir, { recursive: true, force: true });
      }
    });
  });
});
