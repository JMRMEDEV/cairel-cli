# Cairel Test Suite

## Overview

Comprehensive test coverage for all wizard scenarios and file generation.

## Test Statistics

- **Total Tests**: 78
- **Test Suites**: 10
- **Status**: ✅ All Passing
- **Latest Update**: v1.0.1 (2026-01-19)

---

## Testing Interactive CLI Applications

### Challenge

Testing interactive CLI tools built with Inquirer.js presents unique challenges:
- Timing issues with user input simulation
- Complex state management across multiple prompts
- Difficulty reproducing exact user interactions

### Approaches Evaluated

#### ❌ Approach 1: mock-stdin (Not Recommended)

**What we tried:**
```typescript
import { stdin } from 'mock-stdin';

const mockStdin = stdin();
mockStdin.send('\x1B[B'); // DOWN arrow
mockStdin.send('\r');      // ENTER
```

**Problems:**
- Timing issues - delays don't sync with Inquirer's rendering
- Navigation unreliable - arrow keys don't select correct options
- Slow tests - requires 200ms+ delays, 25-30s timeouts
- Brittle - breaks with Inquirer updates

**Verdict:** Avoid for Inquirer.js testing.

#### ✅ Approach 2: Mock Inquirer Directly (Recommended)

**Implementation:**
```typescript
import inquirer from 'inquirer';

jest.mock('inquirer');
const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

beforeEach(() => {
  mockPrompt.mockReset(); // Critical: resets implementation queue
});

test('wizard flow', async () => {
  mockPrompt
    .mockResolvedValueOnce({ mode: 'quick' })
    .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
    .mockResolvedValueOnce({ framework: 'react' });
  
  const result = await runWizard();
  expect(result.projectType).toBe('ui');
});
```

**Benefits:**
- Fast - tests run in milliseconds
- Reliable - no timing issues
- Clear intent - programmatic responses
- Maintainable - easy to update

---

## Key Considerations for Interactive Tests

### 1. Mock Reset Strategy

**Critical:** Use `mockReset()` not `mockClear()` or `resetAllMocks()`

```typescript
beforeEach(() => {
  mockPrompt.mockReset(); // ✅ Resets implementation queue
  // mockPrompt.mockClear();  // ❌ Only clears call history
  // jest.resetAllMocks();    // ❌ Resets ALL mocks (breaks ora, etc.)
});
```

**Why:** `mockResolvedValueOnce()` creates a queue. Each test needs a fresh queue.

### 2. Match Prompt Structure

Inquirer prompts can have multiple questions in one array:

```typescript
// Wizard code
const answers = await inquirer.prompt([
  { name: 'projectType', ... },
  { name: 'language', ... }
]);

// Test must return BOTH in one object
mockPrompt.mockResolvedValueOnce({ 
  projectType: 'ui', 
  language: 'typescript' 
});
```

### 3. Count Sequential Prompts

Map each `await inquirer.prompt()` call to one `mockResolvedValueOnce()`:

```typescript
// Wizard has 7 prompts:
const { mode } = await inquirer.prompt([...]);           // 1
const answers = await inquirer.prompt([...]);            // 2 (returns multiple fields)
const frameworkAnswer = await inquirer.prompt([...]);    // 3
const gitAnswer = await inquirer.prompt([...]);          // 4
const aiToolAnswer = await inquirer.prompt([...]);       // 5
const mcpAnswer = await inquirer.prompt([...]);          // 6
const optionalAnswer = await inquirer.prompt([...]);     // 7

// Test needs 7 mocks
mockPrompt
  .mockResolvedValueOnce({ mode: 'quick' })
  .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
  .mockResolvedValueOnce({ framework: 'react' })
  .mockResolvedValueOnce({ useGit: true })
  .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
  .mockResolvedValueOnce({ mcpServers: [] })
  .mockResolvedValueOnce({ additionalRules: [] });
```

### 4. Handle Conditional Prompts

Some prompts have `when` conditions:

```typescript
{
  name: 'mcpServers',
  when: () => mcpChoices.length > 0
}
```

**Test must account for this:**
```typescript
// If MCP servers detected: 7 mocks
// If no MCP servers: 6 mocks (skip mcpServers prompt)

const { detectMCPServers } = require('../src/utils/mcp-detector');
detectMCPServers.mockReturnValueOnce([]); // No servers

mockPrompt
  .mockResolvedValueOnce({ mode: 'quick' })
  // ... 5 more (no mcpServers mock)
```

### 5. Mock Other Dependencies

Don't let `resetAllMocks()` break other mocks:

```typescript
// ❌ Bad: ora breaks when reset
jest.mock('ora', () => jest.fn(() => ({ start: jest.fn() })));

// ✅ Good: ora persists across resets
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});
```

### 6. Test Edge Cases

Cover scenarios where behavior changes:
- No MCP servers detected
- Different project types (affects framework choices)
- Different languages (affects available frameworks)
- Detailed vs Quick mode

---

## Testing Patterns

### Pattern 1: Basic Flow Test

```typescript
test('completes UI TypeScript React flow', async () => {
  mockPrompt
    .mockResolvedValueOnce({ mode: 'quick' })
    .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
    .mockResolvedValueOnce({ framework: 'react' })
    .mockResolvedValueOnce({ useGit: true })
    .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
    .mockResolvedValueOnce({ mcpServers: ['amazon-q-history'] })
    .mockResolvedValueOnce({ additionalRules: [] });

  const result = await runWizard();

  expect(result.projectType).toBe('ui');
  expect(result.language).toBe('typescript');
  expect(result.framework).toBe('react');
});
```

### Pattern 2: Edge Case Test

```typescript
test('handles no MCP servers', async () => {
  detectMCPServers.mockReturnValueOnce([]);

  mockPrompt
    .mockResolvedValueOnce({ mode: 'quick' })
    .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
    .mockResolvedValueOnce({ framework: 'react' })
    .mockResolvedValueOnce({ useGit: true })
    .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
    .mockResolvedValueOnce({ additionalRules: [] }); // No mcpServers mock

  const result = await runWizard();

  expect(result.mcpServers).toEqual([]);
});
```

### Pattern 3: Smoke Test

```typescript
test('completes with defaults', async () => {
  // Accept all defaults
  mockPrompt
    .mockResolvedValueOnce({ mode: 'quick' })
    .mockResolvedValueOnce({ projectType: 'ui', language: 'typescript' })
    .mockResolvedValueOnce({ framework: 'react' })
    .mockResolvedValueOnce({ useGit: true })
    .mockResolvedValueOnce({ aiTool: 'kiro-cli' })
    .mockResolvedValueOnce({ mcpServers: [] })
    .mockResolvedValueOnce({ additionalRules: [] });

  const result = await runWizard();

  expect(result).toBeDefined();
  expect(result.projectType).toBeDefined();
});
```

---

## Debugging Tips

### Issue: "Cannot read properties of undefined"

**Cause:** Mock queue exhausted or wrong number of mocks.

**Fix:** Count `await inquirer.prompt()` calls in code, ensure equal mocks.

### Issue: "Expected X, received undefined"

**Cause:** Mock not returning expected field.

**Fix:** Check if prompt returns multiple fields in one object.

### Issue: Tests pass individually but fail together

**Cause:** Mock state carrying over between tests.

**Fix:** Use `mockReset()` in `beforeEach()`.

### Issue: Other mocks break after reset

**Cause:** `resetAllMocks()` or `jest.resetAllMocks()` resets everything.

**Fix:** Only reset specific mock: `mockPrompt.mockReset()`.

---

## Best Practices

1. **One mock per prompt call** - Not per question
2. **Use mockReset()** - In beforeEach for clean state
3. **Test edge cases** - Conditional prompts, empty lists
4. **Keep mocks simple** - Return only required fields
5. **Document prompt flow** - Comment which mock matches which prompt
6. **Avoid mock-stdin** - For Inquirer.js, use direct mocking

---

## Example Test File Structure

```typescript
import inquirer from 'inquirer';
import { runWizard } from '../src/core/wizard';

jest.mock('../src/utils/mcp-detector');
jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
  };
  return jest.fn(() => mockSpinner);
});
jest.mock('inquirer');

describe('Wizard Tests', () => {
  const mockPrompt = inquirer.prompt as jest.MockedFunction<typeof inquirer.prompt>;

  beforeEach(() => {
    mockPrompt.mockReset();
  });

  describe('Happy Paths', () => {
    test('UI project', async () => { /* ... */ });
    test('Backend project', async () => { /* ... */ });
  });

  describe('Edge Cases', () => {
    test('No MCP servers', async () => { /* ... */ });
    test('No framework', async () => { /* ... */ });
  });
});
```

---

## Test Coverage

### 1. Rules Selector Tests (`tests/rules-selector.test.ts`)

**Basic Functionality** (3 tests):
- UI TypeScript React with Git
- Backend Python without Git
- Additional rules selection

### 2. Scenario Tests (`tests/scenarios.test.ts`)

**Language Variations** (3 tests):
- ✅ TypeScript + React
- ✅ JavaScript + React
- ✅ Python (no React rules)

**Framework Variations** (4 tests):
- ✅ React
- ✅ React Native
- ✅ Next.js
- ✅ Vue (no React rules)

**Project Type Variations** (4 tests):
- ✅ UI project
- ✅ Backend project
- ✅ Fullstack project
- ✅ CLI project

**Git Variations** (2 tests):
- ✅ With Git
- ✅ Without Git

**Detailed Setup Options** (10 tests):
- ✅ With/Without ESLint
- ✅ With/Without Semantic Versioning
- ✅ With Chakra UI
- ✅ With GlueStack UI
- ✅ Without UI Library
- ✅ With Environment Variables (protected)
- ✅ With Environment Variables (unprotected)
- ✅ Without Environment Variables

**Real-World Scenarios** (3 tests):
- ✅ Full-stack Next.js TypeScript with all features
- ✅ Simple Python backend with minimal setup
- ✅ React Native TypeScript mobile app

### 3. Integration Tests (`tests/integration.test.ts`)

**File Generation** (2 tests):
- ✅ Generate files for UI TypeScript React project
- ✅ Generate files for Amazon Q

### 4. Validator Tests (`tests/validator.test.ts`)

**Rule Validation** (9 tests):
- ✅ Validate all curated rules
- ✅ Detect missing frontmatter
- ✅ Detect missing required fields
- ✅ Detect invalid version format
- ✅ Detect invalid category
- ✅ Detect invalid date format
- ✅ Validate agent JSON structure
- ✅ Detect invalid JSON format
- ✅ Skip README.md files

### 5. Update Command Tests (`tests/update.test.ts`)

**Configuration Detection** (3 tests):
- ✅ Detect missing configuration
- ✅ Detect kiro-cli configuration
- ✅ Detect Amazon Q configuration

**Backup Creation** (2 tests):
- ✅ Prompt for backup confirmation
- ✅ Allow user to cancel update

**Rule Management** (1 test):
- ✅ Show update options prompt

**Update Statistics** (1 test):
- ✅ Show configuration type in output

### 6. MCP JSON Generation Tests (`tests/mcp-json.test.ts`)

**JSON Validation** (4 tests):
- ✅ Generate valid JSON without HTML entities
- ✅ Handle single MCP server
- ✅ Handle no MCP servers
- ✅ Properly format multiple MCP servers with commas

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Scenarios Matrix

| Language | Framework | Project Type | Git | Rules Count |
|----------|-----------|--------------|-----|-------------|
| TypeScript | React | UI | Yes | 12 |
| JavaScript | React | UI | Yes | 11 |
| Python | FastAPI | Backend | No | 2 |
| TypeScript | Next.js | Fullstack | Yes | 15+ |
| TypeScript | React Native | UI | Yes | 14+ |

## What's Tested

✅ **Language combinations**: TypeScript, JavaScript, Python, Lua  
✅ **Framework combinations**: React, React Native, Next.js, Vue, Express, FastAPI  
✅ **Project types**: UI, Backend, CLI, Library, Fullstack  
✅ **Optional features**: Git, ESLint, UI libraries, versioning, env vars  
✅ **AI tools**: kiro-cli, Amazon Q  
✅ **File generation**: Directories, rules, agent JSON  
✅ **Rule selection logic**: Conditions, always-include, additional rules  
✅ **MCP server JSON**: Valid JSON, no HTML entities, proper formatting

## Adding New Tests

When adding new rules or features:

1. Add rule to `curated-presets/rules/`
2. Add conditions to frontmatter
3. Run `npm run build` (regenerates manifest)
4. Add test case to `tests/scenarios.test.ts`
5. Run `npm test` to verify

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```
