#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const RULES_BASE = path.join(__dirname, '..', 'curated-presets', 'rules');
const MANIFEST_PATH = path.join(__dirname, '..', 'curated-presets', 'rules-manifest.json');

async function parseRuleFrontmatter(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return null;
  
  const frontmatter = yaml.load(match[1]);
  const meta = frontmatter.meta;
  
  if (!meta) return null;
  
  const rule = {
    id: meta.id,
    title: meta.title,
    description: meta.description,
    category: meta.category,
    alwaysInclude: meta['always-include'] || false
  };
  
  if (meta.conditions) {
    // Convert kebab-case to camelCase for consistency
    const conditions = {};
    for (const [key, value] of Object.entries(meta.conditions)) {
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      conditions[camelKey] = value;
    }
    rule.conditions = conditions;
  }
  
  return rule;
}

async function scanRules() {
  const categories = ['general', 'typescript', 'git', 'ui', 'backend'];
  const rules = [];
  
  for (const category of categories) {
    const categoryPath = path.join(RULES_BASE, category);
    
    try {
      const files = await fs.readdir(categoryPath);
      
      for (const file of files) {
        if (!file.endsWith('.md') || file === 'README.md') continue;
        
        const filePath = path.join(categoryPath, file);
        const rule = await parseRuleFrontmatter(filePath);
        
        if (rule) {
          rules.push(rule);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan category ${category}`);
    }
  }
  
  return rules;
}

async function generateManifest() {
  console.log('🔍 Scanning rules...');
  
  const rules = await scanRules();
  
  console.log(`✓ Found ${rules.length} rules`);
  
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
