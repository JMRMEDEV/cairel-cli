#!/usr/bin/env node
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

const { startServer } = await import(resolve(__dirname, '..', 'src', 'server.js'));
startServer();
