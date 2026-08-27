// Suppress ExitPromptError noise from @inquirer/prompts during tests.
// This error is thrown when the process exits while a prompt is still active
// (expected behavior in tests where prompts are mocked).
const originalStderr = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, ...args) => {
  if (typeof chunk === 'string' && chunk.includes('ExitPromptError')) {
    return true;
  }
  return originalStderr(chunk, ...args);
};
