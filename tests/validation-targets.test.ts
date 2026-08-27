import { describe, it, expect } from '@jest/globals';
import * as path from 'path';
import {
  resolveTargetDirs,
  isBooleanFlag,
  isPathValue,
  STANDARD_AGENT_DIRS,
  STANDARD_DIRECTIVE_DIRS,
} from '../src/core/validation-targets';

describe('validation-targets', () => {
  const cwd = '/project';

  describe('isPathValue', () => {
    it('returns true for a non-empty string', () => {
      expect(isPathValue('./agents')).toBe(true);
      expect(isPathValue('/abs/path')).toBe(true);
    });

    it('returns false for boolean true (bare flag)', () => {
      expect(isPathValue(true)).toBe(false);
    });

    it('returns false for empty or whitespace strings', () => {
      expect(isPathValue('')).toBe(false);
      expect(isPathValue('   ')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isPathValue(undefined)).toBe(false);
    });
  });

  describe('isBooleanFlag', () => {
    it('returns true only for boolean true', () => {
      expect(isBooleanFlag(true)).toBe(true);
    });

    it('returns false for strings and undefined', () => {
      expect(isBooleanFlag('./path')).toBe(false);
      expect(isBooleanFlag('')).toBe(false);
      expect(isBooleanFlag(undefined)).toBe(false);
    });
  });

  describe('resolveTargetDirs — boolean-flag mode', () => {
    it('returns all existing standard agent dirs when flag is true', () => {
      const existing = new Set([
        path.resolve(cwd, path.join('.kiro', 'agents')),
      ]);
      const result = resolveTargetDirs(true, STANDARD_AGENT_DIRS, cwd, p => existing.has(p));

      expect(result).toEqual([path.resolve(cwd, path.join('.kiro', 'agents'))]);
    });

    it('returns multiple existing standard directive dirs when flag is true', () => {
      const kiroSkills = path.resolve(cwd, path.join('.kiro', 'skills'));
      const amazonqRules = path.resolve(cwd, path.join('.amazonq', 'rules'));
      const existing = new Set([kiroSkills, amazonqRules]);

      const result = resolveTargetDirs(true, STANDARD_DIRECTIVE_DIRS, cwd, p => existing.has(p));

      expect(result).toContain(kiroSkills);
      expect(result).toContain(amazonqRules);
      expect(result).toHaveLength(2);
    });

    it('returns an empty list when no standard dirs exist (no crash)', () => {
      const result = resolveTargetDirs(true, STANDARD_AGENT_DIRS, cwd, () => false);
      expect(result).toEqual([]);
    });

    it('never returns the boolean true as a path (guards against path.resolve crash)', () => {
      const result = resolveTargetDirs(true, STANDARD_DIRECTIVE_DIRS, cwd, () => true);
      for (const dir of result) {
        expect(typeof dir).toBe('string');
      }
    });
  });

  describe('resolveTargetDirs — string-path mode', () => {
    it('resolves an explicit relative path against cwd, ignoring existence', () => {
      const result = resolveTargetDirs('./custom/agents', STANDARD_AGENT_DIRS, cwd, () => false);
      expect(result).toEqual([path.resolve(cwd, './custom/agents')]);
    });

    it('resolves an explicit absolute path unchanged', () => {
      const abs = '/somewhere/rules';
      const result = resolveTargetDirs(abs, STANDARD_DIRECTIVE_DIRS, cwd, () => false);
      expect(result).toEqual([path.resolve(cwd, abs)]);
    });

    it('treats empty string as no flag (empty result)', () => {
      const result = resolveTargetDirs('', STANDARD_AGENT_DIRS, cwd, () => true);
      expect(result).toEqual([]);
    });
  });

  describe('resolveTargetDirs — absent flag', () => {
    it('returns empty when value is undefined', () => {
      const result = resolveTargetDirs(undefined, STANDARD_AGENT_DIRS, cwd, () => true);
      expect(result).toEqual([]);
    });

    it('returns empty when value is false', () => {
      const result = resolveTargetDirs(false as any, STANDARD_AGENT_DIRS, cwd, () => true);
      expect(result).toEqual([]);
    });
  });

  describe('standard directory constants', () => {
    it('agent dirs include .kiro/agents and .amazonq/cli-agents', () => {
      expect(STANDARD_AGENT_DIRS).toContain(path.join('.kiro', 'agents'));
      expect(STANDARD_AGENT_DIRS).toContain(path.join('.amazonq', 'cli-agents'));
    });

    it('directive dirs include the known platform directories', () => {
      expect(STANDARD_DIRECTIVE_DIRS).toContain(path.join('.kiro', 'steering'));
      expect(STANDARD_DIRECTIVE_DIRS).toContain(path.join('.kiro', 'skills'));
      expect(STANDARD_DIRECTIVE_DIRS).toContain(path.join('.cursor', 'rules'));
      expect(STANDARD_DIRECTIVE_DIRS).toContain(path.join('.amazonq', 'rules'));
      expect(STANDARD_DIRECTIVE_DIRS).toContain(path.join('.github', 'instructions'));
    });
  });
});
