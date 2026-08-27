import { Command } from 'commander';
import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import { join } from 'path';
import { Platform, EnforcementLevel } from '../types/wizard';
import { loadManifestPublic, DirectivesManifest } from '../core/directives-selector';
import {
  scanDeployedDirectives,
  buildUpdatePlan,
  moveDirective,
  updateDirectiveInPlace,
  getTargetPath,
  UpdateCandidate,
  DeployedDirective,
} from '../core/enforcement-updater';
import { generateDirectives, DirectiveInfo } from '../core/directive-generator';

interface UpdateStats {
  updated: number;
  added: number;
  moved: number;
  preserved: number;
  moveDetails: string[];
}

/**
 * Detect which platforms have configuration in the current directory.
 */
async function detectPlatforms(cwd: string): Promise<Platform[]> {
  const platforms: Platform[] = [];

  if (await fs.pathExists(join(cwd, '.kiro'))) platforms.push('kiro');
  if (await fs.pathExists(join(cwd, '.cursor', 'rules'))) platforms.push('cursor');
  if (await fs.pathExists(join(cwd, 'CLAUDE.md'))) platforms.push('claude-code');
  if (
    await fs.pathExists(join(cwd, '.github', 'copilot-instructions.md')) ||
    await fs.pathExists(join(cwd, '.github', 'instructions')) ||
    await fs.pathExists(join(cwd, '.github', 'skills'))
  ) {
    platforms.push('github-copilot');
  }
  if (await fs.pathExists(join(cwd, '.amazonq'))) platforms.push('amazon-q');

  return platforms;
}

/**
 * Load curated content for comparison.
 * Returns a map of directive ID → normalized curated content.
 */
async function loadCuratedContent(manifest: DirectivesManifest): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();
  const directivesBase = join(__dirname, '..', '..', 'curated-presets', 'directives');

  for (const def of manifest.directives) {
    const skillPath = join(directivesBase, def.id, 'SKILL.md');
    try {
      const content = await fs.readFile(skillPath, 'utf-8');
      contentMap.set(def.id, content);
    } catch {
      // Directive source not available
    }
  }

  return contentMap;
}

/**
 * Display enforcement summary for update candidates.
 */
function displayUpdateSummary(
  updates: UpdateCandidate[],
  newDirectives: UpdateCandidate[],
  unchanged: DeployedDirective[]
): void {
  if (updates.length > 0) {
    console.log(chalk.bold('\n📋 Directives with changes available:\n'));
    for (const u of updates) {
      const parts: string[] = [];
      if (u.hasContentUpdate) parts.push('content updated');
      if (u.hasEnforcementChange) {
        parts.push(`enforcement: ${formatLevel(u.currentEnforcement)} → ${formatLevel(u.recommendedEnforcement)}`);
      }
      console.log(chalk.yellow(`  • ${u.id} (${parts.join(', ')})`));
    }
  }

  if (newDirectives.length > 0) {
    console.log(chalk.bold('\n🆕 New directives available:\n'));
    for (const n of newDirectives) {
      console.log(chalk.green(`  • ${n.id} (${formatLevel(n.recommendedEnforcement)})`));
    }
  }

  if (unchanged.length > 0) {
    console.log(chalk.gray(`\n  ✓ ${unchanged.length} directive(s) already up to date`));
  }

  console.log('');
}

function formatLevel(level: EnforcementLevel): string {
  switch (level) {
    case 'enforced':
      return chalk.green('enforced');
    case 'contextual':
      return chalk.yellow('contextual');
    case 'available':
      return chalk.blue('available');
  }
}

export const updateCommand = new Command('update')
  .description('Update existing configuration with enforcement-level awareness')
  .action(async () => {
    const spinner = ora();
    const cwd = process.cwd();

    // Detect platforms
    spinner.start('Scanning for existing configuration...');
    const platforms = await detectPlatforms(cwd);

    if (platforms.length === 0) {
      spinner.fail('No existing configuration found');
      console.log(chalk.gray('Run "cairel init" to initialize a new configuration'));
      return;
    }

    spinner.succeed(`Found configuration for: ${platforms.map(p => chalk.cyan(p)).join(', ')}`);

    // Load manifest and curated content
    spinner.start('Loading manifest...');
    const manifest = await loadManifestPublic();
    const curatedContentMap = await loadCuratedContent(manifest);
    spinner.succeed('Manifest loaded');

    // Scan deployed directives across all platforms
    spinner.start('Scanning deployed directives...');
    const allDeployed: DeployedDirective[] = [];
    const updatePlans = new Map<Platform, ReturnType<typeof buildUpdatePlan>>();

    for (const platform of platforms) {
      const deployed = await scanDeployedDirectives(cwd, platform);
      allDeployed.push(...deployed);
      const plan = buildUpdatePlan(deployed, manifest, platform, curatedContentMap);
      updatePlans.set(platform, plan);
    }
    spinner.succeed(`Scanned ${allDeployed.length} deployed directive(s)`);

    // Aggregate update candidates across platforms
    const allUpdates: UpdateCandidate[] = [];
    const allNew: UpdateCandidate[] = [];
    const allUnchanged: DeployedDirective[] = [];

    for (const [, plan] of updatePlans) {
      allUpdates.push(...plan.updates);
      allNew.push(...plan.newDirectives);
      allUnchanged.push(...plan.unchanged);
    }

    if (allUpdates.length === 0 && allNew.length === 0) {
      console.log(chalk.green('\n✓ All directives are up to date!'));
      return;
    }

    // Display summary
    displayUpdateSummary(allUpdates, allNew, allUnchanged);

    // Ask how to proceed
    const action = await select({
      message: 'How would you like to proceed?',
      choices: [
        { name: 'Update all with recommended enforcement levels', value: 'auto' },
        { name: 'Customize enforcement levels before updating', value: 'customize' },
        { name: 'Update content only (keep current enforcement)', value: 'content-only' },
        { name: 'Cancel', value: 'cancel' },
      ],
    });

    if (action === 'cancel') {
      console.log(chalk.yellow('Update cancelled'));
      return;
    }

    // Build final update decisions
    const decisions = new Map<string, { candidate: UpdateCandidate; finalEnforcement: EnforcementLevel }>();

    if (action === 'customize') {
      // Let user decide enforcement for each directive with changes
      const candidatesWithEnforcementChange = allUpdates.filter(u => u.hasEnforcementChange);
      const candidatesContentOnly = allUpdates.filter(u => !u.hasEnforcementChange);

      // Content-only updates go through as-is
      for (const u of candidatesContentOnly) {
        decisions.set(`${u.platform}:${u.id}`, { candidate: u, finalEnforcement: u.currentEnforcement });
      }

      // Ask about enforcement changes
      if (candidatesWithEnforcementChange.length > 0) {
        console.log(chalk.bold('\n🔧 Enforcement level changes:\n'));
        for (const u of candidatesWithEnforcementChange) {
          const level = await select<EnforcementLevel>({
            message: `${u.id} (${u.platform}) [current: ${u.currentEnforcement}, recommended: ${u.recommendedEnforcement}]:`,
            choices: [
              { name: `🔒 Enforced (always active)${u.recommendedEnforcement === 'enforced' ? ' ← recommended' : ''}`, value: 'enforced' as const },
              { name: `⚡ Contextual (auto-triggered)${u.recommendedEnforcement === 'contextual' ? ' ← recommended' : ''}`, value: 'contextual' as const },
              { name: `📦 Available (on-demand)${u.recommendedEnforcement === 'available' ? ' ← recommended' : ''}`, value: 'available' as const },
            ],
            default: u.recommendedEnforcement,
          });
          decisions.set(`${u.platform}:${u.id}`, { candidate: u, finalEnforcement: level });
        }
      }

      // Ask about new directives
      if (allNew.length > 0) {
        const addNew = await confirm({
          message: `Add ${allNew.length} new directive(s)?`,
          default: true,
        });

        if (addNew) {
          for (const n of allNew) {
            const level = await select<EnforcementLevel>({
              message: `${n.id} (${n.platform}) [recommended: ${n.recommendedEnforcement}]:`,
              choices: [
                { name: `🔒 Enforced${n.recommendedEnforcement === 'enforced' ? ' ← recommended' : ''}`, value: 'enforced' as const },
                { name: `⚡ Contextual${n.recommendedEnforcement === 'contextual' ? ' ← recommended' : ''}`, value: 'contextual' as const },
                { name: `📦 Available${n.recommendedEnforcement === 'available' ? ' ← recommended' : ''}`, value: 'available' as const },
              ],
              default: n.recommendedEnforcement,
            });
            decisions.set(`${n.platform}:${n.id}`, { candidate: n, finalEnforcement: level });
          }
        }
      }
    } else if (action === 'auto') {
      // Use recommended enforcement for everything
      for (const u of allUpdates) {
        decisions.set(`${u.platform}:${u.id}`, { candidate: u, finalEnforcement: u.recommendedEnforcement });
      }
      for (const n of allNew) {
        decisions.set(`${n.platform}:${n.id}`, { candidate: n, finalEnforcement: n.recommendedEnforcement });
      }
    } else {
      // content-only: keep current enforcement, only update content
      for (const u of allUpdates) {
        decisions.set(`${u.platform}:${u.id}`, { candidate: u, finalEnforcement: u.currentEnforcement });
      }
      // Still add new directives with recommended enforcement
      for (const n of allNew) {
        decisions.set(`${n.platform}:${n.id}`, { candidate: n, finalEnforcement: n.recommendedEnforcement });
      }
    }

    if (decisions.size === 0) {
      console.log(chalk.yellow('\nNo changes to apply.'));
      return;
    }

    // Confirm
    const proceedConfirm = await confirm({
      message: `Apply ${decisions.size} change(s)?`,
      default: true,
    });

    if (!proceedConfirm) {
      console.log(chalk.yellow('Update cancelled'));
      return;
    }

    // Create backup directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = join(cwd, '.cairel-backup', timestamp);
    await fs.ensureDir(backupDir);

    // Apply updates
    spinner.start('Applying updates...');
    const stats: UpdateStats = { updated: 0, added: 0, moved: 0, preserved: 0, moveDetails: [] };

    for (const [, { candidate, finalEnforcement }] of decisions) {
      try {
        if (candidate.isNew) {
          // Generate new directive
          const directiveInfo: DirectiveInfo = {
            id: candidate.id,
            enforcement: finalEnforcement,
            description: manifest.directives.find(d => d.id === candidate.id)?.description ?? '',
            title: manifest.directives.find(d => d.id === candidate.id)?.title ?? candidate.id,
          };
          await generateDirectives([directiveInfo], candidate.platform, cwd);
          stats.added++;
        } else if (finalEnforcement !== candidate.currentEnforcement) {
          // Move: enforcement level changed
          const directiveInfo: DirectiveInfo = {
            id: candidate.id,
            enforcement: finalEnforcement,
            description: manifest.directives.find(d => d.id === candidate.id)?.description ?? '',
            title: manifest.directives.find(d => d.id === candidate.id)?.title ?? candidate.id,
          };

          // For platforms that support per-file enforcement (kiro, cursor, github-copilot)
          // we need to move the file. For claude-code and amazon-q, regenerate.
          if (candidate.platform === 'claude-code' || candidate.platform === 'amazon-q') {
            // Regenerate in-place
            await generateDirectives([directiveInfo], candidate.platform, cwd);
          } else {
            // Move file to new location
            const result = await generateDirectives([directiveInfo], candidate.platform, cwd);

            // Remove old file (different location)
            const newPath = getTargetPath(cwd, candidate.platform, candidate.id, finalEnforcement);
            if (candidate.currentFilePath !== newPath && await fs.pathExists(candidate.currentFilePath)) {
              // Backup old
              const relPath = require('path').relative(cwd, candidate.currentFilePath);
              const backupPath = join(backupDir, relPath);
              await fs.ensureDir(require('path').dirname(backupPath));
              await fs.copy(candidate.currentFilePath, backupPath);
              // Remove old
              await fs.remove(candidate.currentFilePath);
              // Clean empty parent
              const parentDir = require('path').dirname(candidate.currentFilePath);
              try {
                const remaining = await fs.readdir(parentDir);
                if (remaining.length === 0) {
                  await fs.rmdir(parentDir);
                }
              } catch { /* ignore */ }
            }
          }

          stats.moved++;
          stats.moveDetails.push(
            `${candidate.id}: ${candidate.currentEnforcement} → ${finalEnforcement}`
          );
        } else {
          // Content update only (same enforcement level)
          const directiveInfo: DirectiveInfo = {
            id: candidate.id,
            enforcement: finalEnforcement,
            description: manifest.directives.find(d => d.id === candidate.id)?.description ?? '',
            title: manifest.directives.find(d => d.id === candidate.id)?.title ?? candidate.id,
          };

          // Backup current file
          if (candidate.currentFilePath && await fs.pathExists(candidate.currentFilePath)) {
            const relPath = require('path').relative(cwd, candidate.currentFilePath);
            const backupPath = join(backupDir, relPath);
            await fs.ensureDir(require('path').dirname(backupPath));
            await fs.copy(candidate.currentFilePath, backupPath);
          }

          // Regenerate with same enforcement
          await generateDirectives([directiveInfo], candidate.platform, cwd);
          stats.updated++;
        }
      } catch (error) {
        spinner.fail(`Failed to update ${candidate.id}`);
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      }
    }

    spinner.succeed('Updates applied');

    // Report
    console.log(chalk.green('\n✓ Update complete\n'));

    const parts: string[] = [];
    if (stats.updated > 0) {
      parts.push(`Updated ${stats.updated} directive${stats.updated > 1 ? 's' : ''}`);
      console.log(chalk.blue(`  ✓ Updated ${stats.updated} directive${stats.updated > 1 ? 's' : ''}`));
    }
    if (stats.added > 0) {
      parts.push(`added ${stats.added}`);
      console.log(chalk.green(`  ✓ Added ${stats.added} new directive${stats.added > 1 ? 's' : ''}`));
    }
    if (stats.moved > 0) {
      parts.push(`moved ${stats.moved} (${stats.moveDetails.join(', ')})`);
      console.log(chalk.cyan(`  ✓ Moved ${stats.moved} directive${stats.moved > 1 ? 's' : ''}:`));
      for (const detail of stats.moveDetails) {
        console.log(chalk.cyan(`      ${detail}`));
      }
    }

    console.log(chalk.gray(`\n  Backup: ${backupDir}\n`));
  });
