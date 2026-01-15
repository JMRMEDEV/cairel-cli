# Cairel Test Suite

## Overview

Comprehensive test coverage for all wizard scenarios and file generation.

## Test Statistics

- **Total Tests**: 48
- **Test Suites**: 5
- **Status**: ✅ All Passing

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
