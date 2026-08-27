import * as fs from 'fs-extra';
import * as path from 'path';
import matter from 'gray-matter';

export type EnforcementLevel = 'enforced' | 'contextual' | 'available';
export type Platform = 'kiro' | 'cursor' | 'claude-code' | 'github-copilot' | 'amazon-q';

export interface DirectiveValidationEntry {
  platform: Platform;
  path: string;
  name: string;
  enforcement: EnforcementLevel | 'unknown';
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EnforcementValidationResult {
  directives: DirectiveValidationEntry[];
  globalWarnings: string[];
}

/**
 * Validate directives across all platforms, checking enforcement-level consistency
 * and frontmatter correctness.
 */
export async function validateEnforcement(cwd: string): Promise<EnforcementValidationResult> {
  const result: EnforcementValidationResult = { directives: [], globalWarnings: [] };

  await validateKiro(cwd, result);
  await validateCursor(cwd, result);
  await validateClaudeCode(cwd, result);
  await validateGithubCopilot(cwd, result);
  await validateAmazonQ(cwd, result);

  return result;
}

// ─── Kiro ───────────────────────────────────────────────────────────────────

async function validateKiro(cwd: string, result: EnforcementValidationResult): Promise<void> {
  // Steering → enforced (inclusion: always) or contextual (inclusion: auto)
  const steeringDir = path.join(cwd, '.kiro', 'steering');
  if (await fs.pathExists(steeringDir)) {
    const files = await findMarkdownFiles(steeringDir);
    for (const file of files) {
      const entry = await validateKiroSteering(file);
      result.directives.push(entry);
    }
  }

  // Skills → available
  const skillsDir = path.join(cwd, '.kiro', 'skills');
  if (await fs.pathExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const dirEntry of entries) {
      if (!dirEntry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, dirEntry.name, 'SKILL.md');
      if (await fs.pathExists(skillMd)) {
        const entry = await validateKiroSkill(skillMd, dirEntry.name);
        result.directives.push(entry);
      }
    }
  }
}

async function validateKiroSteering(filePath: string): Promise<DirectiveValidationEntry> {
  const name = path.basename(filePath, '.md');
  const entry: DirectiveValidationEntry = {
    platform: 'kiro',
    path: filePath,
    name,
    enforcement: 'unknown',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      entry.valid = false;
      entry.errors.push('Missing frontmatter');
      return entry;
    }

    const inclusion = parsed.data.inclusion;
    if (!inclusion) {
      entry.valid = false;
      entry.errors.push('Missing "inclusion" field in frontmatter');
      return entry;
    }

    if (inclusion === 'always') {
      entry.enforcement = 'enforced';
    } else if (inclusion === 'auto') {
      entry.enforcement = 'contextual';
      // Contextual requires name and description
      if (!parsed.data.name) {
        entry.valid = false;
        entry.errors.push('Contextual steering file (inclusion: auto) requires "name" field');
      }
      if (!parsed.data.description) {
        entry.valid = false;
        entry.errors.push('Contextual steering file (inclusion: auto) requires "description" field');
      }
    } else {
      entry.valid = false;
      entry.errors.push(`Invalid inclusion value: "${inclusion}". Expected "always" or "auto".`);
      return entry;
    }

    // Size warning for enforced directives
    const lines = content.split('\n').length;
    if (entry.enforcement === 'enforced' && lines > 30) {
      entry.warnings.push(`Enforced directive is ${lines} lines (recommended: ≤30 lines)`);
    }
  } catch (error) {
    entry.valid = false;
    entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return entry;
}

async function validateKiroSkill(filePath: string, dirName: string): Promise<DirectiveValidationEntry> {
  const entry: DirectiveValidationEntry = {
    platform: 'kiro',
    path: filePath,
    name: dirName,
    enforcement: 'available',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      entry.valid = false;
      entry.errors.push('SKILL.md missing frontmatter');
      return entry;
    }

    if (!parsed.data.name) {
      entry.valid = false;
      entry.errors.push('SKILL.md missing "name" field');
    }
    if (!parsed.data.description) {
      entry.valid = false;
      entry.errors.push('SKILL.md missing "description" field');
    }

    // Name must match directory
    if (parsed.data.name && parsed.data.name !== dirName) {
      entry.valid = false;
      entry.errors.push(`SKILL.md "name" field ("${parsed.data.name}") does not match directory ("${dirName}")`);
    }
  } catch (error) {
    entry.valid = false;
    entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return entry;
}

// ─── Cursor ─────────────────────────────────────────────────────────────────

async function validateCursor(cwd: string, result: EnforcementValidationResult): Promise<void> {
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  if (!await fs.pathExists(rulesDir)) return;

  const files = await findMdcFiles(rulesDir);
  for (const file of files) {
    const entry = await validateCursorRule(file);
    result.directives.push(entry);
  }
}

async function validateCursorRule(filePath: string): Promise<DirectiveValidationEntry> {
  const name = path.basename(filePath, '-directive.mdc').replace(/-directive$/, '');
  const entry: DirectiveValidationEntry = {
    platform: 'cursor',
    path: filePath,
    name,
    enforcement: 'unknown',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      entry.valid = false;
      entry.errors.push('Missing frontmatter');
      return entry;
    }

    if (!parsed.data.description) {
      entry.valid = false;
      entry.errors.push('Missing "description" field in frontmatter');
      return entry;
    }

    // Determine enforcement from alwaysApply
    if (parsed.data.alwaysApply === true) {
      entry.enforcement = 'enforced';
    } else if (parsed.data.alwaysApply === false) {
      entry.enforcement = 'available';
    } else if (!('alwaysApply' in parsed.data)) {
      entry.enforcement = 'contextual';
    } else {
      entry.valid = false;
      entry.errors.push(`Invalid alwaysApply value: "${parsed.data.alwaysApply}". Expected true, false, or omitted.`);
      return entry;
    }

    // Size warning for enforced directives
    const lines = content.split('\n').length;
    if (entry.enforcement === 'enforced' && lines > 30) {
      entry.warnings.push(`Enforced directive is ${lines} lines (recommended: ≤30 lines)`);
    }
  } catch (error) {
    entry.valid = false;
    entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return entry;
}

// ─── Claude Code ────────────────────────────────────────────────────────────

async function validateClaudeCode(cwd: string, result: EnforcementValidationResult): Promise<void> {
  const claudeMdPath = path.join(cwd, 'CLAUDE.md');
  if (!await fs.pathExists(claudeMdPath)) return;

  try {
    const content = await fs.readFile(claudeMdPath, 'utf-8');
    const lines = content.split('\n');

    // Check total size
    if (lines.length > 150) {
      result.globalWarnings.push(`CLAUDE.md is ${lines.length} lines (recommended: ≤150 lines for performance)`);
    }

    // Check for section markers (## headings = directives)
    const headings = lines.filter(l => l.startsWith('## '));
    if (headings.length === 0) {
      const entry: DirectiveValidationEntry = {
        platform: 'claude-code',
        path: claudeMdPath,
        name: 'CLAUDE.md',
        enforcement: 'enforced',
        valid: false,
        errors: ['CLAUDE.md has no directive sections (expected ## headings)'],
        warnings: [],
      };
      result.directives.push(entry);
      return;
    }

    // Each ## heading is treated as an enforced directive
    for (const heading of headings) {
      const directiveName = heading.replace(/^##\s+/, '').trim();
      const entry: DirectiveValidationEntry = {
        platform: 'claude-code',
        path: claudeMdPath,
        name: directiveName,
        enforcement: 'enforced',
        valid: true,
        errors: [],
        warnings: [],
      };

      // Calculate section size
      const startIdx = lines.indexOf(heading);
      const nextHeadingIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('## '));
      const endIdx = nextHeadingIdx === -1 ? lines.length : nextHeadingIdx;
      const sectionLines = endIdx - startIdx;

      if (sectionLines > 30) {
        entry.warnings.push(`Enforced directive section is ${sectionLines} lines (recommended: ≤30 lines)`);
      }

      result.directives.push(entry);
    }
  } catch (error) {
    result.globalWarnings.push(`Could not read CLAUDE.md: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ─── GitHub Copilot ─────────────────────────────────────────────────────────

async function validateGithubCopilot(cwd: string, result: EnforcementValidationResult): Promise<void> {
  // Enforced: .github/copilot-instructions.md
  const instructionsPath = path.join(cwd, '.github', 'copilot-instructions.md');
  if (await fs.pathExists(instructionsPath)) {
    try {
      const content = await fs.readFile(instructionsPath, 'utf-8');
      const lines = content.split('\n');
      const headings = lines.filter(l => l.startsWith('## '));

      for (const heading of headings) {
        const directiveName = heading.replace(/^##\s+/, '').trim();
        const startIdx = lines.indexOf(heading);
        const nextHeadingIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('## '));
        const endIdx = nextHeadingIdx === -1 ? lines.length : nextHeadingIdx;
        const sectionLines = endIdx - startIdx;

        const entry: DirectiveValidationEntry = {
          platform: 'github-copilot',
          path: instructionsPath,
          name: directiveName,
          enforcement: 'enforced',
          valid: true,
          errors: [],
          warnings: [],
        };

        if (sectionLines > 30) {
          entry.warnings.push(`Enforced directive section is ${sectionLines} lines (recommended: ≤30 lines)`);
        }

        result.directives.push(entry);
      }
    } catch (error) {
      result.globalWarnings.push(`Could not read copilot-instructions.md: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Contextual: .github/instructions/*.instructions.md
  const instrDir = path.join(cwd, '.github', 'instructions');
  if (await fs.pathExists(instrDir)) {
    const files = await findMarkdownFiles(instrDir);
    for (const file of files) {
      const entry = await validateGithubCopilotInstruction(file);
      result.directives.push(entry);
    }
  }

  // Available: .github/skills/*/SKILL.md
  const skillsDir = path.join(cwd, '.github', 'skills');
  if (await fs.pathExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const dirEntry of entries) {
      if (!dirEntry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, dirEntry.name, 'SKILL.md');
      if (await fs.pathExists(skillMd)) {
        const entry: DirectiveValidationEntry = {
          platform: 'github-copilot',
          path: skillMd,
          name: dirEntry.name,
          enforcement: 'available',
          valid: true,
          errors: [],
          warnings: [],
        };

        try {
          const content = await fs.readFile(skillMd, 'utf-8');
          const parsed = matter(content);
          if (!parsed.data || Object.keys(parsed.data).length === 0) {
            entry.valid = false;
            entry.errors.push('SKILL.md missing frontmatter');
          }
        } catch (error) {
          entry.valid = false;
          entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
        }

        result.directives.push(entry);
      }
    }
  }
}

async function validateGithubCopilotInstruction(filePath: string): Promise<DirectiveValidationEntry> {
  const name = path.basename(filePath, '.instructions.md');
  const entry: DirectiveValidationEntry = {
    platform: 'github-copilot',
    path: filePath,
    name,
    enforcement: 'contextual',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      entry.valid = false;
      entry.errors.push('Missing frontmatter (expected applyTo field)');
      return entry;
    }

    if (!parsed.data.applyTo) {
      entry.valid = false;
      entry.errors.push('Missing "applyTo" field in frontmatter');
    }
  } catch (error) {
    entry.valid = false;
    entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return entry;
}

// ─── Amazon Q ───────────────────────────────────────────────────────────────

async function validateAmazonQ(cwd: string, result: EnforcementValidationResult): Promise<void> {
  const rulesDir = path.join(cwd, '.amazonq', 'rules');
  if (!await fs.pathExists(rulesDir)) return;

  const files = await findMarkdownFiles(rulesDir);
  for (const file of files) {
    const name = path.basename(file, '.md');
    const entry: DirectiveValidationEntry = {
      platform: 'amazon-q',
      path: file,
      name,
      enforcement: 'enforced', // Amazon Q: all rules are always-loaded
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      if (lines.length === 0 || content.trim() === '') {
        entry.valid = false;
        entry.errors.push('Empty directive file');
      }

      if (lines.length > 30) {
        entry.warnings.push(`Directive is ${lines.length} lines (recommended: ≤30 lines for always-loaded rules)`);
      }
    } catch (error) {
      entry.valid = false;
      entry.errors.push(`Read error: ${error instanceof Error ? error.message : String(error)}`);
    }

    result.directives.push(entry);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findMarkdownFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await findMarkdownFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function findMdcFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await findMdcFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.mdc')) {
      files.push(fullPath);
    }
  }
  return files;
}
