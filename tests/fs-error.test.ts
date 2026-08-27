import { describe, it, expect } from '@jest/globals';
import { formatFsError, isFsError } from '../src/core/fs-error';

/** Build a Node.js-style errno error. */
function errnoError(code: string, message = `${code}: something`): NodeJS.ErrnoException {
  const err = new Error(message) as NodeJS.ErrnoException;
  err.code = code;
  return err;
}

describe('fs-error', () => {
  describe('isFsError', () => {
    it('recognizes objects with a code', () => {
      expect(isFsError({ code: 'ENOENT' })).toBe(true);
    });

    it('recognizes objects with a message', () => {
      expect(isFsError(new Error('boom'))).toBe(true);
    });

    it('rejects null and primitives', () => {
      expect(isFsError(null)).toBe(false);
      expect(isFsError('ENOENT')).toBe(false);
      expect(isFsError(undefined)).toBe(false);
    });
  });

  describe('formatFsError — ENOENT', () => {
    it('reports "File not found" for a file target', () => {
      const msg = formatFsError(errnoError('ENOENT'), '/tmp/nonexistent.md', 'file');
      expect(msg).toBe('⚠ File not found: /tmp/nonexistent.md');
    });

    it('reports "Directory not found" for a directory target', () => {
      const msg = formatFsError(errnoError('ENOENT'), '/tmp/nonexistent-dir', 'directory');
      expect(msg).toBe('⚠ Directory not found: /tmp/nonexistent-dir');
    });

    it('reports generic "Path not found" when the target kind is unknown', () => {
      const msg = formatFsError(errnoError('ENOENT'), '/tmp/whatever');
      expect(msg).toBe('⚠ Path not found: /tmp/whatever');
    });
  });

  describe('formatFsError — permission errors', () => {
    it('reports "Permission denied" for EACCES', () => {
      const msg = formatFsError(errnoError('EACCES'), '/root/secret');
      expect(msg).toBe('⚠ Permission denied: /root/secret');
    });

    it('reports "Permission denied" for EPERM', () => {
      const msg = formatFsError(errnoError('EPERM'), '/root/secret');
      expect(msg).toBe('⚠ Permission denied: /root/secret');
    });
  });

  describe('formatFsError — other errors', () => {
    it('reports the underlying message for unknown codes', () => {
      const msg = formatFsError(errnoError('EISDIR', 'EISDIR: illegal operation'), '/tmp/x');
      expect(msg).toBe('⚠ Cannot read /tmp/x: EISDIR: illegal operation');
    });

    it('handles non-Error values gracefully', () => {
      const msg = formatFsError('weird failure', '/tmp/x');
      expect(msg).toBe('⚠ Cannot read /tmp/x: weird failure');
    });
  });

  describe('formatFsError — never leaks a stack trace', () => {
    it('returns a single line without stack frames', () => {
      const err = errnoError('ENOENT');
      const msg = formatFsError(err, '/tmp/nonexistent.md', 'file');
      expect(msg).not.toContain('at ');
      expect(msg.split('\n')).toHaveLength(1);
    });
  });
});
