import { z } from 'zod';
import Ajv from 'ajv';
import * as fs from 'fs-extra';
import * as path from 'path';
import matter from 'gray-matter';

// Zod schema for skills frontmatter (agentskills.io spec + cairel metadata)
const SkillFrontmatterSchema = z.object({
  name: z.string().min(1).max(64).regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, 'Name must be lowercase letters, numbers, and hyphens. Cannot start/end with hyphen.'),
  description: z.string().min(1, 'Description is required').max(1024, 'Description must be at most 1024 characters'),
  metadata: z.object({
    'cairel-title': z.string().min(1).optional(),
    'cairel-category': z.enum(['general', 'typescript', 'javascript', 'python', 'lua', 'git', 'ui', 'backend', 'testing', 'golang']).optional(),
    'cairel-version': z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format').optional(),
    'cairel-tags': z.array(z.string()).optional(),
    'cairel-always-include': z.boolean().optional(),
    'cairel-enforcement': z.enum(['enforced', 'contextual', 'available']),
    'cairel-conditions': z.object({
      languages: z.array(z.string()).optional(),
      frameworks: z.array(z.string()).optional(),
      'project-types': z.array(z.string()).optional(),
      'ui-library': z.array(z.string()).optional(),
      linter: z.array(z.string()).optional(),
      'versioning-strategy': z.array(z.string()).optional(),
      'requires-git': z.boolean().optional(),
      'requires-env-vars': z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Kiro steering file schema (inclusion: always|auto)
const KiroSteeringSchema = z.object({
  inclusion: z.enum(['always', 'auto'], {
    error: (issue) =>
      issue.input === undefined
        ? 'Missing "inclusion" field. Expected "always" or "auto".'
        : 'Invalid "inclusion" value. Expected "always" or "auto".',
  }),
  name: z.string().min(1, 'Name must not be empty').optional(),
  description: z.string().min(1, 'Description must not be empty').optional(),
}).refine(
  (data) => {
    // When inclusion is 'auto', name and description are required
    if (data.inclusion === 'auto') {
      return !!data.name && !!data.description;
    }
    return true;
  },
  {
    message: 'Steering files with "inclusion: auto" require both "name" and "description" fields.',
  }
);

// Legacy Zod schema for old rule frontmatter
const RuleMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(20, 'Description must be at least 20 characters').max(150, 'Description must be at most 150 characters'),
  author: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format (e.g., 1.0.0)'),
  category: z.enum(['general', 'typescript', 'javascript', 'python', 'lua', 'git', 'ui', 'backend', 'testing', 'golang']),
  tags: z.array(z.string()).min(1),
  'ai-tools': z.array(z.string()).min(1),
  'last-updated': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  'always-include': z.boolean().optional(),
  conditions: z.object({
    languages: z.array(z.string()).optional(),
    frameworks: z.array(z.string()).optional(),
    'project-types': z.array(z.string()).optional(),
    'ui-library': z.array(z.string()).optional(),
    linter: z.array(z.string()).optional(),
    'versioning-strategy': z.array(z.string()).optional(),
    'requires-git': z.boolean().optional(),
    'requires-env-vars': z.boolean().optional(),
  }).optional(),
});

// Zod schema for Cursor .mdc directive frontmatter
// Cursor rules use YAML frontmatter with:
//   - description: string (required)
//   - alwaysApply: boolean (optional — controls enforcement level)
//   - globs: string | string[] (optional — file glob scoping)
const CursorDirectiveSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  alwaysApply: z.boolean().optional(),
  globs: z.union([z.string(), z.array(z.string())]).optional(),
});

// Enforcement level derived from Cursor .mdc frontmatter
export type CursorEnforcement = 'enforced' | 'contextual' | 'available';

/**
 * Map Cursor .mdc frontmatter to an enforcement level.
 *   alwaysApply: true  → enforced
 *   alwaysApply: false → available
 *   alwaysApply absent → contextual (Cursor's "Apply Intelligently")
 */
export function cursorEnforcementLevel(data: { alwaysApply?: boolean }): CursorEnforcement {
  if (data.alwaysApply === true) return 'enforced';
  if (data.alwaysApply === false) return 'available';
  return 'contextual';
}

// AJV schema for agent JSON
const agentJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    prompt: { type: 'string', minLength: 1 },
    mcpServers: {
      type: 'object',
      patternProperties: {
        '.*': {
          type: 'object',
          required: ['command'],
          properties: {
            type: { type: 'string', enum: ['stdio'] },
            command: { type: 'string' },
            args: { type: 'array', items: { type: 'string' } },
            env: { type: 'object' },
            timeout: { type: 'number' },
            cwd: { type: 'string' },
            disabled: { type: 'boolean' },
          },
        },
      },
    },
    tools: { type: 'array', items: { type: 'string' } },
    toolAliases: { type: 'object' },
    allowedTools: { type: 'array', items: { type: 'string' } },
    resources: { type: 'array', items: { type: 'string' } },
    toolsSettings: { type: 'object' },
    hooks: {
      type: 'object',
      properties: {
        agentSpawn: { type: 'array' },
        userPromptSubmit: { type: 'array' },
        preToolUse: { type: 'array' },
        postToolUse: { type: 'array' },
        stop: { type: 'array' },
      },
    },
    includeMcpJson: { type: 'boolean' },
    useLegacyMcpJson: { type: 'boolean' },
    model: { type: 'string' },
  },
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  enforcement?: CursorEnforcement;
}

export class Validator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  /**
   * Validate a skill folder (skill-name/SKILL.md)
   */
  async validateSkill(skillDir: string): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };

    try {
      const skillFile = path.join(skillDir, 'SKILL.md');
      if (!await fs.pathExists(skillFile)) {
        result.valid = false;
        result.errors.push(`Missing SKILL.md in ${skillDir}`);
        return result;
      }

      const content = await fs.readFile(skillFile, 'utf-8');
      const parsed = matter(content);

      if (!parsed.data || Object.keys(parsed.data).length === 0) {
        result.valid = false;
        result.errors.push('Missing frontmatter');
        return result;
      }

      // Validate frontmatter
      try {
        SkillFrontmatterSchema.parse(parsed.data);
      } catch (error) {
        result.valid = false;
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            result.errors.push(`Frontmatter error: ${err.path.join('.')}: ${err.message}`);
          });
        }
      }

      // Validate name matches directory
      const dirName = path.basename(skillDir);
      if (parsed.data.name && parsed.data.name !== dirName) {
        result.valid = false;
        result.errors.push(`Skill name "${parsed.data.name}" does not match directory "${dirName}"`);
      }

      // Check for consecutive hyphens in name
      if (parsed.data.name && parsed.data.name.includes('--')) {
        result.valid = false;
        result.errors.push('Skill name must not contain consecutive hyphens');
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate all skills in a directory (expects skill-name/SKILL.md structure)
   */
  async validateSkillsDirectory(dirPath: string): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    try {
      if (!await fs.pathExists(dirPath)) return results;

      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillDir = path.join(dirPath, entry.name);
        const skillFile = path.join(skillDir, 'SKILL.md');
        if (await fs.pathExists(skillFile)) {
          const result = await this.validateSkill(skillDir);
          results.set(entry.name, result);
        }
      }
    } catch (error) {
      // Directory not accessible or read error — return empty results
      if (process.env['DEBUG']) {
        console.warn(`[validator] Could not read skills directory ${dirPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Validate a Kiro steering file (.kiro/steering/*.md)
   */
  async validateSteeringFile(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };

    try {
      if (!await fs.pathExists(filePath)) {
        result.valid = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);

      if (!parsed.data || Object.keys(parsed.data).length === 0) {
        result.valid = false;
        result.errors.push('Missing frontmatter. Kiro steering files require at least "inclusion: always" or "inclusion: auto".');
        return result;
      }

      // Validate frontmatter with KiroSteeringSchema
      try {
        KiroSteeringSchema.parse(parsed.data);
      } catch (error) {
        result.valid = false;
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            const fieldPath = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
            result.errors.push(`Frontmatter error: ${fieldPath}${err.message}`);
          });
        }
      }

      // Size warning for enforced steering files
      if (parsed.data.inclusion === 'always') {
        const lines = content.split('\n').length;
        if (lines > 30) {
          result.warnings.push(`Enforced steering file is ${lines} lines (recommended: ≤30 lines)`);
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate all steering files in a directory (.kiro/steering/)
   */
  async validateSteeringDirectory(dirPath: string): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    try {
      const files = await this.findMarkdownFiles(dirPath);

      for (const file of files) {
        const result = await this.validateSteeringFile(file);
        results.set(path.relative(dirPath, file), result);
      }
    } catch (error) {
      if (process.env['DEBUG']) {
        console.warn(`[validator] Could not read steering directory ${dirPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Validate a rule markdown file (legacy format)
   */
  async validateRule(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };

    try {
      // Check file exists
      if (!await fs.pathExists(filePath)) {
        result.valid = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      // Read file
      const content = await fs.readFile(filePath, 'utf-8');

      // Parse frontmatter
      const parsed = matter(content);

      if (!parsed.data || Object.keys(parsed.data).length === 0) {
        result.valid = false;
        result.errors.push('Missing frontmatter');
        return result;
      }

      // Validate frontmatter with Zod
      try {
        RuleMetaSchema.parse(parsed.data.meta);
      } catch (error) {
        result.valid = false;
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            result.errors.push(`Frontmatter error: ${err.path.join('.')}: ${err.message}`);
          });
        }
      }

      // Check required sections
      const requiredSections = ['Purpose', 'Critical Rules', 'Standard Rules', 'Checklist'];
      const hasCriticalOrStandard = content.includes('## 🚨 Critical Rules') || content.includes('## 📋 Standard Rules');
      
      if (!content.includes('**Purpose**:')) {
        result.warnings.push('Missing Purpose section');
      }

      if (!hasCriticalOrStandard) {
        result.warnings.push('Missing Critical Rules or Standard Rules section');
      }

      if (!content.includes('## ✅ Checklist')) {
        result.warnings.push('Missing Checklist section');
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate a Cursor directive file (.cursor/rules/*.mdc)
   */
  async validateCursorDirective(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };

    try {
      if (!await fs.pathExists(filePath)) {
        result.valid = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);

      if (!parsed.data || Object.keys(parsed.data).length === 0) {
        result.valid = false;
        result.errors.push('Missing frontmatter. Cursor directives require at least a "description" field.');
        return result;
      }

      // Validate frontmatter with CursorDirectiveSchema
      try {
        CursorDirectiveSchema.parse(parsed.data);
      } catch (error) {
        result.valid = false;
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            const fieldPath = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
            result.errors.push(`Frontmatter error: ${fieldPath}${err.message}`);
          });
        }
        return result;
      }

      // Derive enforcement level from alwaysApply mapping
      result.enforcement = cursorEnforcementLevel(parsed.data as { alwaysApply?: boolean });

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate an agent JSON file
   */
  async validateAgent(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };

    try {
      // Check file exists
      if (!await fs.pathExists(filePath)) {
        result.valid = false;
        result.errors.push(`File not found: ${filePath}`);
        return result;
      }

      // Read and parse JSON
      const content = await fs.readFile(filePath, 'utf-8');
      let agentConfig;

      try {
        agentConfig = JSON.parse(content);
      } catch (error) {
        result.valid = false;
        result.errors.push('Invalid JSON format');
        return result;
      }

      // Validate with AJV
      const validate = this.ajv.compile(agentJsonSchema);
      const valid = validate(agentConfig);

      if (!valid && validate.errors) {
        result.valid = false;
        validate.errors.forEach(err => {
          result.errors.push(`${err.instancePath || 'root'}: ${err.message}`);
        });
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate all rules in a directory
   */
  async validateRulesDirectory(dirPath: string): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    try {
      const files = await this.findDirectiveFiles(dirPath);

      for (const file of files) {
        const result = file.endsWith('.mdc')
          ? await this.validateCursorDirective(file)
          : await this.validateRule(file);
        results.set(path.relative(dirPath, file), result);
      }
    } catch (error) {
      if (process.env['DEBUG']) {
        console.warn(`[validator] Could not read rules directory ${dirPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Validate all agents in a directory
   */
  async validateAgentsDirectory(dirPath: string): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    try {
      const files = await this.findJsonFiles(dirPath);

      for (const file of files) {
        const result = await this.validateAgent(file);
        results.set(path.relative(dirPath, file), result);
      }
    } catch (error) {
      if (process.env['DEBUG']) {
        console.warn(`[validator] Could not read agents directory ${dirPath}:`, error);
      }
    }

    return results;
  }

  /**
   * Find directive files (.md and .mdc) recursively.
   * Includes Cursor's .mdc extension alongside standard .md files.
   * Excludes README.md.
   */
  private async findDirectiveFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.md') || entry.name.endsWith('.mdc')) &&
          entry.name !== 'README.md'
        ) {
          files.push(fullPath);
        }
      }
    }

    if (await fs.pathExists(dirPath)) {
      await scan(dirPath);
    }

    return files;
  }

  private async findMarkdownFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md') {
          files.push(fullPath);
        }
      }
    }

    if (await fs.pathExists(dirPath)) {
      await scan(dirPath);
    }

    return files;
  }

  private async findJsonFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    }

    if (await fs.pathExists(dirPath)) {
      await scan(dirPath);
    }

    return files;
  }
}
