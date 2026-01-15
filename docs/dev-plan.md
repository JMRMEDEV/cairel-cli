# Cairel Development Plan

## Stage 1: Project Setup ✅ COMPLETE

**Objective**: Initialize TypeScript project with dependencies

**Scope**:
- npm init
- Install dependencies (commander, inquirer, handlebars, zod, etc.)
- Configure tsconfig.json
- Set up directory structure

**Exit Criteria**:
- package.json configured
- All dependencies installed
- TypeScript compiles successfully
- Directory structure created

**Status**: ✅ Complete (Phase 1 - Design & Curation)

---

## Stage 2: Core CLI Framework

**Objective**: Implement basic CLI structure with commands

**Scope**:
- CLI entry point (src/index.ts)
- Commander.js setup
- Command structure (init, bootstrap, update, validate, list)
- Help and version commands
- **Getting started tool**: `cairel` (no args) shows interactive menu

**Exit Criteria**:
- `cairel --help` works
- `cairel --version` works
- `cairel` (no args) shows getting started menu
- `cairel bootstrap` shows path to .ai/ for kiro-cli
- Command structure in place
- Can be run with `npm link`

**Dependencies**: Stage 1

**Note**: When user runs `cairel` without arguments, show interactive menu:
```
? What would you like to do?
  ❯ Initialize AI configuration (cairel init)
    Bootstrap project documentation (cairel bootstrap)
    Update existing configuration (cairel update)
    Validate rules (cairel validate)
    List available presets (cairel list)
    Show help (cairel --help)
```

**Bootstrap Command**: Shows kiro-cli where to find cairel's .ai/ directory:
```bash
cairel bootstrap

# Output:
✓ Ready to bootstrap project

Copy this for kiro-cli:

Read /usr/local/lib/node_modules/cairel/.ai/KICKOFF-PROMPT.txt
and follow the new.md protocol to initialize this project.
```

---

## Stage 3: Wizard Implementation

**Objective**: Implement interactive wizard with Inquirer.js

**Scope**:
- Mode selection (Quick/Detailed/Custom)
- Quick setup questions (6 questions)
- Detailed setup questions (12 questions)
- Answer validation
- MCP server detection

**Exit Criteria**:
- Wizard completes successfully
- All questions asked based on mode
- Answers validated
- MCP servers detected

**Dependencies**: Stage 2

---

## Stage 4: File Generation System

**Objective**: Generate rules and agent configurations

**Scope**:
- Handlebars template rendering
- Rules selection based on answers
- Agent configuration generation
- Directory creation (.kiro/ or .amazonq/)
- File writing with proper permissions

**Exit Criteria**:
- Rules copied to correct directory
- Agent JSON generated correctly
- Files have proper permissions
- No file conflicts

**Dependencies**: Stage 3

---

## Stage 5: Validation System

**Objective**: Implement rule and agent validation

**Scope**:
- Zod schema for rules
- AJV schema for agents
- Validation command implementation
- Error reporting

**Exit Criteria**:
- `cairel validate` works
- Rules validated against schema
- Agents validated against JSON schema
- Clear error messages

**Dependencies**: Stage 4

---

## Stage 5.5: List Command

**Objective**: Implement list command to display available rules and agents

**Scope**:
- List command implementation
- Display rules grouped by category
- Show descriptions and conditions
- Filter options (--rules, --agents, --category)
- Visual formatting with emojis

**Exit Criteria**:
- `cairel list` shows all rules
- `cairel list --rules` shows only rules
- `cairel list --agents` shows only agents
- `cairel list --category <category>` filters by category
- Clear, formatted output

**Dependencies**: Stage 4 (rules manifest)

**Status**: ✅ Complete (2026-01-15)

---

## Stage 6: Update Command

**Objective**: Implement update functionality

**Scope**:
- Detect existing configuration
- Update rules without overwriting custom changes
- Update agent configurations
- Backup existing files

**Exit Criteria**:
- `cairel update` works
- Existing files backed up
- Updates applied correctly
- No data loss

**Dependencies**: Stage 5

**Status**: ✅ Complete (2026-01-15)

---

## Stage 7: Testing & Polish

**Objective**: Manual testing and bug fixes

**Scope**:
- Test all wizard modes
- Test all commands
- Error handling
- User feedback
- Documentation

**Exit Criteria**:
- All commands work correctly
- Error messages are helpful
- Documentation complete
- Ready for npm publish

**Dependencies**: Stage 6

**Status**: 🚧 IN PROGRESS (2026-01-15)

**Completed**:
- ✅ Manual testing performed
- ✅ Fixed double checkmark in success message
- ✅ Fixed icon-usage-patterns rule condition (requires UI library)
- ✅ Fixed agent template formatting (no empty lines in arrays)
- ✅ Enhanced validate command (supports individual files + auto-detection)
- ✅ Comprehensive test coverage (62 tests, all passing)

**Remaining**:
- ⏳ Implement custom rules mode
- ⏳ Add review step before file generation
- ⏳ Final documentation polish
- ⏳ Error handling improvements

---

## Stage 7.5: Missing Features (Identified during testing)

**Objective**: Implement features identified during manual testing

**Scope**:
1. **Custom Rules Mode**
   - Interactive rule creator wizard
   - Custom rule template generation
   - Validation of custom rules

2. **Review Step Before Generation**
   - Show list of rules and agents to be generated
   - Display descriptions
   - Allow user to toggle/deselect items
   - Confirm before writing files

**Exit Criteria**:
- Custom mode creates valid rules
- Review step allows rule selection
- User can cancel before file generation

**Dependencies**: Stage 7

---

## Stage 8: npm Publication

**Objective**: Publish to npm registry

**Scope**:
- Prepare package for publication
- Test installation from npm
- Publish to npm
- Create GitHub repository
- Tag release

**Exit Criteria**:
- Published to npm
- Installable via `npm install -g cairel`
- Works via `npx cairel init`
- GitHub repository created

**Dependencies**: Stage 7

---

## Assumptions

### CONFIRMED
- TypeScript is the right choice for type safety
- Handlebars is sufficient for templating
- Zod + AJV for validation
- Commander + Inquirer for CLI

### PENDING
- MCP server detection paths (need user feedback)
- Default agent names (need user feedback)
- Backup strategy details

### RISKY
- None identified yet

---

## Risks

1. **MCP Server Detection**: Paths may vary by user
   - Mitigation: Allow custom paths, provide common defaults

2. **File Conflicts**: Existing files may conflict
   - Mitigation: Backup before overwriting, ask user

3. **npm Publication**: First-time publication issues
   - Mitigation: Test with npm pack first

---

## Timeline Estimate

- Stage 2: 2-3 hours
- Stage 3: 3-4 hours
- Stage 4: 4-5 hours
- Stage 5: 2-3 hours
- Stage 6: 2-3 hours
- Stage 7: 3-4 hours
- Stage 8: 1-2 hours

**Total**: 17-24 hours of development time
