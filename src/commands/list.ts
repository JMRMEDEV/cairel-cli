import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Rule {
  id: string;
  title: string;
  description: string;
  category: string;
  alwaysInclude: boolean;
  conditions?: Record<string, string[] | boolean>;
}

interface RulesManifest {
  rules: Rule[];
}

export const listCommand = new Command('list')
  .description('List available presets')
  .option('--rules', 'List only rules')
  .option('--agents', 'List only agents')
  .option('--category <category>', 'Filter by category')
  .action((options) => {
    const showRules = !options.agents;
    const showAgents = options.agents && !options.rules;

    if (showRules) {
      displayRules(options.category);
    }

    if (showAgents) {
      displayAgents();
    }
  });

function displayRules(categoryFilter?: string): void {
  const manifestPath = join(__dirname, '../../curated-presets/rules-manifest.json');
  const manifest: RulesManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  let rules = manifest.rules;

  if (categoryFilter) {
    rules = rules.filter((rule) => rule.category === categoryFilter);
    if (rules.length === 0) {
      console.log(chalk.yellow(`⚠️  No rules found for category: ${categoryFilter}`));
      return;
    }
  }

  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category]!.push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  console.log(chalk.bold.blue('\n📋 Available Rules\n'));

  for (const [category, categoryRules] of Object.entries(rulesByCategory)) {
    const separator = '━'.repeat(80);
    console.log(chalk.gray(separator));
    console.log(chalk.bold.cyan(`${category.toUpperCase()} (${categoryRules.length} rules)`));
    console.log(chalk.gray(separator));
    console.log();

    for (const rule of categoryRules) {
      const icon = rule.alwaysInclude ? chalk.green('✓') : chalk.yellow('⚙');
      const badge = rule.alwaysInclude
        ? chalk.green('[Always Included]')
        : chalk.yellow('[Conditional]');

      console.log(`${icon} ${chalk.bold(rule.id)} ${badge}`);
      console.log(`  ${chalk.white(rule.title)}`);
      console.log(`  ${chalk.gray(rule.description)}`);

      if (rule.conditions && Object.keys(rule.conditions).length > 0) {
        const conditionStr = Object.entries(rule.conditions)
          .map(([key, values]) => {
            if (typeof values === 'boolean') {
              return `${key}=${values}`;
            }
            return `${key}=${Array.isArray(values) ? values.join('|') : values}`;
          })
          .join(', ');
        console.log(`  ${chalk.dim(`Conditions: ${conditionStr}`)}`);
      }

      console.log();
    }
  }

  console.log(chalk.gray(`Total: ${rules.length} rules\n`));
}

function displayAgents(): void {
  console.log(chalk.bold.blue('\n🤖 Available Agents\n'));
  console.log(chalk.gray('━'.repeat(80)));
  console.log(chalk.bold.cyan('GENERAL'));
  console.log(chalk.gray('━'.repeat(80)));
  console.log();
  console.log(`${chalk.green('✓')} ${chalk.bold('general-dev')}`);
  console.log(`  ${chalk.white('General Development Agent')}`);
  console.log(`  ${chalk.gray('Wizard-driven agent configuration for AI-assisted development')}`);
  console.log();
  console.log(chalk.gray('Total: 1 agent\n'));
}
