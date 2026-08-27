import * as fs from 'fs-extra';
import * as path from 'path';
import {
  validateEnforcement,
  DirectiveValidationEntry,
  Platform,
} from './enforcement-validator.js';
import { Validator } from './validator.js';

/**
 * Result of validating a single agent file during a no-arg platform scan.
 */
export interface AgentValidationEntry {
  platform: Platform;
  path: string;
  name: string;
  valid: boolean;
  errors: string[];
}

/**
 * A single platform's grouped validation results. Only platforms that have at
 * least one directive or agent file are represented (empty platforms are
 * silently skipped by the scanner).
 */
export interface PlatformGroup {
  platform: Platform;
  directives: DirectiveValidationEntry[];
  agents: AgentValidationEntry[];
}

/**
 * Full result of a no-arg "validate everything" scan.
 */
export interface PlatformScanResult {
  groups: PlatformGroup[];
  totalDirectives: number;
  totalAgents: number;
  platformCount: number;
  hasErrors: boolean;
}

/** Human-friendly display labels for each platform. */
export const PLATFORM_LABELS: Record<Platform, string> = {
  kiro: 'Kiro',
  cursor: 'Cursor',
  'claude-code': 'Claude Code',
  'github-copilot': 'GitHub Copilot',
  'amazon-q': 'Amazon Q',
};

/**
 * Deterministic display order for platforms in the grouped report.
 */
const PLATFORM_ORDER: Platform[] = [
  'kiro',
  'cursor',
  'claude-code',
  'github-copilot',
  'amazon-q',
];

/**
 * Known agent directories mapped to their owning platform. Scanned in no-arg
 * mode so agents are validated alongside directives.
 */
const AGENT_DIRS: Array<{ platform: Platform; dir: string }> = [
  { platform: 'kiro', dir: path.join('.kiro', 'agents') },
  { platform: 'amazon-q', dir: path.join('.amazonq', 'cli-agents') },
];

/**
 * Scan all known platform directories in `cwd`, validate every directive and
 * agent found using the correct schema per platform, and group the results by
 * platform.
 *
 * Platforms with no directive and no agent files are omitted from `groups`
 * (silently skipped).
 */
export async function scanPlatforms(cwd: string): Promise<PlatformScanResult> {
  const validator = new Validator();

  // Directives across all platforms (Kiro steering/skills, Cursor, Claude,
  // Copilot, Amazon Q) — reuses the enforcement validator's per-platform logic.
  const enforcement = await validateEnforcement(cwd);

  // Agents (Kiro + Amazon Q).
  const agentEntries: AgentValidationEntry[] = [];
  for (const { platform, dir } of AGENT_DIRS) {
    const agentsDir = path.join(cwd, dir);
    if (!(await fs.pathExists(agentsDir))) continue;

    const results = await validator.validateAgentsDirectory(agentsDir);
    for (const [file, result] of results) {
      agentEntries.push({
        platform,
        path: path.join(agentsDir, file),
        name: file,
        valid: result.valid && result.errors.length === 0,
        errors: result.errors,
      });
    }
  }

  // Group directives + agents by platform.
  const byPlatform = new Map<Platform, PlatformGroup>();
  const ensureGroup = (platform: Platform): PlatformGroup => {
    let group = byPlatform.get(platform);
    if (!group) {
      group = { platform, directives: [], agents: [] };
      byPlatform.set(platform, group);
    }
    return group;
  };

  for (const d of enforcement.directives) {
    ensureGroup(d.platform).directives.push(d);
  }
  for (const a of agentEntries) {
    ensureGroup(a.platform).agents.push(a);
  }

  // Emit groups in deterministic platform order; skip empty platforms.
  const groups: PlatformGroup[] = [];
  for (const platform of PLATFORM_ORDER) {
    const group = byPlatform.get(platform);
    if (group && (group.directives.length > 0 || group.agents.length > 0)) {
      groups.push(group);
    }
  }

  const totalDirectives = enforcement.directives.length;
  const totalAgents = agentEntries.length;
  const hasErrors =
    enforcement.directives.some(d => !d.valid) || agentEntries.some(a => !a.valid);

  return {
    groups,
    totalDirectives,
    totalAgents,
    platformCount: groups.length,
    hasErrors,
  };
}

/**
 * Build the one-line summary string required by TASK-022.
 */
export function summaryLine(result: PlatformScanResult): string {
  const d = result.totalDirectives;
  const a = result.totalAgents;
  const z = result.platformCount;
  const dWord = d === 1 ? 'directive' : 'directives';
  const aWord = a === 1 ? 'agent' : 'agents';
  const zWord = z === 1 ? 'platform' : 'platforms';
  return `Validated ${d} ${dWord} and ${a} ${aWord} across ${z} ${zWord}`;
}
