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
});
