import { promises as fs } from 'fs';
import { join } from 'path';
import { QuickSetupAnswers, DetailedSetupAnswers, isDetailedMode } from '../types/wizard';

interface DirectiveConditions {
  languages?: string[];
  frameworks?: string[];
  projectTypes?: string[];
  requiresGit?: boolean;
  requiresEnvVars?: boolean;
  versioningStrategy?: string[];
  uiLibrary?: string[];
  linter?: string[];
}

export interface DirectiveDefinition {
  id: string;
  title?: string;
  description?: string;
  category: string;
  alwaysInclude?: boolean;
  enforcement: 'enforced' | 'contextual' | 'available';
  conditions?: DirectiveConditions;
}

export interface DirectivesManifest {
  directives: DirectiveDefinition[];
}

let manifestCache: DirectivesManifest | null = null;

/** Clear the cached manifest. Useful for testing. */
export function clearCache(): void {
  manifestCache = null;
}

async function loadManifest(): Promise<DirectivesManifest> {
  if (manifestCache) return manifestCache;

  const manifestPath = join(__dirname, '..', '..', 'curated-presets', 'directives-manifest.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  manifestCache = JSON.parse(content);
  return manifestCache!;
}

/** Public access to the manifest for use by the directive generator. */
export async function loadManifestPublic(): Promise<DirectivesManifest> {
  return loadManifest();
}

function matchesConditions(
  directive: DirectiveDefinition,
  answers: QuickSetupAnswers | DetailedSetupAnswers
): boolean {
  // Directives with always-include but no conditions are truly universal
  if (directive.alwaysInclude && !directive.conditions) return true;
  
  // Directives without conditions are never auto-included
  if (!directive.conditions) return false;

  const conditions = directive.conditions;

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

export async function selectDirectives(answers: QuickSetupAnswers | DetailedSetupAnswers): Promise<string[]> {
  const manifest = await loadManifest();
  const selectedDirectives: string[] = [];

  for (const directive of manifest.directives) {
    if (matchesConditions(directive, answers)) {
      selectedDirectives.push(directive.id);
    }
  }

  // Add user-selected additional directives
  if (answers.additionalSkills && answers.additionalSkills.length > 0) {
    selectedDirectives.push(...answers.additionalSkills);
  }

  return selectedDirectives;
}

export async function getDirectiveCategory(directiveName: string): Promise<string> {
  const manifest = await loadManifest();
  const directive = manifest.directives.find(d => d.id === directiveName);
  return directive?.category || 'general';
}

// Re-export with old names for backward compatibility during transition
export const selectRules = selectDirectives;
export const getRuleCategory = getDirectiveCategory;
