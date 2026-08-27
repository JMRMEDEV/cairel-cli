import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { Validator } from '../core/validator.js';
import { validateEnforcement, EnforcementValidationResult, DirectiveValidationEntry } from '../core/enforcement-validator.js';
import {
  resolveTargetDirs,
  isBooleanFlag,
  isPathValue,
  STANDARD_AGENT_DIRS,
  STANDARD_DIRECTIVE_DIRS,
} from '../core/validation-targets.js';
import { formatFsError } from '../core/fs-error.js';
import { scanPlatforms, summaryLine, PLATFORM_LABELS } from '../core/platform-scan.js';

export const validateCommand = new Command('validate')
  .description('Validate directive and agent configuration files')
  .argument('[path]', 'Path to file or directory to validate')
  .option('-d, --directives', 'Validate as directives (default: auto-detect)')
  .option('-s, --skills', 'Validate as directives (alias for --directives, default: auto-detect)')
  .option('-r, --rules', 'Validate as directives (alias for --directives, default: auto-detect)')
  .option('-a, --agents', 'Validate as agents (default: auto-detect)')
  .option('-e, --enforcement', 'Validate enforcement levels across all platforms')
  .option('--fix', 'Attempt to auto-fix issues (not implemented yet)')
  .action(async (targetPath, options) => {
    const validator = new Validator();
    let hasErrors = false;

    // Detect whether the user explicitly requested a validation mode via flag.
    // Commander sets these to boolean `true` for a bare flag.
    const wantsAgents = isBooleanFlag(options.agents) || isPathValue(options.agents);
    const wantsDirectives =
      isBooleanFlag(options.directives) || isBooleanFlag(options.skills) || isBooleanFlag(options.rules) ||
      isPathValue(options.directives) || isPathValue(options.skills) || isPathValue(options.rules);

    // No arguments and no mode flags: run the cohesive "validate everything"
    // scan. Auto-detect all known platform directories, validate each with the
    // correct schema, and report grouped by platform (TASK-022).
    if (!targetPath && !wantsAgents && !wantsDirectives && !options.enforcement) {
      const spinner = ora('Scanning project for AI configuration...').start();
      const scan = await scanPlatforms(process.cwd());
      spinner.stop();

      if (scan.groups.length === 0) {
        console.log(chalk.yellow('\n⚠ No configuration found. Use --directives or --agents to specify a path.'));
        process.exit(1);
      }

      console.log(chalk.bold('\n🔍 Validating all detected platforms:\n'));

      for (const group of scan.groups) {
        console.log(chalk.bold(`  ${PLATFORM_LABELS[group.platform]}:`));

        for (const d of group.directives) {
          if (d.valid && d.errors.length === 0) {
            const suffix = d.enforcement !== 'unknown' ? chalk.dim(` (${d.enforcement})`) : '';
            console.log(chalk.green(`    ✓ ${d.name}`) + suffix);
          } else {
            console.log(chalk.red(`    ✗ ${d.name}`));
            d.errors.forEach(err => console.log(chalk.red(`      • ${err}`)));
          }
          d.warnings.forEach(w => console.log(chalk.yellow(`      ⚠ ${w}`)));
        }

        for (const a of group.agents) {
          if (a.valid) {
            console.log(chalk.green(`    ✓ ${a.name}`) + chalk.dim(' (agent)'));
          } else {
            console.log(chalk.red(`    ✗ ${a.name} (agent)`));
            a.errors.forEach(err => console.log(chalk.red(`      • ${err}`)));
          }
        }
      }

      console.log(
        chalk.bold(`\n${summaryLine(scan)}`)
      );

      if (scan.hasErrors) {
        console.log(chalk.red('\n✗ Validation failed with errors'));
        process.exit(1);
      }
      console.log(chalk.green('\n✓ All validations passed'));
      return;
    }

    // Guard: normalize explicit boolean flags into concrete directory paths so
    // the boolean `true` never reaches path.resolve() (which throws
    // TypeError [ERR_INVALID_ARG_TYPE]) or produces "No directives found in true".
    // Only runs when a mode flag is set with NO positional path argument.
    if (!targetPath && (wantsAgents || wantsDirectives)) {
      const fs = await import('fs');
      const cwd = process.cwd();
      const existsFn = (p: string) => fs.existsSync(p);

      // Clear boolean flags; they will be replaced with resolved string paths.
      options.agents = undefined;
      options.skills = undefined;
      options.steering = undefined;
      options.rules = undefined;
      options.directives = undefined;

      if (wantsAgents) {
        const agentDirs = resolveTargetDirs(true, STANDARD_AGENT_DIRS, cwd, existsFn);
        if (agentDirs.length === 0) {
          console.log(chalk.yellow(`\n⚠ No agent directories found. Looked in: ${STANDARD_AGENT_DIRS.join(', ')}`));
        } else {
          // Handlers accept a single directory path; use the first existing one.
          options.agents = agentDirs[0];
        }
      }

      if (wantsDirectives) {
        const directiveDirs = resolveTargetDirs(true, STANDARD_DIRECTIVE_DIRS, cwd, existsFn);
        if (directiveDirs.length === 0) {
          console.log(chalk.yellow(`\n⚠ No directive directories found. Looked in: ${STANDARD_DIRECTIVE_DIRS.join(', ')}`));
        } else {
          // Route each existing directive dir to the correct validator by kind.
          const skillsDir = directiveDirs.find(d =>
            d.endsWith(path.join('.kiro', 'skills')) ||
            d.endsWith(path.join('.claude', 'skills')) ||
            d.endsWith(path.join('.github', 'skills')));
          const steeringDir = directiveDirs.find(d => d.endsWith(path.join('.kiro', 'steering')));
          const rulesDir = directiveDirs.find(d =>
            d.endsWith(path.join('.amazonq', 'rules')) ||
            d.endsWith(path.join('.cursor', 'rules')) ||
            d.endsWith(path.join('.github', 'instructions')));

          if (skillsDir) options.skills = skillsDir;
          if (steeringDir) options.steering = steeringDir;
          if (rulesDir) options.rules = rulesDir;
        }
      }

      // Explicit flags handled; skip the generic auto-detect / path branch below.
    } else {
      // A positional path was provided.
      const fs = await import('fs');

      // If an explicit mode flag accompanies the path, route the path directly
      // to that mode instead of relying on extension/content sniffing. This also
      // prevents the boolean `true` from lingering on options.agents/skills/etc.
      if (wantsAgents || wantsDirectives) {
        // Reset boolean flags to avoid `true` reaching path.resolve().
        options.agents = undefined;
        options.skills = undefined;
        options.steering = undefined;
        options.rules = undefined;
        options.directives = undefined;

        const resolvedPath = path.resolve(targetPath);
        if (wantsAgents) {
          options.agents = targetPath;
        } else if (wantsDirectives) {
          let stats;
          try {
            stats = fs.statSync(targetPath);
          } catch (err) {
            const expected = path.extname(targetPath) ? 'file' : 'directory';
            console.log(chalk.yellow(`\n${formatFsError(err, targetPath, expected)}`));
            process.exit(1);
          }
          const isSteering = resolvedPath.includes(path.join('.kiro', 'steering'));
          let hasSkillFolders = false;
          if (stats.isDirectory()) {
            const entries = fs.readdirSync(targetPath, { withFileTypes: true });
            hasSkillFolders = entries.some((e: any) => e.isDirectory() && fs.existsSync(path.join(targetPath, e.name, 'SKILL.md')));
          } else if (path.basename(targetPath) === 'SKILL.md') {
            hasSkillFolders = true;
          }

          if (isSteering) {
            options.steering = targetPath;
          } else if (hasSkillFolders) {
            options.skills = targetPath;
          } else {
            options.rules = targetPath;
          }
        }
      } else {
        // Auto-detect: check if path is file or directory
        let stats;
        try {
          stats = fs.statSync(targetPath);
        } catch (err) {
          // Infer intent from the path so ENOENT reads "File" vs "Directory".
          const expected = path.extname(targetPath) ? 'file' : 'directory';
          console.log(chalk.yellow(`\n${formatFsError(err, targetPath, expected)}`));
          process.exit(1);
        }

        if (stats.isFile()) {
        const ext = path.extname(targetPath);
        if (ext === '.md' || ext === '.mdc') {
          // Check if this file is under a steering directory
          const resolvedPath = path.resolve(targetPath);
          if (ext === '.md' && resolvedPath.includes(path.join('.kiro', 'steering'))) {
            options.steering = targetPath;
          } else {
            options.rules = targetPath;
          }
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
        const resolvedPath = path.resolve(targetPath);
        if (hasSkillFolders) {
          options.skills = targetPath;
        } else if (resolvedPath.includes(path.join('.kiro', 'steering')) || resolvedPath.endsWith(path.join('.kiro', 'steering'))) {
          options.steering = targetPath;
        } else if (!options.rules && !options.agents) {
          options.rules = targetPath;
        }
      }
      }
    }

    // Validate skills (new format)
    if (options.skills) {
      const spinner = ora('Validating directives...').start();
      const skillsPath = typeof options.skills === 'string' ? path.resolve(process.cwd(), options.skills) : options.skills;
      const results = await validator.validateSkillsDirectory(skillsPath);
      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No directives found in ${skillsPath}`));
      } else {
        console.log(chalk.bold(`\n📋 Directives Validation Results (${results.size} directives):\n`));
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

    // Validate Kiro steering files (inclusion: always|auto)
    if (options.steering) {
      const spinner = ora('Validating steering files...').start();
      const steeringPath = typeof options.steering === 'string' ? path.resolve(process.cwd(), options.steering) : options.steering;

      const fs = await import('fs');
      let stats;
      try {
        stats = fs.statSync(steeringPath);
      } catch (err) {
        spinner.stop();
        console.log(chalk.yellow(`\n${formatFsError(err, steeringPath)}`));
        process.exit(1);
      }

      let results;
      if (stats.isFile()) {
        const result = await validator.validateSteeringFile(steeringPath);
        results = new Map([[path.basename(steeringPath), result]]);
      } else {
        results = await validator.validateSteeringDirectory(steeringPath);
      }

      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No steering files found in ${steeringPath}`));
      } else {
        console.log(chalk.bold(`\n🧭 Kiro Steering Validation Results (${results.size} files):\n`));

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
              if (result.errors.length === 0) {
                console.log(chalk.green(`✓ ${file}`));
              }
              result.warnings.forEach(warn => {
                console.log(chalk.yellow(`  ⚠ ${warn}`));
              });
            }
          }
        }
      }
    }

    // Validate rules (legacy format)
    if (options.rules) {
      const spinner = ora('Validating directives...').start();
      const rulesPath = typeof options.rules === 'string' ? path.resolve(process.cwd(), options.rules) : options.rules;
      
      const fs = await import('fs');
      let stats;
      try {
        stats = fs.statSync(rulesPath);
      } catch (err) {
        spinner.stop();
        console.log(chalk.yellow(`\n${formatFsError(err, rulesPath)}`));
        process.exit(1);
      }

      let results;
      if (stats.isFile()) {
        // Validate single file — route .mdc to the Cursor directive validator
        const result = rulesPath.endsWith('.mdc')
          ? await validator.validateCursorDirective(rulesPath)
          : await validator.validateRule(rulesPath);
        results = new Map([[path.basename(rulesPath), result]]);
      } else {
        // Validate directory
        results = await validator.validateRulesDirectory(rulesPath);
      }

      spinner.stop();

      if (results.size === 0) {
        console.log(chalk.yellow(`\n⚠ No directive files found in ${rulesPath}`));
      } else {
        console.log(chalk.bold(`\n📋 Directives Validation Results (${results.size} files):\n`));

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
      const agentsPath = typeof options.agents === 'string' ? path.resolve(process.cwd(), options.agents) : options.agents;
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

    // Validate enforcement levels across platforms
    if (options.enforcement) {
      const spinner = ora('Validating enforcement levels...').start();
      const cwd = process.cwd();
      const enforcementResult = await validateEnforcement(cwd);
      spinner.stop();

      if (enforcementResult.directives.length > 0 || enforcementResult.globalWarnings.length > 0) {
        console.log(chalk.bold('\n🔒 Enforcement Validation Results:\n'));

        // Group by platform
        const byPlatform = new Map<string, DirectiveValidationEntry[]>();
        for (const d of enforcementResult.directives) {
          const existing = byPlatform.get(d.platform) || [];
          existing.push(d);
          byPlatform.set(d.platform, existing);
        }

        for (const [platform, directives] of byPlatform) {
          console.log(chalk.bold(`  ${platform}:`));

          // Group by enforcement level within platform
          const enforced = directives.filter(d => d.enforcement === 'enforced');
          const contextual = directives.filter(d => d.enforcement === 'contextual');
          const available = directives.filter(d => d.enforcement === 'available');
          const unknown = directives.filter(d => d.enforcement === 'unknown');

          if (enforced.length > 0) {
            console.log(chalk.dim('    Enforced:'));
            for (const d of enforced) {
              printDirectiveEntry(d);
            }
          }
          if (contextual.length > 0) {
            console.log(chalk.dim('    Contextual:'));
            for (const d of contextual) {
              printDirectiveEntry(d);
            }
          }
          if (available.length > 0) {
            console.log(chalk.dim('    Available:'));
            for (const d of available) {
              printDirectiveEntry(d);
            }
          }
          if (unknown.length > 0) {
            console.log(chalk.dim('    Unknown:'));
            for (const d of unknown) {
              printDirectiveEntry(d);
            }
          }
        }

        // Global warnings
        for (const w of enforcementResult.globalWarnings) {
          console.log(chalk.yellow(`  ⚠ ${w}`));
        }

        // Check for errors
        const enforcementErrors = enforcementResult.directives.filter(d => !d.valid);
        if (enforcementErrors.length > 0) {
          hasErrors = true;
        }
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

function printDirectiveEntry(d: DirectiveValidationEntry): void {
  if (d.valid && d.errors.length === 0 && d.warnings.length === 0) {
    console.log(chalk.green(`      ✓ ${d.name}`));
  } else {
    if (d.errors.length > 0) {
      console.log(chalk.red(`      ✗ ${d.name}`));
      d.errors.forEach(err => console.log(chalk.red(`        • ${err}`)));
    }
    if (d.warnings.length > 0) {
      if (d.errors.length === 0) {
        console.log(chalk.green(`      ✓ ${d.name}`));
      }
      d.warnings.forEach(w => console.log(chalk.yellow(`        ⚠ ${w}`)));
    }
  }
}
