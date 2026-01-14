---
meta:
  id: "component-structure"
  title: "Component Organization & Structure"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "typescript"
  tags: ["components", "structure", "organization", "react", "typescript"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# Component Organization & Structure

**Purpose**: Maintain consistent component organization patterns for better discoverability and maintainability.

**Applies To**: React, React Native, Next.js, Vue projects with TypeScript

---

## 🚨 Critical Rules

### 1. Dedicated Folder Per Component

**ALWAYS create a dedicated folder for each top-level component:**

```
components/
├── elements/
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   └── index.ts
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── index.ts
│   └── index.ts
```

**Never:**
- ❌ `components/Avatar.tsx` (flat structure)
- ❌ `components/elements/Avatar.tsx` (no folder)

**Always:**
- ✅ `components/elements/Avatar/Avatar.tsx` (dedicated folder)
- ✅ `components/elements/Avatar/index.ts` (barrel export)

### 2. Barrel Exports Pattern

**Each component folder MUST have an index.ts:**

```typescript
// components/elements/Avatar/index.ts
export * from './Avatar';
```

**Each category folder MUST have an index.ts:**

```typescript
// components/elements/index.ts
export * from './Avatar';
export * from './Button';
export * from './InputSearch';
```

### 3. Use Wildcard Exports

**ALWAYS use `export *` instead of named re-exports:**

**✅ Correct:**
```typescript
export * from './InputSearch';
export * from './EmailInput';
export * from './PasswordInput';
```

**❌ Wrong:**
```typescript
export { InputSearch } from './InputSearch';
export { EmailInput } from './EmailInput';
export { PasswordInput } from './PasswordInput';
```

**Why**: Better tree shaking, more flexible, TypeScript best practice

---

## 📋 Standard Rules

### Component Categories

**Organize components by type:**

```
components/
├── elements/       # Basic UI elements (Button, Avatar, Badge)
├── inputs/         # Form inputs (InputSearch, EmailInput)
├── forms/          # Form components (LoginForm, SignupForm)
├── layouts/        # Layout components (Header, Footer, Sidebar)
├── providers/      # Context providers (AuthProvider, ThemeProvider)
└── hooks/          # Custom hooks (useAuth, useTheme)
```

### Subcomponents

**For components with internal subcomponents:**

```
components/elements/Card/
├── Card.tsx                    # Main component
├── index.ts                    # Barrel export
└── components/                 # Internal subcomponents
    ├── CardHeader.tsx          # Not reusable elsewhere
    ├── CardBody.tsx
    └── CardFooter.tsx
```

**Rules for subcomponents:**
- Place in `components/` subfolder
- Only used by parent component
- Not exported from category index
- Use relative imports from parent

### Import Strategy

**Use absolute imports for external dependencies:**

```typescript
// ✅ Correct - Absolute imports
import { Button } from '@/components/elements/Button';
import { useAuth } from '@/hooks/useAuth';
```

**Use relative imports only for child components:**

```typescript
// Inside components/elements/Card/Card.tsx
// ✅ Correct - Relative for children
import { CardHeader } from './components/CardHeader';
import { CardBody } from './components/CardBody';
```

**Never use relative imports for siblings:**

```typescript
// ❌ Wrong - Relative for siblings
import { Button } from '../Button';

// ✅ Correct - Absolute for siblings
import { Button } from '@/components/elements/Button';
```

---

## ✅ Checklist

When creating a new component:

- [ ] Created dedicated folder with component name
- [ ] Created main component file (ComponentName.tsx)
- [ ] Created index.ts with barrel export
- [ ] Added export to category index.ts
- [ ] Used absolute imports for external dependencies
- [ ] Used relative imports only for child components

When organizing components:

- [ ] Components grouped by category
- [ ] Each category has index.ts
- [ ] Wildcard exports used throughout
- [ ] Subcomponents in components/ subfolder
- [ ] No flat file structure

---

## 🔍 Examples

### ✅ Good: Proper Component Structure

```
components/
├── elements/
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   ├── index.ts
│   │   └── components/
│   │       ├── AvatarImage.tsx
│   │       └── AvatarFallback.tsx
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── index.ts
│   └── index.ts
```

**Avatar/index.ts:**
```typescript
export * from './Avatar';
```

**elements/index.ts:**
```typescript
export * from './Avatar';
export * from './Button';
```

**Avatar.tsx:**
```typescript
import { AvatarImage } from './components/AvatarImage';
import { AvatarFallback } from './components/AvatarFallback';

export const Avatar = () => {
  return (
    <div>
      <AvatarImage />
      <AvatarFallback />
    </div>
  );
};
```

**Usage:**
```typescript
import { Avatar, Button } from '@/components/elements';
```

### ❌ Bad: Flat Structure

```
components/
├── Avatar.tsx
├── Button.tsx
├── AvatarImage.tsx
├── AvatarFallback.tsx
└── index.ts
```

**Problems:**
- No organization
- Hard to find related files
- Can't distinguish parent from child components
- Difficult to scale

---

## 🚫 Common Mistakes

### Mistake 1: Flat File Structure

**Problem**: All components in one directory

**Solution**: Create dedicated folders for each component

**Why**: Better organization, easier to find files, room for growth

### Mistake 2: Named Re-exports

**Problem**: Using `export { Component }` instead of `export *`

**Solution**: Always use wildcard exports

**Why**: Better tree shaking, more flexible imports

### Mistake 3: Relative Imports for Siblings

**Problem**: Using `../Button` to import sibling components

**Solution**: Use absolute imports with `@/` alias

**Why**: Cleaner, easier to refactor, no path confusion

### Mistake 4: Exposing Internal Subcomponents

**Problem**: Exporting subcomponents from category index

**Solution**: Keep subcomponents internal to parent

**Why**: Prevents misuse, clearer API, easier to refactor

---

## 🤖 AI Self-Check Protocol

**Before creating a component:**

1. Does this component need a dedicated folder?
   - If YES → Create folder structure
   - If NO (it's a subcomponent) → Place in parent's components/

2. Is this a top-level component?
   - If YES → Add to category index
   - If NO → Keep internal to parent

3. Am I using absolute imports?
   - If NO → Switch to @/ alias
   - If YES (and it's a child) → Use relative

4. Am I using wildcard exports?
   - If NO → Change to export *
   - If YES → Continue

**Component Creation Workflow:**

```
New Component Needed
        ↓
Top-level or Subcomponent?
        ↓
Top-level ──→ Create dedicated folder
        ↓           ↓
        ↓     Create ComponentName.tsx
        ↓           ↓
        ↓     Create index.ts (export *)
        ↓           ↓
        ↓     Add to category index
        ↓
Subcomponent ──→ Create in parent's components/
                      ↓
                Use relative import in parent
```
