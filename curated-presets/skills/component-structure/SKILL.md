---
name: component-structure
description: Organize React/TypeScript components with consistent structure, barrel exports, and clear separation. Use when creating components, organizing directories, or setting up imports in React, React Native, or Next.js projects.
metadata:
  cairel-category: typescript
  cairel-version: "1.0.0"
  cairel-tags:
    - components
    - structure
    - organization
    - react
    - typescript
  cairel-conditions:
    languages:
      - typescript
      - javascript
    frameworks:
      - react
      - react-native
      - next-js
---

# Component Organization & Structure

**Purpose**: Maintain consistent component organization patterns for better discoverability and maintainability.

**Applies To**: React, React Native, Next.js projects with TypeScript

---

## 🚨 Critical Rules

### 1. Dedicated Folder Per Component

```
components/elements/Avatar/
├── Avatar.tsx
└── index.ts
```

**Never** flat structure like `components/Avatar.tsx`.

### 2. Barrel Exports Pattern

```typescript
// components/elements/Avatar/index.ts
export * from './Avatar';

// components/elements/index.ts
export * from './Avatar';
export * from './Button';
```

### 3. Use Wildcard Exports

```typescript
// ✅ Correct
export * from './InputSearch';

// ❌ Wrong
export { InputSearch } from './InputSearch';
```

---

## 📋 Standard Rules

### Component Categories

```
components/
├── elements/       # Basic UI elements (Button, Avatar)
├── inputs/         # Form inputs
├── forms/          # Form components
├── layouts/        # Layout components
├── providers/      # Context providers
└── hooks/          # Custom hooks
```

### Import Strategy

- **Absolute imports** (`@/components/elements/Button`) for external dependencies
- **Relative imports** (`./components/CardHeader`) only for child components within same folder

---

## ✅ Checklist

- [ ] Created dedicated folder with component name
- [ ] Created index.ts with barrel export (`export *`)
- [ ] Added export to category index.ts
- [ ] Used absolute imports for external dependencies
- [ ] Subcomponents in `components/` subfolder (not exported from category)

---

## 🤖 AI Self-Check Protocol

```
New Component → Top-level or Subcomponent?
├─ Top-level → Create folder → ComponentName.tsx + index.ts → Add to category index
└─ Subcomponent → Create in parent's components/ → Use relative import
```
