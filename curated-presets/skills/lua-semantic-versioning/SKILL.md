---
name: lua-semantic-versioning
description: Maintain proper semantic versioning for Lua libraries through metadata file updates. Use when making changes to Lua libraries or CLI tools. Covers version increment decisions and metadata file patterns.
metadata:
  cairel-category: lua
  cairel-version: "1.0.0"
  cairel-tags:
    - lua
    - versioning
    - semantic-versioning
    - library
  cairel-conditions:
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

### Rule 2: Follow Semantic Versioning

**Version format: MAJOR.MINOR.PATCH**

- **MAJOR**: Non-backward-compatible changes
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes and minor improvements

---

## 📋 Standard Rules

### Version Increment Decision Tree

```
Is the change backward-compatible?
├─ NO → MAJOR (removed functions, changed signatures)
└─ YES → Is it a new feature?
    ├─ YES → MINOR (new functions, optional parameters)
    └─ NO → PATCH (bug fixes, performance, docs)
```

### Metadata File Patterns

- `metadata.lua` - Standard Lua metadata file
- `rockspec` - LuaRocks package specification
- Module header comments with version

---

## ✅ Checklist

- [ ] Identified correct version increment
- [ ] Updated metadata file version
- [ ] Updated changelog (if exists)
- [ ] Verified version format (X.Y.Z)
