import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { Platform } from '../types/wizard';

export type EnforcementLevel = 'enforced' | 'contextual' | 'available';

export interface DirectiveInfo {
  id: string;
  enforcement: EnforcementLevel;
  description: string;
  title: string;
}

export interface GenerationWarning {
  directive: string;
  platform: Platform;
  enforcement: EnforcementLevel;
  message: string;
}

export interface GenerationResult {
  filesWritten: string[];
  warnings: GenerationWarning[];
}

const DIRECTIVES_BASE = join(__dirname, '..', '..', 'curated-presets', 'directives');

/**
 * Read the content of a directive. For 'enforced' level, use ENFORCED.md if available.
 * For 'contextual' and 'available', use the main SKILL.md (stripping frontmatter).
 */
async function readDirectiveContent(
  directiveId: string,
  enforcement: EnforcementLevel
): Promise<string> {
  if (enforcement === 'enforced') {
    const enforcedPath = join(DIRECTIVES_BASE, directiveId, 'ENFORCED.md');
    try {
      return await fs.readFile(enforcedPath, 'utf-8');
    } catch {
      // Fall back to main SKILL.md if no ENFORCED.md
    }
  }

  const skillPath = join(DIRECTIVES_BASE, directiveId, 'SKILL.md');
  const content = await fs.readFile(skillPath, 'utf-8');
  return stripFrontmatter(content);
}

/**
 * Read full SKILL.md content including frontmatter (for available/skills format).
 */
async function readFullSkillContent(directiveId: string): Promise<string> {
  const skillPath = join(DIRECTIVES_BASE, directiveId, 'SKILL.md');
  return await fs.readFile(skillPath, 'utf-8');
}

/**
 * Strip YAML frontmatter from markdown content.
 */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n/);
  if (match) {
    return content.slice(match[0].length).trimStart();
  }
  return content;
}

/**
 * Generate directives for a specific platform, routing each to the correct
 * location based on enforcement level.
 */
export async function generateDirectives(
  directives: DirectiveInfo[],
  platform: Platform,
  targetDir: string
): Promise<GenerationResult> {
  const result: GenerationResult = { filesWritten: [], warnings: [] };

  switch (platform) {
    case 'kiro':
      await generateKiro(directives, targetDir, result);
      break;
    case 'cursor':
      await generateCursor(directives, targetDir, result);
      break;
    case 'claude-code':
      await generateClaudeCode(directives, targetDir, result);
      break;
    case 'github-copilot':
      await generateGithubCopilot(directives, targetDir, result);
      break;
    case 'amazon-q':
      await generateAmazonQ(directives, targetDir, result);
      break;
  }

  return result;
}

// ─── Kiro ───────────────────────────────────────────────────────────────────

async function generateKiro(
  directives: DirectiveInfo[],
  targetDir: string,
  result: GenerationResult
): Promise<void> {
  for (const directive of directives) {
    switch (directive.enforcement) {
      case 'enforced': {
        const dir = join(targetDir, '.kiro', 'steering');
        await fs.mkdir(dir, { recursive: true });
        const content = await readDirectiveContent(directive.id, 'enforced');
        const frontmatter = buildKiroFrontmatter(directive, 'always');
        const filePath = join(dir, `${directive.id}.md`);
        await fs.writeFile(filePath, frontmatter + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'contextual': {
        const dir = join(targetDir, '.kiro', 'steering');
        await fs.mkdir(dir, { recursive: true });
        const content = await readDirectiveContent(directive.id, 'contextual');
        const frontmatter = buildKiroFrontmatter(directive, 'auto');
        const filePath = join(dir, `${directive.id}.md`);
        await fs.writeFile(filePath, frontmatter + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'available': {
        const dir = join(targetDir, '.kiro', 'skills', directive.id);
        await fs.mkdir(dir, { recursive: true });
        const content = await readFullSkillContent(directive.id);
        const filePath = join(dir, 'SKILL.md');
        await fs.writeFile(filePath, content, 'utf-8');
        result.filesWritten.push(filePath);
        // Copy references/ if exists
        await copyReferences(directive.id, dir);
        break;
      }
    }
  }
}

function buildKiroFrontmatter(directive: DirectiveInfo, inclusion: 'always' | 'auto'): string {
  const lines = [
    '---',
    `inclusion: ${inclusion}`,
  ];
  if (inclusion === 'auto') {
    lines.push(`name: ${directive.id}`);
    lines.push(`description: ${directive.description}`);
  }
  lines.push('---', '', '');
  return lines.join('\n');
}

// ─── Cursor ─────────────────────────────────────────────────────────────────

async function generateCursor(
  directives: DirectiveInfo[],
  targetDir: string,
  result: GenerationResult
): Promise<void> {
  for (const directive of directives) {
    const dir = join(targetDir, '.cursor', 'rules');
    await fs.mkdir(dir, { recursive: true });

    switch (directive.enforcement) {
      case 'enforced': {
        const content = await readDirectiveContent(directive.id, 'enforced');
        const frontmatter = buildCursorFrontmatter(directive, 'enforced');
        const filePath = join(dir, `${directive.id}-directive.mdc`);
        await fs.writeFile(filePath, frontmatter + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'contextual': {
        const content = await readDirectiveContent(directive.id, 'contextual');
        const frontmatter = buildCursorFrontmatter(directive, 'contextual');
        const filePath = join(dir, `${directive.id}-directive.mdc`);
        await fs.writeFile(filePath, frontmatter + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'available': {
        const content = await readDirectiveContent(directive.id, 'available');
        const frontmatter = buildCursorFrontmatter(directive, 'available');
        const filePath = join(dir, `${directive.id}-directive.mdc`);
        await fs.writeFile(filePath, frontmatter + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
    }
  }
}

function buildCursorFrontmatter(directive: DirectiveInfo, enforcement: EnforcementLevel): string {
  const lines = ['---'];
  lines.push(`description: "${directive.description}"`);
  switch (enforcement) {
    case 'enforced':
      lines.push('alwaysApply: true');
      break;
    case 'contextual':
      // No alwaysApply — Cursor's "Apply Intelligently" mode
      break;
    case 'available':
      lines.push('alwaysApply: false');
      break;
  }
  lines.push('---', '', '');
  return lines.join('\n');
}

// ─── Claude Code ────────────────────────────────────────────────────────────

async function generateClaudeCode(
  directives: DirectiveInfo[],
  targetDir: string,
  result: GenerationResult
): Promise<void> {
  const claudeMdPath = join(targetDir, 'CLAUDE.md');
  const sections: string[] = [];

  for (const directive of directives) {
    switch (directive.enforcement) {
      case 'enforced': {
        const content = await readDirectiveContent(directive.id, 'enforced');
        sections.push(`## ${directive.title}\n\n${content}`);
        break;
      }
      case 'contextual': {
        // Claude Code doesn't support contextual — fall back to enforced
        const content = await readDirectiveContent(directive.id, 'contextual');
        sections.push(`## ${directive.title}\n\n${content}`);
        result.warnings.push({
          directive: directive.id,
          platform: 'claude-code',
          enforcement: 'contextual',
          message: `Claude Code does not support contextual enforcement. Directive "${directive.id}" will be included as enforced in CLAUDE.md.`,
        });
        break;
      }
      case 'available': {
        // Claude Code doesn't support available
        result.warnings.push({
          directive: directive.id,
          platform: 'claude-code',
          enforcement: 'available',
          message: `Claude Code does not support available enforcement. Directive "${directive.id}" will be skipped.`,
        });
        break;
      }
    }
  }

  if (sections.length > 0) {
    await fs.mkdir(dirname(claudeMdPath), { recursive: true });
    const content = `# Project Directives\n\n${sections.join('\n\n---\n\n')}\n`;
    await fs.writeFile(claudeMdPath, content, 'utf-8');
    result.filesWritten.push(claudeMdPath);
  }
}

// ─── GitHub Copilot ─────────────────────────────────────────────────────────

async function generateGithubCopilot(
  directives: DirectiveInfo[],
  targetDir: string,
  result: GenerationResult
): Promise<void> {
  const enforcedSections: string[] = [];

  for (const directive of directives) {
    switch (directive.enforcement) {
      case 'enforced': {
        const content = await readDirectiveContent(directive.id, 'enforced');
        enforcedSections.push(`## ${directive.title}\n\n${content}`);
        break;
      }
      case 'contextual': {
        const dir = join(targetDir, '.github', 'instructions');
        await fs.mkdir(dir, { recursive: true });
        const content = await readDirectiveContent(directive.id, 'contextual');
        const header = `---\napplyTo: "**/*"\n---\n\n`;
        const filePath = join(dir, `${directive.id}.instructions.md`);
        await fs.writeFile(filePath, header + content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'available': {
        const dir = join(targetDir, '.github', 'skills', directive.id);
        await fs.mkdir(dir, { recursive: true });
        const content = await readFullSkillContent(directive.id);
        const filePath = join(dir, 'SKILL.md');
        await fs.writeFile(filePath, content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
    }
  }

  if (enforcedSections.length > 0) {
    const dir = join(targetDir, '.github');
    await fs.mkdir(dir, { recursive: true });
    const filePath = join(dir, 'copilot-instructions.md');
    const content = `# Copilot Instructions\n\n${enforcedSections.join('\n\n---\n\n')}\n`;
    await fs.writeFile(filePath, content, 'utf-8');
    result.filesWritten.push(filePath);
  }
}

// ─── Amazon Q ───────────────────────────────────────────────────────────────

async function generateAmazonQ(
  directives: DirectiveInfo[],
  targetDir: string,
  result: GenerationResult
): Promise<void> {
  const dir = join(targetDir, '.amazonq', 'rules');
  await fs.mkdir(dir, { recursive: true });

  for (const directive of directives) {
    switch (directive.enforcement) {
      case 'enforced':
      case 'contextual': {
        // Amazon Q: all are always-loaded flat .md files
        const content = await readDirectiveContent(directive.id, directive.enforcement);
        const filePath = join(dir, `${directive.id}.md`);
        await fs.writeFile(filePath, content, 'utf-8');
        result.filesWritten.push(filePath);
        break;
      }
      case 'available': {
        // Amazon Q doesn't support available (on-demand) — warn and skip
        result.warnings.push({
          directive: directive.id,
          platform: 'amazon-q',
          enforcement: 'available',
          message: `Amazon Q does not support available enforcement. Directive "${directive.id}" will be skipped.`,
        });
        break;
      }
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function copyReferences(directiveId: string, targetDir: string): Promise<void> {
  const refsDir = join(DIRECTIVES_BASE, directiveId, 'references');
  try {
    const refs = await fs.readdir(refsDir);
    const targetRefs = join(targetDir, 'references');
    await fs.mkdir(targetRefs, { recursive: true });
    for (const ref of refs) {
      const src = join(refsDir, ref);
      await fs.copyFile(src, join(targetRefs, ref));
    }
  } catch {
    // No references/ directory — expected for most directives
  }
}
