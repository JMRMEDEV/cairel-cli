import { select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import { EnforcementLevel, EnforcementOverrides, WizardMode } from '../types/wizard';
import { DirectiveDefinition, DirectivesManifest } from './directives-selector';

function getTerminalPageSize(): number {
  return Math.min((process.stdout.rows || 24) - 3, 15);
}

export interface EnforcementSelection {
  overrides: EnforcementOverrides;
}

/**
 * Get default enforcement levels for a list of directive IDs from the manifest.
 */
export function getDefaultEnforcement(
  directiveIds: string[],
  manifest: DirectivesManifest
): Record<string, EnforcementLevel> {
  const defaults: Record<string, EnforcementLevel> = {};
  for (const id of directiveIds) {
    const def = manifest.directives.find(d => d.id === id);
    defaults[id] = def?.enforcement ?? 'contextual';
  }
  return defaults;
}

/**
 * Group directives by enforcement level.
 */
function groupByEnforcement(
  directiveIds: string[],
  enforcement: Record<string, EnforcementLevel>
): Record<EnforcementLevel, string[]> {
  const groups: Record<EnforcementLevel, string[]> = {
    enforced: [],
    contextual: [],
    available: [],
  };
  for (const id of directiveIds) {
    const level = enforcement[id] ?? 'contextual';
    groups[level].push(id);
  }
  return groups;
}

/**
 * Display enforcement summary in a readable format.
 */
function displayEnforcementSummary(
  groups: Record<EnforcementLevel, string[]>
): void {
  console.log(chalk.bold.cyan('\n📋 Enforcement Level Summary\n'));

  if (groups.enforced.length > 0) {
    console.log(chalk.green(`  🔒 Enforced (${groups.enforced.length}):`));
    for (const id of groups.enforced) {
      console.log(chalk.gray(`     - ${id}`));
    }
  }

  if (groups.contextual.length > 0) {
    console.log(chalk.yellow(`  ⚡ Contextual (${groups.contextual.length}):`));
    for (const id of groups.contextual) {
      console.log(chalk.gray(`     - ${id}`));
    }
  }

  if (groups.available.length > 0) {
    console.log(chalk.blue(`  📦 Available (${groups.available.length}):`));
    for (const id of groups.available) {
      console.log(chalk.gray(`     - ${id}`));
    }
  }

  console.log('');
}

/**
 * Quick mode: returns manifest defaults without any user interaction.
 */
export function selectEnforcementQuick(
  directiveIds: string[],
  manifest: DirectivesManifest
): EnforcementOverrides {
  // Quick mode uses manifest defaults — no prompts
  return getDefaultEnforcement(directiveIds, manifest);
}

/**
 * Detailed mode: shows summary and asks if user wants to customize.
 * If yes, allows moving directives between enforcement groups.
 */
export async function selectEnforcementDetailed(
  directiveIds: string[],
  manifest: DirectivesManifest
): Promise<EnforcementOverrides> {
  const defaults = getDefaultEnforcement(directiveIds, manifest);
  const groups = groupByEnforcement(directiveIds, defaults);

  displayEnforcementSummary(groups);

  const action = await select<'accept' | 'customize'>({
    message: 'Accept default enforcement levels or customize?',
    choices: [
      { name: 'Accept defaults', value: 'accept' as const },
      { name: 'Customize enforcement levels', value: 'customize' as const },
    ],
  });

  if (action === 'accept') {
    return defaults;
  }

  return await customizeEnforcementByGroup(directiveIds, defaults);
}

/**
 * Custom mode: allows per-directive enforcement level selection.
 */
export async function selectEnforcementCustom(
  directiveIds: string[],
  manifest: DirectivesManifest
): Promise<EnforcementOverrides> {
  const defaults = getDefaultEnforcement(directiveIds, manifest);
  const overrides: EnforcementOverrides = { ...defaults };

  console.log(chalk.bold.cyan('\n📋 Set Enforcement Level Per Directive\n'));

  for (const id of directiveIds) {
    const currentLevel = defaults[id] ?? 'contextual';
    const level = await select<EnforcementLevel>({
      message: `${id} [default: ${currentLevel}]:`,
      choices: [
        { name: '🔒 Enforced (always active)', value: 'enforced' as const },
        { name: '⚡ Contextual (auto-triggered)', value: 'contextual' as const },
        { name: '📦 Available (on-demand)', value: 'available' as const },
      ],
      default: currentLevel,
    });
    overrides[id] = level;
  }

  return overrides;
}

/**
 * Customize enforcement by moving directives between groups.
 * Shows each group and lets user select which to move up/down.
 */
async function customizeEnforcementByGroup(
  directiveIds: string[],
  currentEnforcement: Record<string, EnforcementLevel>
): Promise<EnforcementOverrides> {
  const overrides: EnforcementOverrides = { ...currentEnforcement };

  // Ask which level to move directives TO
  const targetLevel = await select<EnforcementLevel>({
    message: 'Move directives to which enforcement level?',
    choices: [
      { name: '🔒 Enforced (always active)', value: 'enforced' as const },
      { name: '⚡ Contextual (auto-triggered)', value: 'contextual' as const },
      { name: '📦 Available (on-demand)', value: 'available' as const },
    ],
  });

  // Show directives NOT already at that level, let user pick which to move
  const candidates = directiveIds.filter(id => overrides[id] !== targetLevel);

  if (candidates.length === 0) {
    console.log(chalk.gray('  All directives are already at that level.'));
    return overrides;
  }

  const toMove = await checkbox<string>({
    message: `Select directives to set as "${targetLevel}":`,
    choices: candidates.map(id => ({
      name: `${id} (currently: ${overrides[id]})`,
      value: id,
    })),
    pageSize: getTerminalPageSize(),
  });

  for (const id of toMove) {
    overrides[id] = targetLevel;
  }

  // Ask if they want to continue customizing
  const continueCustomizing = await select<'done' | 'continue'>({
    message: 'Continue customizing?',
    choices: [
      { name: 'Done — accept current levels', value: 'done' as const },
      { name: 'Move more directives', value: 'continue' as const },
    ],
  });

  if (continueCustomizing === 'continue') {
    return await customizeEnforcementByGroup(directiveIds, overrides);
  }

  return overrides;
}

/**
 * Main entry point: select enforcement levels based on wizard mode.
 */
export async function selectEnforcement(
  mode: WizardMode,
  directiveIds: string[],
  manifest: DirectivesManifest
): Promise<EnforcementOverrides> {
  switch (mode) {
    case 'quick':
      return selectEnforcementQuick(directiveIds, manifest);
    case 'detailed':
      return await selectEnforcementDetailed(directiveIds, manifest);
    case 'custom':
      return await selectEnforcementCustom(directiveIds, manifest);
  }
}
