import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { handleToolCall } from './handlers.js';

export async function startServer() {
  const server = new McpServer({ name: 'cairel-planning', version: '1.0.0' });

  server.tool(
    'get_doc',
    'Get the raw markdown content of a documentation file.',
    { path: z.string().describe('Relative path from planning/, e.g. docs/architecture/decisions.md') },
    (args) => handleToolCall('get_doc', args),
  );

  server.tool(
    'get_doc_section',
    'Get a specific section from a doc file by heading name.',
    {
      path: z.string().describe('Relative path from planning/, e.g. docs/architecture/decisions.md'),
      heading: z.string().describe('Section heading to find'),
    },
    (args) => handleToolCall('get_doc_section', args),
  );

  server.tool(
    'get_task_info',
    'Get an implementation task by ID with metadata, description, and guide.',
    { id: z.string().describe('Task ID, e.g. TASK-001') },
    (args) => handleToolCall('get_task_info', args),
  );

  server.tool(
    'list_task_ids',
    'List all implementation task IDs with titles. Optionally filter by priority.',
    { priority: z.string().optional().describe('Filter by priority: P0, P1, P2, P3') },
    (args) => handleToolCall('list_task_ids', args),
  );

  server.tool(
    'get_user_story',
    'Get a user story by ID with full acceptance criteria.',
    { id: z.string().describe('Story ID, e.g. WIZ-01, PLAN-03') },
    (args) => handleToolCall('get_user_story', args),
  );

  server.tool(
    'list_user_stories',
    'List all user stories. Optionally filter by priority or scope.',
    {
      priority: z.string().optional().describe('Filter by priority: P0, P1, P2, P3'),
      scope: z.string().optional().describe('Filter by scope: Done, MVP, Post-MVP'),
    },
    (args) => handleToolCall('list_user_stories', args),
  );

  server.tool(
    'get_architecture_decision',
    'Get an architecture decision record by filename.',
    { name: z.string().describe('Filename in planning/docs/architecture/, e.g. decisions.md') },
    (args) => handleToolCall('get_architecture_decision', args),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
