# TASK-006: Add constraint generation for Claude Code and GitHub Copilot

## Metadata

| Field | Value |
|-------|-------|
| ID | TASK-006 |
| Priority | P1 |
| Scope | MVP |
| Type | feature |
| Domain | generation |
| Subprojects | cli |
| Stories | CON-03, CON-04 |
| Depends on | TASK-004 |
| Blocks | — |

## Description

Extend the generator to output constraints as a single aggregated instructions file for platforms that use a global instructions file: `CLAUDE.md` for Claude Code and `.github/copilot-instructions.md` for GitHub Copilot.

## Implementation Guide

1. Add `generateInstructionsFile()` function in `generator.ts`:
   - Collects all `CONSTRAINTS.md` content from selected skills
   - Groups under headings (e.g., `## Git Rules`, `## Commit Format`)
   - Writes to the platform-appropriate path
2. For Claude Code (`claude-code` platform):
   - Output to `CLAUDE.md` in project root
   - If file exists, prepend constraints section (don't overwrite)
3. For GitHub Copilot (`github-copilot` platform):
   - Output to `.github/copilot-instructions.md`
   - If file exists, prepend constraints section (don't overwrite)
4. Skills continue to generate in their respective skill directories unchanged
5. Add tests for both platforms

## Acceptance Criteria

- [ ] `CLAUDE.md` generated with constraints for Claude Code platform
- [ ] `.github/copilot-instructions.md` generated with constraints for Copilot platform
- [ ] Existing files are not overwritten — constraints are prepended
- [ ] Skills still generate unchanged
- [ ] Tests pass

## Comments
