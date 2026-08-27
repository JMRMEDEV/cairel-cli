import { promises as fs } from 'fs';
import { join } from 'path';
import { QuickSetupAnswers, DetailedSetupAnswers, isDetailedMode } from '../types/wizard';

interface RuleConditions {
  languages?: string[];
  frameworks?: string[];
  projectTypes?: string[];
  requiresGit?: boolean;
  requiresEnvVars?: boolean;
  versioningStrategy?: string[];
  uiLibrary?: string[];
  linter?: string[];
}

interface RuleDefinition {
  id: string;
  category: string;
  alwaysInclude?: boolean;
  conditions?: RuleConditions;
}

interface RulesManifest {
  rules: RuleDefinition[];
}

let manifestCache: RulesManifest | null = null;

/** Clear the cached manifest. Useful for testing. */
export function clearCache(): void {
  manifestCache = null;
}

async function loadManifest(): Promise<RulesManifest> {
  if (manifestCache) return manifestCache;

  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'rules-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  manifestCache = JSON.parse(content);
  return manifestCache!;
}

function matchesConditions(
  rule: RuleDefinition,
  answers: QuickSetupAnswers | DetailedSetupAnswers
): boolean {
  // Rules with always-include but no conditions are truly universal
  if (rule.alwaysInclude && !rule.conditions) return true;
  
  // Rules without conditions are never auto-included
  if (!rule.conditions) return false;

  const conditions = rule.conditions;

  // Check language
  if (conditions.languages && !conditions.languages.includes(answers.language)) {
    return false;
  }

  // Check framework
  if (conditions.frameworks && !conditions.frameworks.includes(answers.framework)) {
    return false;
  }

  // Check project type
  if (conditions.projectTypes && !conditions.projectTypes.includes(answers.projectType)) {
    return false;
  }

  // Check git
  if (conditions.requiresGit !== undefined && conditions.requiresGit !== answers.useGit) {
    return false;
  }

  // Check env vars (only in detailed mode)
  if (conditions.requiresEnvVars !== undefined) {
    if (isDetailedMode(answers)) {
      const hasEnvVars = answers.envVarStrategy !== 'no';
      if (conditions.requiresEnvVars !== hasEnvVars) {
        return false;
      }
    } else {
      return false;
    }
  }

  // Check versioning strategy (only in detailed mode)
  if (conditions.versioningStrategy) {
    if (!isDetailedMode(answers) || !conditions.versioningStrategy.includes(answers.versioningStrategy)) {
      return false;
    }
  }

  // Check UI library (only in detailed mode)
  if (conditions.uiLibrary) {
    if (!isDetailedMode(answers) || !answers.uiLibrary || !conditions.uiLibrary.includes(answers.uiLibrary)) {
      return false;
    }
  }

  // Check linter (only in detailed mode)
  if (conditions.linter) {
    if (!isDetailedMode(answers) || !conditions.linter.includes(answers.linter)) {
      return false;
    }
  }

  return true;
}

export async function selectRules(answers: QuickSetupAnswers | DetailedSetupAnswers): Promise<string[]> {
  const manifest = await loadManifest();
  const selectedRules: string[] = [];

  for (const rule of manifest.rules) {
    if (matchesConditions(rule, answers)) {
      selectedRules.push(rule.id);
    }
  }

  // Add user-selected additional skills
  if (answers.additionalSkills && answers.additionalSkills.length > 0) {
    selectedRules.push(...answers.additionalSkills);
  }

  return selectedRules;
}

export async function getRuleCategory(ruleName: string): Promise<string> {
  const manifest = await loadManifest();
  const rule = manifest.rules.find(r => r.id === ruleName);
  return rule?.category || 'general';
}
