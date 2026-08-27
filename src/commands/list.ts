import { Command, Option } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Directive {
  id: string;
  title: string;
  description: string;
  category: string;
  alwaysInclude: boolean;
  conditions?: Record<string, string[] | boolean>;
}

interface DirectivesManifest {
  directives: Directive[];
}

export const listCommand = new Command('list')
  .description('List available directives and presets')
  .option('--directives', 'List only directives')
  .addOption(new Option('--skills', 'List only directives (alias for --directives)').hideHelp())
  .addOption(new Option('--rules', 'List only directives (alias for --directives)').hideHelp())
  .option('--agents', 'List only agents')
  .option('--category <category>', 'Filter by category')
  .action((options) => {
    const showDirectives = options.directives || options.skills || options.rules;
    const showAgents = options.agents && !showDirectives;

    if (!showAgents) {
      displayDirectives(options.category);
    }

    if (showAgents) {
      displayAgents();
    }
  });

function displayDirectives(categoryFilter?: string): void {
  const manifestPath = join(__dirname, '../../curated-presets/directives-manifest.json');
  const manifest: DirectivesManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  let directives = manifest.directives;

  if (categoryFilter) {
    directives = directives.filter((directive) => directive.category === categoryFilter);
    if (directives.length === 0) {
      console.log(chalk.yellow(`⚠️  No directives found for category: ${categoryFilter}`));
      return;
    }
  }

  const directivesByCategory = directives.reduce((acc, directive) => {
    if (!acc[directive.category]) {
      acc[directive.category] = [];
    }
    acc[directive.category]!.push(directive);
    return acc;
  }, {} as Record<string, Directive[]>);

  console.log(chalk.bold.blue('\n📋 Available Directives\n'));

  for (const [category, categoryDirectives] of Object.entries(directivesByCategory)) {
    const separator = '━'.repeat(80);
    console.log(chalk.gray(separator));
    console.log(chalk.bold.cyan(`${category.toUpperCase()} (${categoryDirectives.length} directives)`));
    console.log(chalk.gray(separator));
    console.log();

    for (const directive of categoryDirectives) {
      const icon = directive.alwaysInclude ? chalk.green('✓') : chalk.yellow('⚙');
      const badge = directive.alwaysInclude
        ? chalk.green('[Always Included]')
        : chalk.yellow('[Conditional]');

      console.log(`${icon} ${chalk.bold(directive.id)} ${badge}`);
      console.log(`  ${chalk.white(directive.title)}`);
      console.log(`  ${chalk.gray(directive.description)}`);

      if (directive.conditions && Object.keys(directive.conditions).length > 0) {
        const conditionStr = Object.entries(directive.conditions)
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

  console.log(chalk.gray(`Total: ${directives.length} directives\n`));
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
