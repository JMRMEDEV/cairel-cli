import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { Validator } from '../core/validator.js';

export const validateCommand = new Command('validate')
  .description('Validate rule and agent configuration files')
  .option('-r, --rules <path>', 'Path to rules directory')
  .option('-a, --agents <path>', 'Path to agents directory')
  .option('--fix', 'Attempt to auto-fix issues (not implemented yet)')
  .action(async (options) => {
    const validator = new Validator();
    let hasErrors = false;

    // Validate rules
    if (options.rules) {
      const spinner = ora('Validating rules...').start();
      const rulesPath = path.resolve(process.cwd(), options.rules);
      const results = await validator.validateRulesDirectory(rulesPath);

      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No rule files found in ${rulesPath}`));
      } else {
        console.log(chalk.bold(`\n📋 Rules Validation Results (${results.size} files):\n`));

        for (const [file, result] of results) {
          if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            if (result.errors.length > 0) {
              hasErrors = true;
              console.log(chalk.red(`✗ ${file}`));
              result.errors.forEach(err => {
                console.log(chalk.red(`  • ${err}`));
              });
            }
            if (result.warnings.length > 0) {
              console.log(chalk.yellow(`⚠ ${file}`));
              result.warnings.forEach(warn => {
                console.log(chalk.yellow(`  • ${warn}`));
              });
            }
          }
        }
      }
    }

    // Validate agents
    if (options.agents) {
      const spinner = ora('Validating agents...').start();
      const agentsPath = path.resolve(process.cwd(), options.agents);
      const results = await validator.validateAgentsDirectory(agentsPath);

      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No agent files found in ${agentsPath}`));
      } else {
        console.log(chalk.bold(`\n🤖 Agents Validation Results (${results.size} files):\n`));

        for (const [file, result] of results) {
          if (result.valid && result.errors.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            hasErrors = true;
            console.log(chalk.red(`✗ ${file}`));
            result.errors.forEach(err => {
              console.log(chalk.red(`  • ${err}`));
            });
          }
        }
      }
    }

    // If no options provided, validate current project
    if (!options.rules && !options.agents) {
      console.log(chalk.cyan('\n🔍 Validating current project...\n'));

      // Try .kiro/steering
      const kiroRulesPath = path.join(process.cwd(), '.kiro', 'steering');
      const kiroAgentsPath = path.join(process.cwd(), '.kiro', 'agents');

      // Try .amazonq/rules
      const amazonqRulesPath = path.join(process.cwd(), '.amazonq', 'rules');
      const amazonqAgentsPath = path.join(process.cwd(), '.amazonq', 'cli-agents');

      let foundAny = false;

      // Validate kiro rules
      const kiroRulesResults = await validator.validateRulesDirectory(kiroRulesPath);
      if (kiroRulesResults.size > 0) {
        foundAny = true;
        console.log(chalk.bold(`📋 Rules (.kiro/steering):\n`));
        for (const [file, result] of kiroRulesResults) {
          if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            if (result.errors.length > 0) {
              hasErrors = true;
              console.log(chalk.red(`✗ ${file}`));
              result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
            }
            if (result.warnings.length > 0) {
              console.log(chalk.yellow(`⚠ ${file}`));
              result.warnings.forEach(warn => console.log(chalk.yellow(`  • ${warn}`)));
            }
          }
        }
        console.log();
      }

      // Validate kiro agents
      const kiroAgentsResults = await validator.validateAgentsDirectory(kiroAgentsPath);
      if (kiroAgentsResults.size > 0) {
        foundAny = true;
        console.log(chalk.bold(`🤖 Agents (.kiro/agents):\n`));
        for (const [file, result] of kiroAgentsResults) {
          if (result.valid && result.errors.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            hasErrors = true;
            console.log(chalk.red(`✗ ${file}`));
            result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
          }
        }
        console.log();
      }

      // Validate amazonq rules
      const amazonqRulesResults = await validator.validateRulesDirectory(amazonqRulesPath);
      if (amazonqRulesResults.size > 0) {
        foundAny = true;
        console.log(chalk.bold(`📋 Rules (.amazonq/rules):\n`));
        for (const [file, result] of amazonqRulesResults) {
          if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            if (result.errors.length > 0) {
              hasErrors = true;
              console.log(chalk.red(`✗ ${file}`));
              result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
            }
            if (result.warnings.length > 0) {
              console.log(chalk.yellow(`⚠ ${file}`));
              result.warnings.forEach(warn => console.log(chalk.yellow(`  • ${warn}`)));
            }
          }
        }
        console.log();
      }

      // Validate amazonq agents
      const amazonqAgentsResults = await validator.validateAgentsDirectory(amazonqAgentsPath);
      if (amazonqAgentsResults.size > 0) {
        foundAny = true;
        console.log(chalk.bold(`🤖 Agents (.amazonq/cli-agents):\n`));
        for (const [file, result] of amazonqAgentsResults) {
          if (result.valid && result.errors.length === 0) {
            console.log(chalk.green(`✓ ${file}`));
          } else {
            hasErrors = true;
            console.log(chalk.red(`✗ ${file}`));
            result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
          }
        }
        console.log();
      }

      if (!foundAny) {
        console.log(chalk.yellow('⚠ No AI configuration found in current directory'));
        console.log(chalk.dim('\nRun "cairel init" to initialize AI configuration'));
        console.log(chalk.dim('Or use --rules and --agents options to specify paths'));
      }
    }

    // Summary
    if (hasErrors) {
      console.log(chalk.red('\n✗ Validation failed with errors'));
      process.exit(1);
    } else {
      console.log(chalk.green('\n✓ All validations passed'));
    }
  });
