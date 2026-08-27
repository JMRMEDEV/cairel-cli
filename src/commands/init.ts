import chalk from 'chalk';
import { runWizard } from '../core/wizard';
import { generateFiles } from '../core/generator';
import { UserCancelledError } from '../types/wizard';

export async function initCommand() {
  try {
    const answers = await runWizard();
    await generateFiles(answers);
    
    console.log(chalk.green.bold('\n✨ Success! Your AI development environment is ready.\n'));
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.gray('  1. Review the generated skills in your configuration directory'));
    console.log(chalk.gray('  2. Customize the agent configuration if needed'));
    console.log(chalk.gray('  3. Start using your AI tool with the new configuration\n'));
  } catch (error) {
    if (error instanceof UserCancelledError) {
      console.log(chalk.yellow(`\n❌ ${error.message}`));
      return;
    }
    console.error(chalk.red('Error during initialization:'), error);
    process.exit(1);
  }
}
