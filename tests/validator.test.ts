import { describe, it, expect } from '@jest/globals';
import { Validator } from '../src/core/validator';
import * as path from 'path';

describe('Validator', () => {
  const validator = new Validator();

  describe('Rule Validation', () => {
    it('should validate all curated rules successfully', async () => {
      const rulesPath = path.join(__dirname, '../curated-presets/rules');
      const results = await validator.validateRulesDirectory(rulesPath);

      expect(results.size).toBeGreaterThan(0);

      for (const [file, result] of results) {
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should detect missing frontmatter', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-no-frontmatter.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Missing frontmatter');
    });

    it('should detect missing id field', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-missing-id.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });

    it('should detect invalid version format', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-bad-version.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('version'))).toBe(true);
    });

    it('should detect invalid category', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-bad-category.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('category'))).toBe(true);
    });

    it('should detect invalid date format', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-bad-date.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('last-updated'))).toBe(true);
    });

    it('should detect missing tags', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-missing-tags.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tags'))).toBe(true);
    });

    it('should detect missing description', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-rule-missing-description.md');
      const result = await validator.validateRule(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description'))).toBe(true);
    });
  });

  describe('Kiro Steering Validation', () => {
    it('should validate a valid "inclusion: always" steering file', async () => {
      const testFile = path.join(__dirname, 'fixtures/steering-valid-always.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid "inclusion: auto" steering file with name and description', async () => {
      const testFile = path.join(__dirname, 'fixtures/steering-valid-auto.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when the inclusion field is missing', async () => {
      const testFile = path.join(__dirname, 'fixtures/steering-invalid-missing-inclusion.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('inclusion'))).toBe(true);
    });

    it('should fail with a helpful message for an invalid inclusion value', async () => {
      const testFile = path.join(__dirname, 'fixtures/steering-invalid-inclusion.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('always') || e.includes('auto') || e.toLowerCase().includes('inclusion'))).toBe(true);
    });

    it('should fail when "inclusion: auto" is missing name and description', async () => {
      const testFile = path.join(__dirname, 'fixtures/steering-invalid-auto-incomplete.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('name') || e.includes('description'))).toBe(true);
    });

    it('should not apply the legacy RuleMetaSchema to steering files', async () => {
      // A valid steering file has no meta.id/meta.title — it must still pass
      const testFile = path.join(__dirname, 'fixtures/steering-valid-always.md');
      const result = await validator.validateSteeringFile(testFile);

      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.includes('id') || e.includes('title'))).toBe(false);
    });
  });

  describe('Agent Validation', () => {
    it('should validate general-dev agent successfully', async () => {
      const agentPath = path.join(__dirname, '../curated-presets/agents/general-dev.json');
      const result = await validator.validateAgent(agentPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid JSON', async () => {
      const testFile = path.join(__dirname, 'fixtures/invalid-agent.json');
      const result = await validator.validateAgent(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Cursor .mdc Directive Validation', () => {
    it('should validate a valid .mdc file (alwaysApply: true → enforced)', async () => {
      const testFile = path.join(__dirname, 'fixtures/cursor-valid-enforced.mdc');
      const result = await validator.validateCursorDirective(testFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.enforcement).toBe('enforced');
    });

    it('should map alwaysApply: false → available', async () => {
      const testFile = path.join(__dirname, 'fixtures/cursor-valid-available.mdc');
      const result = await validator.validateCursorDirective(testFile);

      expect(result.valid).toBe(true);
      expect(result.enforcement).toBe('available');
    });

    it('should map missing alwaysApply → contextual', async () => {
      const testFile = path.join(__dirname, 'fixtures/cursor-valid-contextual.mdc');
      const result = await validator.validateCursorDirective(testFile);

      expect(result.valid).toBe(true);
      expect(result.enforcement).toBe('contextual');
    });

    it('should accept globs as a string or array', async () => {
      const stringGlob = await validator.validateCursorDirective(
        path.join(__dirname, 'fixtures/cursor-valid-available.mdc')
      );
      const arrayGlob = await validator.validateCursorDirective(
        path.join(__dirname, 'fixtures/cursor-valid-contextual.mdc')
      );

      expect(stringGlob.valid).toBe(true);
      expect(arrayGlob.valid).toBe(true);
    });

    it('should fail when description is missing', async () => {
      const testFile = path.join(__dirname, 'fixtures/cursor-invalid-missing-description.mdc');
      const result = await validator.validateCursorDirective(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('description'))).toBe(true);
    });

    it('should fail when frontmatter is missing entirely', async () => {
      const testFile = path.join(__dirname, 'fixtures/cursor-invalid-no-frontmatter.mdc');
      const result = await validator.validateCursorDirective(testFile);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('frontmatter'))).toBe(true);
    });

    it('should detect .mdc files when scanning a directory', async () => {
      const dirPath = path.join(__dirname, 'fixtures/cursor-rules-dir');
      const results = await validator.validateRulesDirectory(dirPath);

      expect(results.size).toBe(2);
      for (const [, result] of results) {
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });
});
