import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { Validator } from '../core/validator.js';

export const validateCommand = new Command('validate')
  .description('Validate skill and agent configuration files')
  .argument('[path]', 'Path to file or directory to validate')
  .option('-r, --rules', 'Validate as skills (default: auto-detect)')
  .option('-a, --agents', 'Validate as agents (default: auto-detect)')
  .option('--fix', 'Attempt to auto-fix issues (not implemented yet)')
  .action(async (targetPath, options) => {
    const validator = new Validator();
    let hasErrors = false;

    // If no path provided, auto-detect
    if (!targetPath) {
      const cwd = process.cwd();
      const kiroSkills = path.join(cwd, '.kiro', 'skills');
      const kiroRules = path.join(cwd, '.kiro', 'steering');
      const kiroAgents = path.join(cwd, '.kiro', 'agents');
      const claudeSkills = path.join(cwd, '.claude', 'skills');
      const githubSkills = path.join(cwd, '.github', 'skills');
      const amazonqRules = path.join(cwd, '.amazonq', 'rules');
      const amazonqAgents = path.join(cwd, '.amazonq', 'cli-agents');

      const fs = await import('fs');
      
      // Prefer skills directories over legacy steering
      if (fs.existsSync(kiroSkills)) {
        options.skills = kiroSkills;
      } else if (fs.existsSync(claudeSkills)) {
        options.skills = claudeSkills;
      } else if (fs.existsSync(githubSkills)) {
        options.skills = githubSkills;
      } else if (fs.existsSync(kiroRules)) {
        options.rules = kiroRules;
      } else if (fs.existsSync(amazonqRules)) {
        options.rules = amazonqRules;
      }

      if (fs.existsSync(kiroAgents)) {
        options.agents = kiroAgents;
      } else if (fs.existsSync(amazonqAgents)) {
        options.agents = amazonqAgents;
      }

      if (!options.rules && !options.agents && !options.skills) {
        console.log(chalk.yellow('\n⚠ No configuration found. Use --rules or --agents to specify a path.'));
        process.exit(1);
      }
    } else {
      // Check if path is file or directory
      const fs = await import('fs');
      const stats = fs.statSync(targetPath);
      
      if (stats.isFile()) {
        const ext = path.extname(targetPath);
        if (ext === '.md') {
          options.rules = targetPath;
        } else if (ext === '.json') {
          options.agents = targetPath;
        } else {
          console.log(chalk.red(`\n✗ Unsupported file type: ${ext}`));
          process.exit(1);
        }
      } else {
        // Check if directory contains skill folders (has SKILL.md inside subdirs)
        const entries = fs.readdirSync(targetPath, { withFileTypes: true });
        const hasSkillFolders = entries.some((e: any) => e.isDirectory() && fs.existsSync(path.join(targetPath, e.name, 'SKILL.md')));
        if (hasSkillFolders) {
          options.skills = targetPath;
        } else if (!options.rules && !options.agents) {
          options.rules = targetPath;
        }
      }
    }

    // Validate skills (new format)
    if (options.skills) {
      const spinner = ora('Validating skills...').start();
      const skillsPath = typeof options.skills === 'string' ? path.resolve(process.cwd(), options.skills) : options.skills;
      const results = await validator.validateSkillsDirectory(skillsPath);
      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No skills found in ${skillsPath}`));
      } else {
        console.log(chalk.bold(`\n📋 Skills Validation Results (${results.size} skills):\n`));
        for (const [name, result] of results) {
          if (result.valid && result.errors.length === 0) {
            console.log(chalk.green(`✓ ${name}`));
          } else {
            hasErrors = true;
            console.log(chalk.red(`✗ ${name}`));
            result.errors.forEach(err => console.log(chalk.red(`  • ${err}`)));
          }
        }
      }
    }

    // Validate rules
    if (options.rules) {
      const spinner = ora('Validating skills...').start();
      const rulesPath = typeof options.rules === 'string' ? path.resolve(process.cwd(), options.rules) : options.rules;
      
      const fs = await import('fs');
      const stats = fs.statSync(rulesPath);
      
      let results;
      if (stats.isFile()) {
        // Validate single file
        const result = await validator.validateRule(rulesPath);
        results = new Map([[path.basename(rulesPath), result]]);
      } else {
        // Validate directory
        results = await validator.validateRulesDirectory(rulesPath);
      }

      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No skill files found in ${rulesPath}`));
      } else {
        console.log(chalk.bold(`\n📋 Skills Validation Results (${results.size} files):\n`));

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
