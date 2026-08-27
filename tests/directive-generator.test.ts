import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateDirectives, DirectiveInfo, GenerationResult } from '../src/core/directive-generator';
import { Platform } from '../src/types/wizard';

describe('Directive Generator — Enforcement-Aware Routing', () => {
  let testDir: string;

  const enforcedDirective: DirectiveInfo = {
    id: 'git-management',
    enforcement: 'enforced',
    description: 'Manage git operations safely with human review.',
    title: 'Git Repository Management',
  };

  const contextualDirective: DirectiveInfo = {
    id: 'context-retrieval',
    enforcement: 'contextual',
    description: 'Minimize token usage through efficient context loading.',
    title: 'Context Retrieval & Token Optimization',
  };

  const availableDirective: DirectiveInfo = {
    id: 'chakra-ui-v3-integration',
    enforcement: 'available',
    description: 'Integrate Chakra UI v3 components using MCP tools.',
    title: 'Chakra UI v3 Integration with MCP Tools',
  };

  const allDirectives: DirectiveInfo[] = [
    enforcedDirective,
    contextualDirective,
    availableDirective,
  ];

  beforeEach(async () => {
    testDir = join(tmpdir(), `cairel-directive-gen-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  // ─── Kiro ───────────────────────────────────────────────────────────────

  describe('Kiro platform', () => {
    const platform: Platform = 'kiro';

    it('should route enforced directives to .kiro/steering/ with inclusion: always', async () => {
      const result = await generateDirectives([enforcedDirective], platform, testDir);

      const filePath = join(testDir, '.kiro', 'steering', 'git-management.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('---');
      expect(content).toContain('inclusion: always');
      // Uses ENFORCED.md content (imperative MUST/NEVER tone)
      expect(content).toContain('MUST');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route contextual directives to .kiro/steering/ with inclusion: auto', async () => {
      const result = await generateDirectives([contextualDirective], platform, testDir);

      const filePath = join(testDir, '.kiro', 'steering', 'context-retrieval.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('inclusion: auto');
      expect(content).toContain('name: context-retrieval');
      expect(content).toContain('description: ');
      // Uses main directive content (not ENFORCED.md)
      expect(content).toContain('Context Retrieval');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route available directives to .kiro/skills/{name}/SKILL.md', async () => {
      const result = await generateDirectives([availableDirective], platform, testDir);

      const filePath = join(testDir, '.kiro', 'skills', 'chakra-ui-v3-integration', 'SKILL.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      // Full SKILL.md with frontmatter preserved
      expect(content).toContain('name: chakra-ui-v3-integration');
      expect(content).toContain('cairel-enforcement: available');
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle all three enforcement levels together', async () => {
      const result = await generateDirectives(allDirectives, platform, testDir);

      expect(result.filesWritten).toHaveLength(3);
      expect(result.warnings).toHaveLength(0);

      // Verify correct paths
      expect(result.filesWritten).toContain(join(testDir, '.kiro', 'steering', 'git-management.md'));
      expect(result.filesWritten).toContain(join(testDir, '.kiro', 'steering', 'context-retrieval.md'));
      expect(result.filesWritten).toContain(join(testDir, '.kiro', 'skills', 'chakra-ui-v3-integration', 'SKILL.md'));
    });
  });

  // ─── Cursor ─────────────────────────────────────────────────────────────

  describe('Cursor platform', () => {
    const platform: Platform = 'cursor';

    it('should route enforced directives to .cursor/rules/ with alwaysApply: true and description', async () => {
      const result = await generateDirectives([enforcedDirective], platform, testDir);

      const filePath = join(testDir, '.cursor', 'rules', 'git-management-directive.mdc');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('description: "Manage git operations safely with human review."');
      expect(content).toContain('alwaysApply: true');
      expect(content).toContain('MUST');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route contextual directives to .cursor/rules/ with description only (Apply Intelligently)', async () => {
      const result = await generateDirectives([contextualDirective], platform, testDir);

      const filePath = join(testDir, '.cursor', 'rules', 'context-retrieval-directive.mdc');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('description: "Minimize token usage through efficient context loading."');
      expect(content).not.toContain('alwaysApply');
      expect(content).toContain('Context Retrieval');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route available directives to .cursor/rules/ with alwaysApply: false (manual invocation)', async () => {
      const result = await generateDirectives([availableDirective], platform, testDir);

      const filePath = join(testDir, '.cursor', 'rules', 'chakra-ui-v3-integration-directive.mdc');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('description: "Integrate Chakra UI v3 components using MCP tools."');
      expect(content).toContain('alwaysApply: false');
      expect(result.warnings).toHaveLength(0);
    });

    it('should generate .mdc files (not .md) for all enforcement levels', async () => {
      await generateDirectives(allDirectives, platform, testDir);

      const rulesDir = join(testDir, '.cursor', 'rules');
      const files = await fs.readdir(rulesDir);
      expect(files.length).toBe(3);
      for (const file of files) {
        expect(file).toMatch(/\.mdc$/);
      }
    });

    it('should have correct YAML frontmatter structure for each enforcement level', async () => {
      await generateDirectives(allDirectives, platform, testDir);

      const rulesDir = join(testDir, '.cursor', 'rules');

      // Enforced: description + alwaysApply: true
      const enforced = await fs.readFile(join(rulesDir, 'git-management-directive.mdc'), 'utf-8');
      const enforcedFm = enforced.split('---')[1]!;
      expect(enforcedFm).toContain('description:');
      expect(enforcedFm).toContain('alwaysApply: true');

      // Contextual: description only
      const contextual = await fs.readFile(join(rulesDir, 'context-retrieval-directive.mdc'), 'utf-8');
      const contextualFm = contextual.split('---')[1]!;
      expect(contextualFm).toContain('description:');
      expect(contextualFm).not.toContain('alwaysApply');

      // Available: description + alwaysApply: false
      const available = await fs.readFile(join(rulesDir, 'chakra-ui-v3-integration-directive.mdc'), 'utf-8');
      const availableFm = available.split('---')[1]!;
      expect(availableFm).toContain('description:');
      expect(availableFm).toContain('alwaysApply: false');
    });
  });

  // ─── Claude Code ────────────────────────────────────────────────────────

  describe('Claude Code platform', () => {
    const platform: Platform = 'claude-code';

    it('should append enforced directives to CLAUDE.md', async () => {
      const result = await generateDirectives([enforcedDirective], platform, testDir);

      const filePath = join(testDir, 'CLAUDE.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('# Project Directives');
      expect(content).toContain('## Git Repository Management');
      expect(content).toContain('MUST');
      expect(result.warnings).toHaveLength(0);
    });

    it('should fall back contextual to enforced in CLAUDE.md and emit warning', async () => {
      const result = await generateDirectives([contextualDirective], platform, testDir);

      const filePath = join(testDir, 'CLAUDE.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('## Context Retrieval & Token Optimization');

      // Should emit warning about fallback
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.directive).toBe('context-retrieval');
      expect(result.warnings[0]!.platform).toBe('claude-code');
      expect(result.warnings[0]!.enforcement).toBe('contextual');
      expect(result.warnings[0]!.message).toContain('does not support contextual');
    });

    it('should skip available directives and emit warning', async () => {
      const result = await generateDirectives([availableDirective], platform, testDir);

      // No CLAUDE.md should be created since only available directives
      expect(result.filesWritten).toHaveLength(0);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.directive).toBe('chakra-ui-v3-integration');
      expect(result.warnings[0]!.enforcement).toBe('available');
      expect(result.warnings[0]!.message).toContain('will be skipped');
    });

    it('should combine all sections into single CLAUDE.md', async () => {
      const result = await generateDirectives(
        [enforcedDirective, contextualDirective],
        platform,
        testDir
      );

      const content = await fs.readFile(join(testDir, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('## Git Repository Management');
      expect(content).toContain('## Context Retrieval & Token Optimization');
      // Only one file should be written
      expect(result.filesWritten).toHaveLength(1);
    });
  });

  // ─── GitHub Copilot ─────────────────────────────────────────────────────

  describe('GitHub Copilot platform', () => {
    const platform: Platform = 'github-copilot';

    it('should route enforced directives to .github/copilot-instructions.md', async () => {
      const result = await generateDirectives([enforcedDirective], platform, testDir);

      const filePath = join(testDir, '.github', 'copilot-instructions.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('# Copilot Instructions');
      expect(content).toContain('## Git Repository Management');
      expect(content).toContain('MUST');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route contextual directives to .github/instructions/{name}.instructions.md with applyTo', async () => {
      const result = await generateDirectives([contextualDirective], platform, testDir);

      const filePath = join(testDir, '.github', 'instructions', 'context-retrieval.instructions.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('applyTo:');
      expect(content).toContain('Context Retrieval');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route available directives to .github/skills/{name}/SKILL.md', async () => {
      const result = await generateDirectives([availableDirective], platform, testDir);

      const filePath = join(testDir, '.github', 'skills', 'chakra-ui-v3-integration', 'SKILL.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('name: chakra-ui-v3-integration');
      expect(result.warnings).toHaveLength(0);
    });

    it('should combine multiple enforced directives into single copilot-instructions.md', async () => {
      const anotherEnforced: DirectiveInfo = {
        id: 'typescript-validation',
        enforcement: 'enforced',
        description: 'Validate TypeScript compilation.',
        title: 'TypeScript Compilation Validation',
      };
      const result = await generateDirectives(
        [enforcedDirective, anotherEnforced],
        platform,
        testDir
      );

      const content = await fs.readFile(
        join(testDir, '.github', 'copilot-instructions.md'),
        'utf-8'
      );
      expect(content).toContain('## Git Repository Management');
      expect(content).toContain('## TypeScript Compilation Validation');
      // Should only list copilot-instructions.md once
      const copilotFiles = result.filesWritten.filter(f => f.includes('copilot-instructions'));
      expect(copilotFiles).toHaveLength(1);
    });
  });

  // ─── Amazon Q ───────────────────────────────────────────────────────────

  describe('Amazon Q platform', () => {
    const platform: Platform = 'amazon-q';

    it('should route enforced directives to .amazonq/rules/{name}.md (always-loaded)', async () => {
      const result = await generateDirectives([enforcedDirective], platform, testDir);

      const filePath = join(testDir, '.amazonq', 'rules', 'git-management.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('MUST');
      expect(result.warnings).toHaveLength(0);
    });

    it('should route contextual directives to .amazonq/rules/{name}.md (always-loaded)', async () => {
      const result = await generateDirectives([contextualDirective], platform, testDir);

      const filePath = join(testDir, '.amazonq', 'rules', 'context-retrieval.md');
      expect(result.filesWritten).toContain(filePath);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('Context Retrieval');
      expect(result.warnings).toHaveLength(0);
    });

    it('should skip available directives and emit warning', async () => {
      const result = await generateDirectives([availableDirective], platform, testDir);

      // No file should be written
      expect(result.filesWritten).toHaveLength(0);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.directive).toBe('chakra-ui-v3-integration');
      expect(result.warnings[0]!.platform).toBe('amazon-q');
      expect(result.warnings[0]!.enforcement).toBe('available');
      expect(result.warnings[0]!.message).toContain('does not support available');
    });

    it('should produce flat .md files (not directories)', async () => {
      const result = await generateDirectives(
        [enforcedDirective, contextualDirective],
        platform,
        testDir
      );

      const rulesDir = join(testDir, '.amazonq', 'rules');
      const files = await fs.readdir(rulesDir);
      for (const file of files) {
        expect(file).toMatch(/\.md$/);
        const stat = await fs.stat(join(rulesDir, file));
        expect(stat.isFile()).toBe(true);
      }
    });
  });

  // ─── Cross-platform ─────────────────────────────────────────────────────

  describe('Cross-platform behavior', () => {
    it('should produce warnings for all unsupported enforcement levels', async () => {
      const platforms: Platform[] = ['claude-code', 'amazon-q'];
      const allWarnings: GenerationResult['warnings'] = [];

      for (const platform of platforms) {
        const result = await generateDirectives(allDirectives, platform, testDir);
        allWarnings.push(...result.warnings);
      }

      // Claude Code: contextual falls back (warning), available skipped (warning)
      // Amazon Q: available skipped (warning)
      expect(allWarnings.length).toBe(3);
    });

    it('should not produce warnings for platforms with full support', async () => {
      const kiroResult = await generateDirectives(allDirectives, 'kiro', testDir);
      expect(kiroResult.warnings).toHaveLength(0);

      const cursorResult = await generateDirectives(allDirectives, 'cursor', testDir);
      expect(cursorResult.warnings).toHaveLength(0);
    });

    it('should generate files at correct paths for each platform', async () => {
      const platforms: Platform[] = ['kiro', 'cursor', 'claude-code', 'github-copilot', 'amazon-q'];

      for (const platform of platforms) {
        const dir = join(testDir, platform);
        await fs.mkdir(dir, { recursive: true });
        const result = await generateDirectives([enforcedDirective], platform, dir);
        expect(result.filesWritten.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
