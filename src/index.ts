#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { listCommand } from './commands/list.js';
import { updateCommand } from './commands/update.js';

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('cairel')
  .description('CLI tool for initializing AI-driven development projects')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize AI configuration (agents + rules)')
  .action(initCommand);

program
  .command('bootstrap')
  .description('Show path to cairel\'s .ai/ directory for project initialization')
  .action(() => {
    const cairelPath = __dirname.replace('/dist', '');
    console.log(chalk.green('✓ Ready to bootstrap project\n'));
    console.log(chalk.bold('Copy this for kiro-cli:\n'));
    console.log(chalk.cyan(`Read ${cairelPath}/.ai/KICKOFF-PROMPT.txt`));
    console.log(chalk.cyan('and follow the new.md protocol to initialize this project.\n'));
    console.log('This will guide you through:');
    console.log('- Problem statement and goals');
    console.log('- Tech stack definition');
    console.log('- Architecture planning');
    console.log('- Documentation creation (README, dev-plan, architecture, progress, bugs)');
  });

program.addCommand(updateCommand);

program.addCommand(validateCommand);

program.addCommand(listCommand);

// Getting started menu when no command provided
if (process.argv.length === 2) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Initialize AI configuration (cairel init)', value: 'init' },
          { name: 'Bootstrap project documentation (cairel bootstrap)', value: 'bootstrap' },
          { name: 'Update existing configuration (cairel update)', value: 'update' },
          { name: 'Validate rules (cairel validate)', value: 'validate' },
          { name: 'List available presets (cairel list)', value: 'list' },
          { name: 'Show help (cairel --help)', value: 'help' },
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
