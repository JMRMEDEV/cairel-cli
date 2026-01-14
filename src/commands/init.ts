import chalk from 'chalk';
import { runWizard } from '../core/wizard';

export async function initCommand() {
  try {
    const answers = await runWizard();
    
    console.log(chalk.green('\n✓ Configuration complete!\n'));
    console.log(chalk.bold('Your answers:'));
    console.log(JSON.stringify(answers, null, 2));
    
    console.log(chalk.yellow('\n⚠️  File generation not implemented yet'));
  } catch (error) {
    console.error(chalk.red('Error during initialization:'), error);
    process.exit(1);
  }
}
