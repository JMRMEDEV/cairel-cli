---
meta:
  id: "lua-semantic-versioning"
  title: "Lua Library Semantic Versioning"
  author: "cairel-core"
  version: "1.0.0"
  category: "lua"
  tags: ["lua", "versioning", "semantic-versioning", "library"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-16"
  description: "Maintain proper semantic versioning for Lua libraries through metadata file updates."
  always-include: false
  conditions:
    languages:
      - lua
    project-types:
      - library
      - cli
---

# Lua Library Semantic Versioning

**Purpose**: Maintain proper semantic versioning for Lua libraries through metadata file updates.

**Applies To**: Lua library and CLI projects

---

## 🚨 Critical Rules

### Rule 1: Update Version on Every Change

**Every time you apply changes to the library, you MUST update the version in the metadata file.**

This ensures users can track changes and maintain compatibility.

### Rule 2: Follow Semantic Versioning

**Version format: MAJOR.MINOR.PATCH**

- **MAJOR**: Increment for non-backward-compatible changes
- **MINOR**: Increment for new features (backward-compatible)
- **PATCH**: Increment for bug fixes and minor improvements

---

## 📋 Standard Rules

### Version Increment Decision Tree

```
Is the change backward-compatible?
├─ NO → Increment MAJOR version (breaking change)
│   Examples:
│   - Removed public functions
│   - Changed function signatures
│   - Removed required parameters
│   - Changed return types
│
└─ YES → Is it a new feature?
    ├─ YES → Increment MINOR version (new feature)
    │   Examples:
    │   - Added new functions
    │   - Added optional parameters
    │   - Added new modules
    │   - Enhanced existing functionality
    │
    └─ NO → Increment PATCH version (bug fix)
        Examples:
        - Fixed bugs
        - Performance improvements
        - Documentation updates
        - Internal refactoring
```

### Metadata File Patterns

**Common patterns**:
- `metadata.lua` - Standard Lua metadata file
- `rockspec` - LuaRocks package specification
- `package.lua` - Custom package metadata
- Module header comments with version

### Version Update Process

1. **Identify change type**:
   - Breaking change? → MAJOR
   - New feature? → MINOR
   - Bug fix? → PATCH

2. **Update metadata file**:
   ```lua
   -- metadata.lua
   return {
     name = "library-name",
     version = "2.1.3",  -- Update this
     -- ... other metadata
   }
   ```

3. **Update changelog** (if exists):
   ```markdown
   ## [2.1.3] - 2026-01-16
   ### Fixed
   - Bug in function X
   ```

4. **Commit with version in message**:
   ```bash
   git commit -m "chore: bump version to 2.1.3"
   ```

---

## ✅ Checklist

### Before Making Changes

- [ ] Note current version
- [ ] Understand change type (breaking/feature/fix)
- [ ] Plan version increment

### After Making Changes

- [ ] Identify correct version increment
- [ ] Update metadata file version
- [ ] Update changelog (if exists)
- [ ] Verify version format (X.Y.Z)
- [ ] Commit with version message

### Before Release

- [ ] Version incremented correctly
- [ ] Changelog updated
- [ ] All tests passing
- [ ] Documentation updated

---

## 🔍 Examples

### Good: Proper Version Increments

```lua
-- metadata.lua

-- Version 1.0.0 - Initial release
return {
  version = "1.0.0",
  -- ...
}

-- Version 1.1.0 - Added new feature (backward-compatible)
return {
  version = "1.1.0",  -- MINOR increment
  -- ...
}

-- Version 1.1.1 - Fixed bug
return {
  version = "1.1.1",  -- PATCH increment
  -- ...
}

-- Version 2.0.0 - Breaking change (removed old API)
return {
  version = "2.0.0",  -- MAJOR increment
  -- ...
}
```

### Bad: Incorrect Version Increments

```lua
-- ❌ Wrong: Breaking change but only MINOR increment
-- Removed required parameter from function
return {
  version = "1.2.0",  -- Should be 2.0.0
}

-- ❌ Wrong: New feature but only PATCH increment
-- Added new public function
return {
  version = "1.1.1",  -- Should be 1.2.0
}

-- ❌ Wrong: Invalid version format
return {
  version = "1.2",  -- Should be 1.2.0
}
```

### Version Increment Scenarios

**Scenario 1: Adding Optional Parameter**
```lua
-- Before (v1.0.0)
function process(data)
  -- ...
end

-- After (v1.1.0) - MINOR increment
function process(data, options)
  options = options or {}  -- Optional
  -- ...
end
```

**Scenario 2: Removing Function**
```lua
-- Before (v1.5.0)
function oldFunction()
  -- ...
end

-- After (v2.0.0) - MAJOR increment
-- oldFunction removed (breaking change)
```

**Scenario 3: Bug Fix**
```lua
-- Before (v1.2.0)
function calculate(x)
  return x * 2  -- Bug: should be x * 3
end

-- After (v1.2.1) - PATCH increment
function calculate(x)
  return x * 3  -- Fixed
end
```

---

## 🚫 Common Mistakes

### Mistake 1: Forgetting to Update Version

**Problem**: Made changes but didn't update metadata

**Fix**: Always update version as part of the change

### Mistake 2: Wrong Increment Type

**Problem**: Breaking change but only incremented PATCH

**Fix**: Review change type carefully before incrementing

### Mistake 3: Invalid Version Format

**Problem**: Used "1.2" instead of "1.2.0"

**Fix**: Always use MAJOR.MINOR.PATCH format

### Mistake 4: Inconsistent Versioning

**Problem**: Different version in different files

**Fix**: Update all version references consistently

---

## 🤖 AI Self-Check Protocol

### Before Suggesting Changes

Ask yourself:

1. **What type of change am I making?**
   - Breaking change? → MAJOR
   - New feature? → MINOR
   - Bug fix? → PATCH

2. **Where is the version stored?**
   - metadata.lua?
   - rockspec?
   - Module header?
   - Multiple locations?

3. **What is the current version?**
   - Read current version
   - Calculate new version

### After Making Changes

Verify:

1. **Version updated correctly?**
   - Check metadata file
   - Verify format (X.Y.Z)
   - Confirm increment type

2. **All version references updated?**
   - metadata.lua
   - rockspec (if exists)
   - Module headers (if exists)
   - README (if mentioned)

3. **Changelog updated?**
   - If changelog exists
   - Document the change

---

## 📊 Version History Example

```lua
-- metadata.lua
return {
  name = "my-library",
  version = "2.3.1",
  
  -- Version history:
  -- 2.3.1 (2026-01-16) - Fixed memory leak in parser
  -- 2.3.0 (2026-01-10) - Added JSON export feature
  -- 2.2.0 (2026-01-05) - Added XML support
  -- 2.1.0 (2025-12-20) - Added validation module
  -- 2.0.0 (2025-12-15) - Removed deprecated API
  -- 1.5.0 (2025-12-01) - Added async support
  -- 1.0.0 (2025-11-15) - Initial release
}
```

---

## 🎯 Quick Reference

| Change Type | Version Increment | Example |
|-------------|-------------------|---------|
| Breaking change | MAJOR (X.0.0) | 1.5.3 → 2.0.0 |
| New feature | MINOR (x.Y.0) | 1.5.3 → 1.6.0 |
| Bug fix | PATCH (x.y.Z) | 1.5.3 → 1.5.4 |

**Golden Rule**: Every change requires a version update. Choose the increment type based on backward compatibility.

**Why it matters**: Proper versioning helps users understand compatibility and track changes.
