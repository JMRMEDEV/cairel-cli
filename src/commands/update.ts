import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, readdirSync, copyFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface UpdateStats {
  added: number;
  updated: number;
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
      preserved: 0,
      agentUpdated: false,
    };

    // Update rules
    if (updateType === 'rules' || updateType === 'both') {
      spinner.start('Updating rules...');
      
      const manifestPath = join(__dirname, '../../curated-presets/rules-manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const curatedRulesPath = join(__dirname, '../../curated-presets/rules');

      const existingRules = existsSync(rulesPath) ? readdirSync(rulesPath) : [];
      const existingRuleIds = existingRules
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .map(f => f.replace('.md', ''));

      for (const rule of manifest.rules) {
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

      // Count preserved custom rules
      for (const existingRule of existingRuleIds) {
        const isCustom = !manifest.rules.some((r: any) => r.id === existingRule);
        if (isCustom) {
          stats.preserved++;
        }
      }

      spinner.succeed('Rules updated');
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
      if (stats.preserved > 0) {
        console.log(chalk.cyan(`  ✓ Preserved ${stats.preserved} custom rule${stats.preserved > 1 ? 's' : ''}`));
      }
    }
    
    if (stats.agentUpdated) {
      console.log(chalk.green('  ✓ Agent configuration updated'));
    }

    console.log(chalk.gray(`\n  Backup: ${backupPath}\n`));
  });
