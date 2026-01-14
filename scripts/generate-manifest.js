#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const RULES_BASE = path.join(__dirname, '..', 'curated-presets', 'rules');
const MANIFEST_PATH = path.join(__dirname, '..', 'curated-presets', 'rules-manifest.json');

async function parseRuleFrontmatter(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return null;
  
  const frontmatter = match[1];
  const lines = frontmatter.split('\n');
  
  const meta = {
    id: '',
    category: '',
    alwaysInclude: false,
    conditions: {}
  };
  
  let inMeta = false;
  let inConditions = false;
  let currentArray = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'meta:') {
      inMeta = true;
      continue;
    }
    
    if (trimmed === 'conditions:') {
      inConditions = true;
      continue;
    }
    
    if (inMeta && !inConditions) {
      if (trimmed.startsWith('id:')) {
        meta.id = trimmed.split('id:')[1].trim().replace(/['"]/g, '');
      } else if (trimmed.startsWith('category:')) {
        meta.category = trimmed.split('category:')[1].trim().replace(/['"]/g, '');
      } else if (trimmed.startsWith('always-include:')) {
        meta.alwaysInclude = trimmed.includes('true');
      }
    }
    
    if (inConditions) {
      if (trimmed.startsWith('languages:')) {
        currentArray = 'languages';
        meta.conditions.languages = [];
      } else if (trimmed.startsWith('frameworks:')) {
        currentArray = 'frameworks';
        meta.conditions.frameworks = [];
      } else if (trimmed.startsWith('project-types:')) {
        currentArray = 'projectTypes';
        meta.conditions.projectTypes = [];
      } else if (trimmed.startsWith('ui-library:')) {
        currentArray = 'uiLibrary';
        meta.conditions.uiLibrary = [];
      } else if (trimmed.startsWith('linter:')) {
        currentArray = 'linter';
        meta.conditions.linter = [];
      } else if (trimmed.startsWith('versioning-strategy:')) {
        currentArray = 'versioningStrategy';
        meta.conditions.versioningStrategy = [];
      } else if (trimmed.startsWith('requires-git:')) {
        meta.conditions.requiresGit = trimmed.includes('true');
        currentArray = null;
      } else if (trimmed.startsWith('requires-env-vars:')) {
        meta.conditions.requiresEnvVars = trimmed.includes('true');
        currentArray = null;
      } else if (trimmed.startsWith('- ') && currentArray) {
        const value = trimmed.substring(2).replace(/['"]/g, '');
        meta.conditions[currentArray].push(value);
      }
    }
  }
  
  return meta.id ? meta : null;
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
        const meta = await parseRuleFrontmatter(filePath);
        
        if (meta) {
          // Clean up empty conditions
          if (Object.keys(meta.conditions).length === 0) {
            delete meta.conditions;
          }
          
          rules.push(meta);
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
