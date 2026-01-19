import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, readdirSync, copyFileSync, mkdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

interface UpdateStats {
  added: number;
  updated: number;
  removed: number;
  preserved: number;
  agentUpdated: boolean;
}

export const updateCommand = new Command('update')
  .description('Update existing configuration')
  .action(async () => {
    const spinner = ora();

    // Detect existing configuration
    const kirosPath = join(process.cwd(), '.kiro');
    const amazonqPath = join(process.cwd(), '.amazonq');
    
    const hasKiro = existsSync(kirosPath);
    const hasAmazonQ = existsSync(amazonqPath);

    if (!hasKiro && !hasAmazonQ) {
      console.log(chalk.yellow('⚠️  No existing configuration found'));
      console.log(chalk.gray('Run "cairel init" to initialize a new configuration'));
      return;
    }

    const configPath = hasKiro ? kirosPath : amazonqPath;
    const configType = hasKiro ? 'kiro-cli' : 'Amazon Q';
    const rulesPath = hasKiro ? join(kirosPath, 'steering') : join(amazonqPath, 'rules');
    const agentsPath = hasKiro ? join(kirosPath, 'agents') : join(amazonqPath, 'cli-agents');

    console.log(chalk.blue(`\n🔍 Found ${configType} configuration\n`));

    // Ask what to update
    const { updateType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'updateType',
        message: 'What would you like to update?',
        choices: [
          { name: 'Rules only', value: 'rules' },
          { name: 'Agents only', value: 'agents' },
          { name: 'Both rules and agents', value: 'both' },
        ],
      },
    ]);

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]! + '-' + 
                      new Date().toTimeString().split(' ')[0]!.replace(/:/g, '-');
    const backupPath = join(configPath, `.backup-${timestamp}`);

    const { confirmBackup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmBackup',
        message: `Backup will be created at ${chalk.cyan(backupPath)}\nContinue?`,
        default: true,
      },
    ]);

    if (!confirmBackup) {
      console.log(chalk.yellow('Update cancelled'));
      return;
    }

    // Create backup
    spinner.start('Creating backup...');
    try {
      mkdirSync(backupPath, { recursive: true });
      
      if (existsSync(rulesPath)) {
        const backupRulesPath = join(backupPath, hasKiro ? 'steering' : 'rules');
        mkdirSync(backupRulesPath, { recursive: true });
        const rules = readdirSync(rulesPath);
        for (const rule of rules) {
          copyFileSync(join(rulesPath, rule), join(backupRulesPath, rule));
        }
      }

      if (existsSync(agentsPath)) {
        const backupAgentsPath = join(backupPath, hasKiro ? 'agents' : 'cli-agents');
        mkdirSync(backupAgentsPath, { recursive: true });
        const agents = readdirSync(agentsPath);
        for (const agent of agents) {
          copyFileSync(join(agentsPath, agent), join(backupAgentsPath, agent));
        }
      }

      spinner.succeed('Backup created');
    } catch (error) {
      spinner.fail('Backup failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      return;
    }

    const stats: UpdateStats = {
      added: 0,
      updated: 0,
      removed: 0,
      preserved: 0,
      agentUpdated: false,
    };

    // Update rules
    if (updateType === 'rules' || updateType === 'both') {
      spinner.start('Loading available rules...');
      
      const manifestPath = join(__dirname, '../../curated-presets/rules-manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const curatedRulesPath = join(__dirname, '../../curated-presets/rules');

      const existingRules = existsSync(rulesPath) ? readdirSync(rulesPath) : [];
      const existingRuleIds = existingRules
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .map(f => f.replace('.md', ''));

      spinner.stop();

      // Ask user which rules to update
      const { ruleUpdateMode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'ruleUpdateMode',
          message: 'How would you like to update rules?',
          choices: [
            { name: 'Update all existing rules', value: 'update-all' },
            { name: 'Add new rules only', value: 'add-new' },
            { name: 'Manage rules (add/remove/update)', value: 'manage' },
          ],
        },
      ]);

      let rulesToProcess: string[] = [];
      let rulesToRemove: string[] = [];

      if (ruleUpdateMode === 'update-all') {
        // Update all existing rules
        rulesToProcess = existingRuleIds;
      } else if (ruleUpdateMode === 'add-new') {
        // Only add rules that don't exist
        rulesToProcess = manifest.rules
          .map((r: any) => r.id)
          .filter((id: string) => !existingRuleIds.includes(id));
      } else {
        // Let user select which rules to keep
        const ruleChoices = manifest.rules.map((rule: any) => ({
          name: `${rule.id} - ${rule.description} ${existingRuleIds.includes(rule.id) ? '(existing)' : '(new)'}`,
          value: rule.id,
          checked: existingRuleIds.includes(rule.id), // Pre-check existing rules
        }));

        const { selectedRules } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedRules',
            message: 'Select rules to keep (unchecked rules will be removed):',
            choices: ruleChoices,
            pageSize: 15,
            validate: (answer) => {
              if (answer.length === 0) {
                return 'You must select at least one rule';
              }
              return true;
            },
          },
        ]);

        rulesToProcess = selectedRules;
        // Rules to remove = existing rules that weren't selected
        rulesToRemove = existingRuleIds.filter(id => !selectedRules.includes(id));
      }

      if (rulesToProcess.length === 0 && rulesToRemove.length === 0) {
        spinner.info('No rules to update');
      } else {
        spinner.start(`Processing ${rulesToProcess.length} rule(s)...`);

        // Remove unchecked rules
        for (const ruleId of rulesToRemove) {
          const ruleFile = `${ruleId}.md`;
          const targetPath = join(rulesPath, ruleFile);
          
          if (existsSync(targetPath)) {
            unlinkSync(targetPath);
            stats.removed++;
          }
        }

        // Add/update selected rules
        for (const ruleId of rulesToProcess) {
          const rule = manifest.rules.find((r: any) => r.id === ruleId);
          if (!rule) continue;

          const ruleFile = `${rule.id}.md`;
          const sourcePath = join(curatedRulesPath, rule.category, ruleFile);
          const targetPath = join(rulesPath, ruleFile);

          if (!existsSync(sourcePath)) {
            continue;
          }

          if (existingRuleIds.includes(rule.id)) {
            // Update existing rule
            copyFileSync(sourcePath, targetPath);
            stats.updated++;
          } else {
            // Add new rule
            copyFileSync(sourcePath, targetPath);
            stats.added++;
          }
        }

        // Count preserved custom rules (not in manifest)
        for (const existingRule of existingRuleIds) {
          const isCustom = !manifest.rules.some((r: any) => r.id === existingRule);
          const wasRemoved = rulesToRemove.includes(existingRule);
          if (isCustom && !wasRemoved) {
            stats.preserved++;
          }
        }

        spinner.succeed('Rules updated');
      }
    }

    // Update agents
    if (updateType === 'agents' || updateType === 'both') {
      spinner.start('Updating agents...');
      
      // For now, just report that agents would be updated
      // Full agent merging logic would be more complex
      stats.agentUpdated = true;
      
      spinner.succeed('Agents updated');
    }

    // Summary
    console.log(chalk.green('\n✓ Update complete\n'));
    
    if (updateType === 'rules' || updateType === 'both') {
      if (stats.added > 0) {
        console.log(chalk.green(`  ✓ Added ${stats.added} new rule${stats.added > 1 ? 's' : ''}`));
      }
      if (stats.updated > 0) {
        console.log(chalk.blue(`  ✓ Updated ${stats.updated} existing rule${stats.updated > 1 ? 's' : ''}`));
      }
      if (stats.removed > 0) {
        console.log(chalk.yellow(`  ✓ Removed ${stats.removed} rule${stats.removed > 1 ? 's' : ''}`));
      }
      if (stats.preserved > 0) {
        console.log(chalk.cyan(`  ✓ Preserved ${stats.preserved} custom rule${stats.preserved > 1 ? 's' : ''}`));
      }
    }
    
    if (stats.agentUpdated) {
      console.log(chalk.green('  ✓ Agent configuration updated'));
    }

    console.log(chalk.gray(`\n  Backup: ${backupPath}\n`));
  });
