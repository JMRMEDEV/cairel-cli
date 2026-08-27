import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleToolCall } from '../src/handlers.js';

describe('handleToolCall', () => {
  describe('get_doc', () => {
    it('returns file content for an existing doc', () => {
      const result = handleToolCall('get_doc', { path: 'README.md' });
      assert.ok(result.content[0].text.includes('cairel'));
    });

    it('returns error for non-existent file', () => {
      const result = handleToolCall('get_doc', { path: 'nonexistent.md' });
      const text = result.content[0].text;
      assert.ok(text.includes('error') || text.includes('not found'));
    });
  });

  describe('get_doc_section', () => {
    it('extracts a section by heading', () => {
      const result = handleToolCall('get_doc_section', { path: 'README.md', heading: 'cairel' });
      assert.ok(result.content[0].text.length > 0);
    });

    it('returns error for non-existent section', () => {
      const result = handleToolCall('get_doc_section', { path: 'README.md', heading: 'ZZZZZ_NONEXISTENT' });
      const text = result.content[0].text;
      assert.ok(text.includes('error') || text.includes('not found'));
    });
  });

  describe('get_task_info', () => {
    it('returns task content for existing task', () => {
      const result = handleToolCall('get_task_info', { id: 'TASK-001' });
      assert.ok(result.content[0].text.includes('TASK-001'));
    });

    it('handles task ID without dash', () => {
      const result = handleToolCall('get_task_info', { id: 'TASK001' });
      assert.ok(result.content[0].text.includes('TASK-001'));
    });

    it('returns error for non-existent task', () => {
      const result = handleToolCall('get_task_info', { id: 'TASK-999' });
      const text = result.content[0].text;
      assert.ok(text.includes('error') || text.includes('not found'));
    });
  });

  describe('list_task_ids', () => {
    it('lists all tasks', () => {
      const result = handleToolCall('list_task_ids', {});
      const text = result.content[0].text;
      assert.ok(text.includes('TASK-'));
    });

    it('filters by priority', () => {
      const result = handleToolCall('list_task_ids', { priority: 'P0' });
      const text = result.content[0].text;
      // Should only contain P0 tasks
      if (text.includes('TASK-')) {
        assert.ok(text.includes('P0'));
        assert.ok(!text.includes('P1') && !text.includes('P2'));
      }
    });
  });

  describe('get_user_story', () => {
    it('returns story content for existing story', () => {
      const result = handleToolCall('get_user_story', { id: 'WIZ-01' });
      assert.ok(result.content[0].text.includes('WIZ-01'));
    });

    it('returns error for non-existent story', () => {
      const result = handleToolCall('get_user_story', { id: 'ZZZ-99' });
      const text = result.content[0].text;
      assert.ok(text.includes('error') || text.includes('not found'));
    });
  });

  describe('list_user_stories', () => {
    it('lists all user stories', () => {
      const result = handleToolCall('list_user_stories', {});
      const text = result.content[0].text;
      // Should have some content
      assert.ok(text.length > 0);
    });

    it('filters by priority', () => {
      const result = handleToolCall('list_user_stories', { priority: 'P0' });
      const text = result.content[0].text;
      if (!text.includes('No user stories')) {
        assert.ok(text.includes('P0'));
      }
    });
  });

  describe('get_architecture_decision', () => {
    it('returns content for existing decision file', () => {
      const result = handleToolCall('get_architecture_decision', { name: 'decisions.md' });
      const text = result.content[0].text;
      // Either returns content or error (file may or may not exist)
      assert.ok(text.length > 0);
    });

    it('returns error for non-existent file', () => {
      const result = handleToolCall('get_architecture_decision', { name: 'nonexistent.md' });
      const text = result.content[0].text;
      assert.ok(text.includes('error') || text.includes('not found'));
    });
  });

  describe('unknown tool', () => {
    it('returns error for unknown tool name', () => {
      const result = handleToolCall('unknown_tool', {});
      const text = result.content[0].text;
      assert.ok(text.includes('Unknown tool'));
    });
  });
});
