# Cairel v2.0 — Skills Migration Plan

## Overview

Migrate cairel from generating proprietary rule files (`.md` in `.kiro/steering/` and `.amazonq/rules/`) to generating Agent Skills following the open [agentskills.io](https://agentskills.io) specification. This enables cross-platform compatibility with Kiro, GitHub Copilot, Claude Code, and any future tool adopting the standard.

### Key Design Decision

Cairel's internal selection logic (conditions, categories, tags) is preserved in the `metadata` field of each skill's frontmatter. AI tools discover skills via `name` and `description`; cairel uses `metadata.cairel-*` fields for wizard-driven selection.

---

## Stage 1: Skills Format Design & Rule Conversion

**Objective**: Convert all 23 curated rules into Agent Skills format

**Scope**:
- Define cairel metadata schema (`cairel-title`, `cairel-category`, `cairel-version`, `cairel-conditions`, `cairel-tags`, `cairel-always-include`)
- Create skill folder structure for each rule (`skill-name/SKILL.md`)
- Map current rule frontmatter to skills frontmatter + cairel metadata
- Move lengthy examples or reference material into `references/` subdirectories where appropriate
- Write `description` fields optimized for AI agent discovery (keyword-rich, action-oriented)
- Validate all converted skills against the official `skills-ref` tool

**Exit Criteria**:
- All 23 rules converted to skill folders with valid `SKILL.md` files
- Each skill passes `skills-ref validate`
- Cairel metadata preserved for all conditional selection logic
- Descriptions are effective for agent auto-discovery

**Dependencies**: None

---

## Stage 2: Manifest & Selection Logic Update

**Objective**: Update cairel's internal manifest and rule selection to work with skills format

**Scope**:
- Update `scripts/generate-manifest.js` to read skills format (folder-based, new frontmatter)
- Update manifest schema to reflect `metadata.cairel-*` fields
- Update `src/core/generator.ts` rule selector to match against new metadata structure
- Update `categories.json` if needed
- Ensure `npm run build` regenerates manifest correctly from skills

**Exit Criteria**:
- Manifest auto-generated from skill frontmatter on build
- Rule selection logic produces correct results for all project type combinations
- Existing test scenarios (UI TypeScript React, Backend Python, etc.) still select correct skills

**Dependencies**: Stage 1

---

## Stage 3: Multi-Platform Output Generation

**Objective**: Generate skill folders to the correct locations for each supported platform

**Scope**:
- Replace "AI Tools" wizard question with multi-select of target platforms:
  - Kiro (`.kiro/skills/`)
  - Claude Code (`.claude/skills/`)
  - GitHub Copilot (`.github/skills/` or `.agents/skills/`)
  - Amazon Q Developer (`.amazonq/rules/` — legacy flat format for backward compatibility)
- Update `src/core/generator.ts` to output skill folders (not flat files)
- Each skill becomes a directory: `<target>/skills/<skill-name>/SKILL.md`
- Copy `references/` subdirectories when present
- Update agent JSON templates for platforms that use them:
  - Kiro: update `resources` field to use `skill://` URIs
  - Others: agent config as needed or omit if platform doesn't use it

**Exit Criteria**:
- `cairel init` generates valid skill folders for each selected platform
- Directory structure matches each platform's expected layout
- Agent JSON references skills correctly for Kiro
- Multiple platforms can be selected simultaneously
- Generated skills work natively in Kiro, Claude Code, and Copilot

**Dependencies**: Stage 2

---

## Stage 4: Wizard & Template Updates

**Objective**: Update wizard flows and Handlebars templates for skills output

**Scope**:
- Update wizard platform selection (replace kiro-cli/amazon-q/both with multi-select)
- Update or replace `agent-template.hbs` for new agent JSON structure
- Update `buildTemplateVars()` for new platform targets
- Update review step to show skill names and descriptions
- Update custom mode to work with skills (checkbox selection by category)
- Ensure MCP server configuration still works across platforms

**Exit Criteria**:
- All three wizard modes (Quick, Detailed, Custom) work with skills output
- Review step displays skill descriptions correctly
- Generated configurations are valid for all selected platforms

**Dependencies**: Stage 3

---

## Stage 5: Validation System Update

**Objective**: Update validator to validate skills format instead of flat rules

**Scope**:
- Update Zod schema for skills frontmatter (name, description, metadata.cairel-*)
- Validate skill folder structure (directory with SKILL.md)
- Validate `name` field constraints (lowercase, hyphens, max 64 chars, matches directory name)
- Validate `description` field (non-empty, max 1024 chars)
- Validate cairel metadata fields within `metadata`
- Update `cairel validate` command for new format
- Keep agent JSON validation (AJV) as-is or update for new agent structure

**Exit Criteria**:
- `cairel validate` works with skill folders
- Detects invalid skill names, missing descriptions, malformed metadata
- All 23 converted skills pass validation
- Clear error messages for validation failures

**Dependencies**: Stage 1

---

## Stage 6: Update & List Commands

**Objective**: Adapt update and list commands for skills format

**Scope**:
- Update `cairel update` to detect existing skills (folder-based)
- Backup existing skill folders before updates
- Add/remove/update skills as folders (not flat files)
- Update `cairel list` to display skills with descriptions
- Update `cairel list --category` to filter using cairel metadata
- Handle migration scenario: detect old flat rules and offer conversion

**Exit Criteria**:
- `cairel update` works with skill folders
- `cairel list` shows skills grouped by cairel-category
- Existing configurations can be updated without data loss
- Old flat-rule projects get a migration prompt

**Dependencies**: Stage 3, Stage 5

---

## Stage 7: Testing & Polish

**Objective**: Comprehensive testing of all flows with skills output

**Scope**:
- Update all existing tests for skills format
- Update test fixtures (invalid skills, valid skills)
- Test all wizard modes end-to-end
- Test multi-platform output (Kiro + Claude Code + Copilot simultaneously)
- Test skill validation against `skills-ref` tool
- Manual testing: install generated skills in Kiro, Claude Code, and Copilot CLI
- Verify skills activate correctly in each platform
- Error handling improvements
- Update integration tests for folder-based output

**Exit Criteria**:
- All tests passing
- Skills work natively in Kiro, Claude Code, and GitHub Copilot
- No regressions from v1.x functionality
- Error messages are helpful

**Dependencies**: Stage 4, Stage 5, Stage 6

---

## Stage 8: Documentation & Publication

**Objective**: Update all documentation and publish v2.0.0

**Scope**:
- Update README.md (new platform support, skills format, updated examples)
- Update docs/architecture.md for skills output flow
- Update docs/CONTRIBUTING.md for skills format requirements
- Update docs/TESTING.md
- Update CHANGELOG.md with v2.0.0 entry
- Update curated-presets/rules/README.md → curated-presets/skills/README.md
- Create migration guide for v1.x → v2.0 users
- Version bump to 2.0.0 (breaking change)
- npm publish

**Exit Criteria**:
- All documentation reflects skills format
- Migration guide exists for existing users
- Published to npm as v2.0.0
- `npm install -g cairel` installs skills-based version

**Dependencies**: Stage 7

---

## Assumptions

### CONFIRMED
- Agent Skills is the emerging cross-platform standard
- Kiro, GitHub Copilot, and Claude Code all support the format
- The `metadata` field can hold cairel-specific selection data
- Skills spec frontmatter is minimal (name + description required)
- Current rule content maps directly to skill instructions

### PENDING
- Amazon Q Developer skills support (may need legacy flat-file fallback)
- Whether `allowed-tools` field is stable enough to use
- Community feedback on cairel metadata schema naming

### RISKY
- Platform-specific extensions may diverge (Claude Code has `context: fork`, Kiro has `skill://` URIs)
  - Mitigation: Generate platform-native extensions only for platforms that support them
- Amazon Q may not adopt skills format
  - Mitigation: Keep legacy `.amazonq/rules/` output as backward-compatible option

---

## Migration Impact

### Breaking Changes (v2.0.0)
- Output format changes from flat `.md` files to skill folders
- Directory targets change (`.kiro/steering/` → `.kiro/skills/`)
- Wizard "AI Tools" question becomes multi-platform select
- Rule frontmatter schema changes

### Preserved
- All 23 curated rule contents (instructions, checklists, examples)
- Wizard-driven conditional selection logic
- Category system and tag-based filtering
- Update, validate, and list commands (adapted for new format)
- MCP server configuration
- Bootstrap command

### New Capabilities
- Cross-platform support (Kiro, Copilot, Claude Code)
- Progressive disclosure (better token efficiency)
- Skill folders can bundle scripts and references
- Skills are natively discoverable by AI agents
