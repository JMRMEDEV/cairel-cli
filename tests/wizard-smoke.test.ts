/**
 * Wizard Flow Smoke Tests
 * Simple tests that verify wizard completes successfully with default selections
 */

import { runWizard } from '../src/core/wizard';
import { stdin } from 'mock-stdin';
import { QuickSetupAnswers } from '../src/types/wizard';

// Mock MCP detector
jest.mock('../src/utils/mcp-detector', () => ({
  detectMCPServers: jest.fn(() => [
    { name: 'amazon-q-history', path: '/mock/path/amazon-q-history' },
    { name: 'gpt', path: '/mock/path/gpt' },
  ]),
}));

// Mock ora spinner
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  }));
});

const ENTER = '\r';

describe('Wizard Smoke Tests', () => {
  let mockStdin: any;

  beforeEach(() => {
    mockStdin = stdin();
  });

  afterEach(() => {
    mockStdin.restore();
  });

  it('should complete wizard with all default selections', (done) => {
    runWizard().then((result: QuickSetupAnswers) => {
      // Verify wizard completed and returned results
      expect(result).toBeDefined();
      expect(result.projectType).toBeDefined();
      expect(result.language).toBeDefined();
      expect(result.framework).toBeDefined();
      expect(result.aiTool).toBeDefined();
      done();
    }).catch(done);

    // Send all ENTERs to accept defaults
    setTimeout(async () => {
      for (let i = 0; i < 9; i++) {
        await new Promise(r => setTimeout(r, 200));
        mockStdin.send(ENTER);
      }
    }, 300);
  }, 20000);
});
