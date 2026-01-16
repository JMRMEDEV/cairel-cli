---
meta:
  id: "test-cleanup-protocol"
  title: "Temporary Test File Cleanup Protocol"
  author: "cairel-core"
  version: "1.0.0"
  category: "testing"
  tags: ["testing", "cleanup", "temporary-files", "library"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-16"
  description: "Manage temporary test files created for validation without polluting the repository."
  always-include: false
  conditions:
    project-types:
      - library
      - cli
---

# Temporary Test File Cleanup Protocol

**Purpose**: Manage temporary test files created for validation without polluting the repository.

**Applies To**: Library and CLI projects where tests are created for validation but should not be committed

---

## 🚨 Critical Rules

### Rule 1: Remove All Temporary Test Files Before Commit

**You MUST remove any test files you created for validation before completing the task.**

Temporary test files are for validation only and should never be committed to the repository.

### Rule 2: Revert Test-Specific Path Changes

**If you modified import/require paths for testing, you MUST revert them before completing the task.**

Test-specific path modifications can break the library for actual users.

---

## 📋 Standard Rules

### Creating Temporary Tests

**When to create temporary tests**:
- Validating new functionality
- Checking edge cases
- Verifying bug fixes
- Testing integration scenarios

**Where to create them**:
- Dedicated test directory (e.g., `test/`, `tests/`, `spec/`)
- Temporary directory (e.g., `tmp/`, `.tmp/`)
- Root directory with clear naming (e.g., `test_feature.lua`, `validate_fix.py`)

**Naming conventions**:
- Prefix with `test_`, `validate_`, or `check_`
- Use descriptive names: `test_new_parser.lua`, `validate_api_fix.py`
- Avoid generic names: `test.lua`, `temp.py`

### Path Modifications for Testing

**Common scenarios**:
- Adjusting require/import paths for local testing
- Modifying module resolution for validation
- Changing relative paths for test execution

**Example (Lua)**:
```lua
-- Temporary modification for testing
local mylib = require("../src/mylib")  -- Test path

-- Original (must be restored)
local mylib = require("mylib")  -- Production path
```

**Example (Python)**:
```python
# Temporary modification for testing
import sys
sys.path.insert(0, '../src')
from mylib import feature  # Test import

# Original (must be restored)
from mylib import feature  # Production import
```

### Cleanup Process

1. **Identify all temporary files**:
   - List files you created
   - Check for test-specific modifications

2. **Remove test files**:
   ```bash
   rm test_*.lua
   rm validate_*.py
   rm tmp/*.js
   ```

3. **Revert path modifications**:
   - Restore original require/import paths
   - Remove test-specific path adjustments
   - Verify production paths work

4. **Verify cleanup**:
   ```bash
   git status  # Should show no test files
   git diff    # Should show no test-specific changes
   ```

---

## ✅ Checklist

### Before Creating Tests

- [ ] Determine if tests are temporary or permanent
- [ ] Choose appropriate test location
- [ ] Use clear naming convention
- [ ] Note any path modifications needed

### During Testing

- [ ] Create test files in appropriate location
- [ ] Modify paths only if necessary
- [ ] Document what needs to be reverted
- [ ] Run tests and validate functionality

### After Testing (Before Commit)

- [ ] Remove all temporary test files
- [ ] Revert all path modifications
- [ ] Verify production paths work
- [ ] Check git status for cleanliness
- [ ] Confirm no test artifacts remain

---

## 🔍 Examples

### Good: Proper Test Cleanup

```bash
# 1. Create temporary test
$ cat > test_parser.lua << EOF
local parser = require("parser")
assert(parser.parse("test") == "expected")
print("Test passed!")
EOF

# 2. Run test
$ lua test_parser.lua
Test passed!

# 3. Remove test file
$ rm test_parser.lua

# 4. Verify cleanup
$ git status
On branch main
nothing to commit, working tree clean
```

### Bad: Leaving Test Files

```bash
# ❌ Created test but didn't remove it
$ cat > test.lua << EOF
local lib = require("lib")
print(lib.version)
EOF

$ lua test.lua
1.0.0

# ❌ Forgot to remove - now it's in git status
$ git status
Untracked files:
  test.lua  # ← Should have been removed
```

### Path Modification Example (Lua)

```lua
-- ❌ Bad: Left test-specific path
local mylib = require("../src/mylib")  -- Test path

-- ✅ Good: Restored production path
local mylib = require("mylib")  -- Production path
```

### Path Modification Example (Python)

```python
# ❌ Bad: Left test-specific import
import sys
sys.path.insert(0, '../src')  # Test modification
from mylib import feature

# ✅ Good: Restored production import
from mylib import feature  # Production import
```

---

## 🚫 Common Mistakes

### Mistake 1: Forgetting to Remove Test Files

**Problem**: Created test files but forgot to delete them

**Fix**: Always check `git status` before completing task

### Mistake 2: Leaving Path Modifications

**Problem**: Modified require/import paths for testing but didn't revert

**Fix**: Document path changes and revert them systematically

### Mistake 3: Committing Test Artifacts

**Problem**: Test files or test data committed to repository

**Fix**: Review git diff before committing

### Mistake 4: Breaking Production Paths

**Problem**: Reverted paths incorrectly, breaking production usage

**Fix**: Verify production paths work after cleanup

---

## 🤖 AI Self-Check Protocol

### Before Completing Task

Ask yourself:

1. **Did I create any test files?**
   - If yes → List them
   - If no → Skip to next question

2. **Where are the test files?**
   - Root directory?
   - Test directory?
   - Temporary directory?

3. **Did I modify any paths for testing?**
   - Require/import paths?
   - Module resolution?
   - Relative paths?

4. **What needs to be cleaned up?**
   - List all test files
   - List all path modifications
   - List any test artifacts

### Cleanup Verification

```bash
# 1. Check for test files
ls test_* validate_* check_* tmp/*

# 2. Check git status
git status

# 3. Check for path modifications
git diff | grep -E "(require|import|sys.path)"

# 4. Verify production paths work
# Run library in production mode
```

### Final Verification

- [ ] No test files in git status
- [ ] No path modifications in git diff
- [ ] Production paths verified working
- [ ] No test artifacts remaining

---

## 📊 Test File Patterns

### Temporary Test Files (Remove)

```
test_*.lua
test_*.py
test_*.js
validate_*.lua
validate_*.py
check_*.lua
tmp/*.lua
.tmp/*.py
```

### Permanent Test Files (Keep)

```
tests/test_suite.lua
spec/feature_spec.lua
__tests__/component.test.js
test/integration/*.py
```

**Key difference**: Permanent tests are in dedicated test directories and follow project test conventions.

---

## 🎯 Quick Reference

| Action | Required Steps |
|--------|----------------|
| Create test | Use clear naming, note location |
| Modify paths | Document changes to revert |
| Run test | Validate functionality |
| Cleanup | Remove files, revert paths |
| Verify | Check git status, test production |

**Golden Rule**: Temporary tests are for validation only. Always clean up before completing the task.

**Why it matters**: Test files pollute the repository and test-specific paths break production usage.

---

## 🔧 Cleanup Commands

### Lua Projects
```bash
# Remove test files
rm test_*.lua validate_*.lua check_*.lua

# Check for path modifications
git diff | grep "require"
```

### Python Projects
```bash
# Remove test files
rm test_*.py validate_*.py check_*.py

# Check for path modifications
git diff | grep -E "(import|sys.path)"
```

### JavaScript/TypeScript Projects
```bash
# Remove test files
rm test_*.js test_*.ts validate_*.js

# Check for path modifications
git diff | grep -E "(require|import)"
```

### Universal Cleanup
```bash
# Check git status
git status

# Review all changes
git diff

# Verify no test artifacts
ls -la | grep -E "(test_|validate_|check_|tmp)"
```
