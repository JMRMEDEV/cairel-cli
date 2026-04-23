#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const SKILLS_BASE = path.join(__dirname, '..', 'curated-presets', 'skills');
const MANIFEST_PATH = path.join(__dirname, '..', 'curated-presets', 'rules-manifest.json');

async function parseSkillFrontmatter(skillDir) {
  const skillPath = path.join(skillDir, 'SKILL.md');
  const content = await fs.readFile(skillPath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return null;
  
  const frontmatter = yaml.load(match[1]);
  
  if (!frontmatter.name) return null;
  
  const meta = frontmatter.metadata || {};
  
  const rule = {
    id: frontmatter.name,
    title: meta['cairel-title'] || frontmatter.name,
    description: frontmatter.description || '',
    category: meta['cairel-category'] || 'general',
    alwaysInclude: meta['cairel-always-include'] || false
  };
  
  const conditions = meta['cairel-conditions'];
  if (conditions) {
    // Convert kebab-case to camelCase for consistency
    const camelConditions = {};
    for (const [key, value] of Object.entries(conditions)) {
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      camelConditions[camelKey] = value;
    }
    rule.conditions = camelConditions;
  }
  
  return rule;
}

async function scanSkills() {
  const rules = [];
  const entries = await fs.readdir(SKILLS_BASE, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const skillDir = path.join(SKILLS_BASE, entry.name);
    const skillFile = path.join(skillDir, 'SKILL.md');
    
    try {
      await fs.access(skillFile);
      const rule = await parseSkillFrontmatter(skillDir);
      if (rule) rules.push(rule);
    } catch {
      // No SKILL.md in this directory, skip
    }
  }
  
  return rules;
}

async function generateManifest() {
  console.log('🔍 Scanning skills...');
  
  const rules = await scanSkills();
  
  console.log(`✓ Found ${rules.length} skills`);
  
  const manifest = { rules };
  
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
