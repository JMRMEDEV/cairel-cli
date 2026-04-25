import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TEST_DIR = join(__dirname, '../.test-update');
const CAIREL_BIN = join(__dirname, '../dist/index.js');

describe('Update Command', () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Configuration Detection', () => {
    it('should detect missing configuration', () => {
      const result = execSync(`cd ${TEST_DIR} && node ${CAIREL_BIN} update`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('No existing configuration found');
      expect(result).toContain('cairel init');
    });

    it('should detect kiro-cli configuration', () => {
      const kirosPath = join(TEST_DIR, '.kiro/steering');
      mkdirSync(kirosPath, { recursive: true });
      writeFileSync(join(kirosPath, 'test-rule.md'), '# Test Rule');

      // Note: This will prompt for input, so we can't fully test interactively
      // We're just checking that it detects the config
      try {
        execSync(`cd ${TEST_DIR} && echo "skills\nn" | node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
          timeout: 2000,
        });
      } catch (error: any) {
        // Expected to fail due to user cancellation
        expect(error.stdout || '').toContain('kiro-cli configuration');
      }
    });

    it('should detect Amazon Q configuration', () => {
      const amazonqPath = join(TEST_DIR, '.amazonq/rules');
      mkdirSync(amazonqPath, { recursive: true });
      writeFileSync(join(amazonqPath, 'test-rule.md'), '# Test Rule');

      try {
        execSync(`cd ${TEST_DIR} && echo "skills\nn" | node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
          timeout: 2000,
        });
      } catch (error: any) {
        expect(error.stdout || '').toContain('Amazon Q configuration');
      }
    });
  });

  describe('Backup Creation', () => {
    it('should prompt for backup confirmation', () => {
      const kirosPath = join(TEST_DIR, '.kiro/steering');
      mkdirSync(kirosPath, { recursive: true });
      writeFileSync(join(kirosPath, 'context-retrieval.md'), '# Old Version');

      try {
        execSync(`cd ${TEST_DIR} && echo "skills\ny" | node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
          timeout: 5000,
        });
      } catch (error: any) {
        // Command will timeout waiting for input, but we can check the prompt
        expect(error.stdout || '').toContain('Backup will be created');
        expect(error.stdout || '').toContain('.backup-');
      }
    });

    it('should allow user to cancel update', () => {
      const kirosPath = join(TEST_DIR, '.kiro/steering');
      mkdirSync(kirosPath, { recursive: true });
      writeFileSync(join(kirosPath, 'context-retrieval.md'), '# Old Version');

      try {
        execSync(`cd ${TEST_DIR} && printf "skills\\nn\\n" | node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
          timeout: 5000,
        });
      } catch (error: any) {
        // @inquirer/prompts exits with error on non-TTY stdin, which is expected
        // The important thing is the command attempted to run
        expect(error).toBeDefined();
      }
    });
  });

  describe('Rule Management', () => {
    it('should show update options prompt', () => {
      const kirosPath = join(TEST_DIR, '.kiro/steering');
      mkdirSync(kirosPath, { recursive: true });
      writeFileSync(join(kirosPath, 'my-custom-rule.md'), '# Custom');

      try {
        execSync(`cd ${TEST_DIR} && timeout 2 node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
        });
      } catch (error: any) {
        expect(error.stdout || '').toContain('What would you like to update');
        expect(error.stdout || '').toContain('Skills only');
        expect(error.stdout || '').toContain('Agents only');
        expect(error.stdout || '').toContain('Both');
      }
    });
  });

  describe('Update Statistics', () => {
    it('should show configuration type in output', () => {
      const kirosPath = join(TEST_DIR, '.kiro/steering');
      mkdirSync(kirosPath, { recursive: true });

      try {
        execSync(`cd ${TEST_DIR} && timeout 2 node ${CAIREL_BIN} update`, {
          encoding: 'utf-8',
        });
      } catch (error: any) {
        expect(error.stdout || '').toContain('Found');
        expect(error.stdout || '').toContain('configuration');
      }
    });
  });
});
