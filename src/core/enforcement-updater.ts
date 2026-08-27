import * as fs from 'fs-extra';
import * as path from 'path';
import matter from 'gray-matter';
import { Platform, EnforcementLevel } from '../types/wizard';
import { DirectivesManifest, DirectiveDefinition } from './directives-selector';

export interface DeployedDirective {
  id: string;
  platform: Platform;
  enforcement: EnforcementLevel;
  filePath: string;
  content: string;
}

export interface UpdateCandidate {
  id: string;
  platform: Platform;
  currentEnforcement: EnforcementLevel;
  recommendedEnforcement: EnforcementLevel;
  currentFilePath: string;
  hasContentUpdate: boolean;
  hasEnforcementChange: boolean;
  isNew: boolean;
}

export interface UpdatePlan {
  updates: UpdateCandidate[];
  newDirectives: UpdateCandidate[];
  unchanged: DeployedDirective[];
}

/**
 * Scan all platform layers to detect deployed directives and their current enforcement.
 */
export async function scanDeployedDirectives(
  cwd: string,
  platform: Platform
): Promise<DeployedDirective[]> {
  switch (platform) {
    case 'kiro':
      return scanKiro(cwd);
    case 'cursor':
      return scanCursor(cwd);
    case 'claude-code':
      return scanClaudeCode(cwd);
    case 'github-copilot':
      return scanGithubCopilot(cwd);
    case 'amazon-q':
      return scanAmazonQ(cwd);
    default:
      return [];
  }
}

/**
 * Compare deployed directives against manifest to produce an update plan.
 */
export function buildUpdatePlan(
  deployed: DeployedDirective[],
  manifest: DirectivesManifest,
  platform: Platform,
  curatedContentMap: Map<string, string>
): UpdatePlan {
  const plan: UpdatePlan = {
    updates: [],
    newDirectives: [],
    unchanged: [],
  };

  const deployedMap = new Map<string, DeployedDirective>();
  for (const d of deployed) {
    deployedMap.set(d.id, d);
  }

  // Check each manifest directive
  for (const def of manifest.directives) {
    const existing = deployedMap.get(def.id);
    const curatedContent = curatedContentMap.get(def.id) ?? '';
    const recommendedEnforcement = def.enforcement as EnforcementLevel;

    if (!existing) {
      // New directive not yet deployed
      plan.newDirectives.push({
        id: def.id,
        platform,
        currentEnforcement: recommendedEnforcement,
        recommendedEnforcement,
        currentFilePath: '',
        hasContentUpdate: false,
        hasEnforcementChange: false,
        isNew: true,
      });
    } else {
      const hasEnforcementChange = existing.enforcement !== recommendedEnforcement;
      const hasContentUpdate = contentDiffers(existing.content, curatedContent);

      if (hasContentUpdate || hasEnforcementChange) {
        plan.updates.push({
          id: def.id,
          platform,
          currentEnforcement: existing.enforcement,
          recommendedEnforcement,
          currentFilePath: existing.filePath,
          hasContentUpdate,
          hasEnforcementChange,
          isNew: false,
        });
      } else {
        plan.unchanged.push(existing);
      }
    }
  }

  return plan;
}

/**
 * Get the target file path for a directive at a given enforcement level and platform.
 */
export function getTargetPath(
  cwd: string,
  platform: Platform,
  directiveId: string,
  enforcement: EnforcementLevel
): string {
  switch (platform) {
    case 'kiro':
      if (enforcement === 'available') {
        return path.join(cwd, '.kiro', 'skills', directiveId, 'SKILL.md');
      }
      return path.join(cwd, '.kiro', 'steering', `${directiveId}.md`);

    case 'cursor':
      return path.join(cwd, '.cursor', 'rules', `${directiveId}-directive.mdc`);

    case 'claude-code':
      return path.join(cwd, 'CLAUDE.md');

    case 'github-copilot':
      if (enforcement === 'enforced') {
        return path.join(cwd, '.github', 'copilot-instructions.md');
      } else if (enforcement === 'contextual') {
        return path.join(cwd, '.github', 'instructions', `${directiveId}.instructions.md`);
      }
      return path.join(cwd, '.github', 'skills', directiveId, 'SKILL.md');

    case 'amazon-q':
      return path.join(cwd, '.amazonq', 'rules', `${directiveId}.md`);

    default:
      return '';
  }
}

/**
 * Move a directive from one enforcement level to another.
 * Creates backup of old file, writes to new location, removes old file.
 */
export async function moveDirective(
  cwd: string,
  platform: Platform,
  directiveId: string,
  oldFilePath: string,
  newEnforcement: EnforcementLevel,
  newContent: string,
  backupDir: string
): Promise<{ newPath: string; backedUpPath: string }> {
  // 1. Backup old file
  const relPath = path.relative(cwd, oldFilePath);
  const backupPath = path.join(backupDir, relPath);
  await fs.ensureDir(path.dirname(backupPath));

  if (await fs.pathExists(oldFilePath)) {
    await fs.copy(oldFilePath, backupPath);
  }

  // 2. Write new content at new location
  const newPath = getTargetPath(cwd, platform, directiveId, newEnforcement);
  await fs.ensureDir(path.dirname(newPath));
  await fs.writeFile(newPath, newContent, 'utf-8');

  // 3. Remove old file (only if different path)
  if (oldFilePath !== newPath && await fs.pathExists(oldFilePath)) {
    await fs.remove(oldFilePath);

    // Clean up empty parent directory for skills
    const parentDir = path.dirname(oldFilePath);
    try {
      const remaining = await fs.readdir(parentDir);
      if (remaining.length === 0) {
        await fs.rmdir(parentDir);
      }
    } catch {
      // Ignore — parent might not be empty or removable
    }
  }

  return { newPath, backedUpPath: backupPath };
}

/**
 * Update a directive in place (same enforcement level, new content).
 */
export async function updateDirectiveInPlace(
  filePath: string,
  newContent: string,
  backupDir: string,
  cwd: string
): Promise<string> {
  // Backup
  const relPath = path.relative(cwd, filePath);
  const backupPath = path.join(backupDir, relPath);
  await fs.ensureDir(path.dirname(backupPath));

  if (await fs.pathExists(filePath)) {
    await fs.copy(filePath, backupPath);
  }

  // Write updated content
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, newContent, 'utf-8');

  return backupPath;
}

// ─── Platform Scanners ────────────────────────────────────────────────────────

async function scanKiro(cwd: string): Promise<DeployedDirective[]> {
  const deployed: DeployedDirective[] = [];

  // Scan steering (enforced / contextual)
  const steeringDir = path.join(cwd, '.kiro', 'steering');
  if (await fs.pathExists(steeringDir)) {
    const files = await findFiles(steeringDir, '.md');
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = matter(content);
      const inclusion = parsed.data?.inclusion;
      let enforcement: EnforcementLevel = 'enforced';
      if (inclusion === 'auto') enforcement = 'contextual';

      deployed.push({
        id: path.basename(file, '.md'),
        platform: 'kiro',
        enforcement,
        filePath: file,
        content,
      });
    }
  }

  // Scan skills (available)
  const skillsDir = path.join(cwd, '.kiro', 'skills');
  if (await fs.pathExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
      if (await fs.pathExists(skillMd)) {
        const content = await fs.readFile(skillMd, 'utf-8');
        deployed.push({
          id: entry.name,
          platform: 'kiro',
          enforcement: 'available',
          filePath: skillMd,
          content,
        });
      }
    }
  }

  return deployed;
}

async function scanCursor(cwd: string): Promise<DeployedDirective[]> {
  const deployed: DeployedDirective[] = [];
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  if (!await fs.pathExists(rulesDir)) return deployed;

  const files = await findFiles(rulesDir, '.mdc');
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const parsed = matter(content);
    let enforcement: EnforcementLevel = 'contextual';

    if (parsed.data?.alwaysApply === true) {
      enforcement = 'enforced';
    } else if (parsed.data?.alwaysApply === false) {
      enforcement = 'available';
    }

    // Extract ID from filename: remove -directive.mdc suffix
    const basename = path.basename(file, '.mdc');
    const id = basename.replace(/-directive$/, '');

    deployed.push({
      id,
      platform: 'cursor',
      enforcement,
      filePath: file,
      content,
    });
  }

  return deployed;
}

async function scanClaudeCode(cwd: string): Promise<DeployedDirective[]> {
  const deployed: DeployedDirective[] = [];
  const claudePath = path.join(cwd, 'CLAUDE.md');
  if (!await fs.pathExists(claudePath)) return deployed;

  const content = await fs.readFile(claudePath, 'utf-8');
  const lines = content.split('\n');
  const headings = lines
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => line.startsWith('## '));

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]!;
    const nextIdx = i + 1 < headings.length ? headings[i + 1]!.idx : lines.length;
    const sectionContent = lines.slice(heading.idx, nextIdx).join('\n');
    // Try to derive directive ID from heading text
    const title = heading.line.replace(/^##\s+/, '').trim();
    const id = titleToId(title);

    deployed.push({
      id,
      platform: 'claude-code',
      enforcement: 'enforced', // Claude Code only supports enforced
      filePath: claudePath,
      content: sectionContent,
    });
  }

  return deployed;
}

async function scanGithubCopilot(cwd: string): Promise<DeployedDirective[]> {
  const deployed: DeployedDirective[] = [];

  // Enforced: .github/copilot-instructions.md
  const instructionsPath = path.join(cwd, '.github', 'copilot-instructions.md');
  if (await fs.pathExists(instructionsPath)) {
    const content = await fs.readFile(instructionsPath, 'utf-8');
    const lines = content.split('\n');
    const headings = lines
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => line.startsWith('## '));

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i]!;
      const nextIdx = i + 1 < headings.length ? headings[i + 1]!.idx : lines.length;
      const sectionContent = lines.slice(heading.idx, nextIdx).join('\n');
      const title = heading.line.replace(/^##\s+/, '').trim();
      const id = titleToId(title);

      deployed.push({
        id,
        platform: 'github-copilot',
        enforcement: 'enforced',
        filePath: instructionsPath,
        content: sectionContent,
      });
    }
  }

  // Contextual: .github/instructions/*.instructions.md
  const instrDir = path.join(cwd, '.github', 'instructions');
  if (await fs.pathExists(instrDir)) {
    const files = await findFiles(instrDir, '.md');
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const id = path.basename(file, '.instructions.md');
      deployed.push({
        id,
        platform: 'github-copilot',
        enforcement: 'contextual',
        filePath: file,
        content,
      });
    }
  }

  // Available: .github/skills/*/SKILL.md
  const skillsDir = path.join(cwd, '.github', 'skills');
  if (await fs.pathExists(skillsDir)) {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
      if (await fs.pathExists(skillMd)) {
        const content = await fs.readFile(skillMd, 'utf-8');
        deployed.push({
          id: entry.name,
          platform: 'github-copilot',
          enforcement: 'available',
          filePath: skillMd,
          content,
        });
      }
    }
  }

  return deployed;
}

async function scanAmazonQ(cwd: string): Promise<DeployedDirective[]> {
  const deployed: DeployedDirective[] = [];
  const rulesDir = path.join(cwd, '.amazonq', 'rules');
  if (!await fs.pathExists(rulesDir)) return deployed;

  const files = await findFiles(rulesDir, '.md');
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    deployed.push({
      id: path.basename(file, '.md'),
      platform: 'amazon-q',
      enforcement: 'enforced', // Amazon Q: all rules are always-loaded
      filePath: file,
      content,
    });
  }

  return deployed;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findFiles(dirPath: string, extension: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await findFiles(fullPath, extension);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Convert a directive title to an ID (e.g., "Git Management" → "git-management")
 */
function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Compare content to see if there's a meaningful difference.
 * Strips frontmatter and whitespace for comparison.
 */
function contentDiffers(deployed: string, curated: string): boolean {
  return normalize(deployed) !== normalize(curated);
}

function normalize(content: string): string {
  // Strip frontmatter
  const stripped = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  // Normalize whitespace
  return stripped.trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}
