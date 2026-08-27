#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const DIRECTIVES_BASE = path.join(__dirname, '..', 'curated-presets', 'directives');
const MANIFEST_PATH = path.join(__dirname, '..', 'curated-presets', 'directives-manifest.json');

async function parseSkillFrontmatter(skillDir) {
  const skillPath = path.join(skillDir, 'SKILL.md');
  const content = await fs.readFile(skillPath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return null;
  
  const frontmatter = yaml.load(match[1]);
  
  if (!frontmatter.name) return null;
  
  const meta = frontmatter.metadata || {};
  
  const directive = {
    id: frontmatter.name,
    title: meta['cairel-title'] || frontmatter.name,
    description: frontmatter.description || '',
    category: meta['cairel-category'] || 'general',
    alwaysInclude: meta['cairel-always-include'] || false,
    enforcement: meta['cairel-enforcement'] || 'contextual'
  };
  
  const conditions = meta['cairel-conditions'];
  if (conditions) {
    // Convert kebab-case to camelCase for consistency
    const camelConditions = {};
    for (const [key, value] of Object.entries(conditions)) {
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      camelConditions[camelKey] = value;
    }
    directive.conditions = camelConditions;
  }
  
  return directive;
}

async function scanDirectives() {
  const directives = [];
  const entries = await fs.readdir(DIRECTIVES_BASE, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const directiveDir = path.join(DIRECTIVES_BASE, entry.name);
    const skillFile = path.join(directiveDir, 'SKILL.md');
    
    try {
      await fs.access(skillFile);
      const directive = await parseSkillFrontmatter(directiveDir);
      if (directive) directives.push(directive);
    } catch {
      // No SKILL.md in this directory, skip
    }
  }
  
  return directives;
}

async function generateManifest() {
  console.log('🔍 Scanning directives...');
  
  const directives = await scanDirectives();
  
  console.log(`✓ Found ${directives.length} directives`);
  
  const manifest = { directives };
  
  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  
  console.log(`✓ Manifest generated: ${MANIFEST_PATH}`);
}

generateManifest().catch(error => {
  console.error('Error generating manifest:', error);
  process.exit(1);
});
