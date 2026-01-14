#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('ordaiv')
  .description('CLI tool for initializing AI-driven development projects')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize AI configuration (agents + rules)')
  .action(initCommand);

program
  .command('bootstrap')
  .description('Show path to ordaiv\'s .ai/ directory for project initialization')
  .action(() => {
    const ordaivPath = __dirname.replace('/dist', '');
    console.log(chalk.green('✓ Ready to bootstrap project\n'));
    console.log(chalk.bold('Copy this for kiro-cli:\n'));
    console.log(chalk.cyan(`Read ${ordaivPath}/.ai/KICKOFF-PROMPT.txt`));
    console.log(chalk.cyan('and follow the new.md protocol to initialize this project.\n'));
    console.log('This will guide you through:');
    console.log('- Problem statement and goals');
    console.log('- Tech stack definition');
    console.log('- Architecture planning');
    console.log('- Documentation creation (README, dev-plan, architecture, progress, bugs)');
  });

program
  .command('update')
  .description('Update existing configuration')
  .action(() => {
    console.log(chalk.blue('🔄 Updating configuration...'));
    console.log(chalk.yellow('⚠️  Not implemented yet'));
  });

program
  .command('validate')
  .description('Validate rule files')
  .action(() => {
    console.log(chalk.blue('✓ Validating rules...'));
    console.log(chalk.yellow('⚠️  Not implemented yet'));
  });

program
  .command('list')
  .description('List available presets')
  .action(() => {
    console.log(chalk.blue('📋 Available presets:'));
    console.log(chalk.yellow('⚠️  Not implemented yet'));
  });

// Getting started menu when no command provided
if (process.argv.length === 2) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Initialize AI configuration (ordaiv init)', value: 'init' },
          { name: 'Bootstrap project documentation (ordaiv bootstrap)', value: 'bootstrap' },
          { name: 'Update existing configuration (ordaiv update)', value: 'update' },
          { name: 'Validate rules (ordaiv validate)', value: 'validate' },
          { name: 'List available presets (ordaiv list)', value: 'list' },
          { name: 'Show help (ordaiv --help)', value: 'help' },
        ],
      },
    ])
    .then((answers) => {
      if (answers.action === 'help') {
        program.help();
      } else {
        process.argv.push(answers.action);
        program.parse(process.argv);
      }
    });
} else {
  program.parse(process.argv);
}
