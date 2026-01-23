import { z } from 'zod';
import Ajv from 'ajv';
import * as fs from 'fs-extra';
import * as path from 'path';
import matter from 'gray-matter';

// Zod schema for rule frontmatter
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
}

export class Validator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  /**
   * Validate a rule markdown file
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
      const files = await this.findMarkdownFiles(dirPath);

      for (const file of files) {
        const result = await this.validateRule(file);
        results.set(path.relative(dirPath, file), result);
      }
    } catch (error) {
      // Return empty map on error
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
      // Return empty map on error
    }

    return results;
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
