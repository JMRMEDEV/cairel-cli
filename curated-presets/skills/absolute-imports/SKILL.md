---
name: absolute-imports
description: Configure and use absolute imports with @ alias for cleaner, more maintainable import statements. Use when setting up TypeScript paths or writing import statements. Enforces @/ prefix for external and relative-only for children.
metadata:
  cairel-title: "Absolute Imports Configuration"
  cairel-category: typescript
  cairel-version: "1.0.0"
  cairel-tags:
    - imports
    - paths
    - aliases
    - typescript
  cairel-conditions:
    languages:
      - typescript
      - javascript
---

# Absolute Imports Configuration

**Purpose**: Use absolute imports with @ alias for cleaner, more maintainable imports.

**Applies To**: TypeScript/JavaScript projects

---

## 🚨 Critical Rules

### 1. Use Absolute Imports for External Dependencies

**ALWAYS use `@/` alias for imports from src/ directory.**

### 2. Relative Imports Only for Children

**Relative imports ONLY allowed for child components within same folder (max 2 levels deep).**

---

## 📋 Standard Rules

```typescript
// ✅ Absolute imports
import { Button } from '@/components/elements/Button';
import { useAuth } from '@/hooks/useAuth';

// ✅ Relative imports (children only)
import { CardHeader } from './components/CardHeader';

// ❌ Never relative for siblings
import { Button } from '../Button';
```

### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## ✅ Checklist

- [ ] tsconfig.json configured with @ alias
- [ ] All external imports use @/ prefix
- [ ] Relative imports only for child components
- [ ] No sibling relative imports
