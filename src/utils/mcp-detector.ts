import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { MCPServer } from '../types/wizard';

const KNOWN_MCP_SERVERS = [
  'amazon-q-history',
  'gpt',
  'web-scraper',
  'cypress',
  'chakra-ui',
];

const DEFAULT_SEARCH_PATHS = [
  join(homedir(), 'mcp-servers'),
  join(homedir(), '.mcp-servers'),
  './node_modules/@mcp',
];

export function detectMCPServers(additionalPaths: string[] = []): MCPServer[] {
  const searchPaths = [...DEFAULT_SEARCH_PATHS, ...additionalPaths];
  const detected: MCPServer[] = [];

  for (const basePath of searchPaths) {
    if (!existsSync(basePath)) continue;

    for (const serverName of KNOWN_MCP_SERVERS) {
      const serverPath = join(basePath, serverName);
      const serverFile = join(serverPath, 'server.js');

      if (existsSync(serverFile)) {
        detected.push({ name: serverName, path: serverPath });
      }
    }
  }

  return detected;
}
