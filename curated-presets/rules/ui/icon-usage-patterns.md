---
meta:
  id: "icon-usage-patterns"
  title: "Icon Usage Patterns"
  author: "cairel-core"
  version: "1.0.0"
  category: "ui"
  tags: ["icons", "react-icons", "svg", "ui-components"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
  conditions:
    project-types:
      - ui
      - fullstack
---

# Icon Usage Patterns

**Purpose**: Standardize icon usage with proper wrapping and theming support.

**Applies To**: React, React Native projects using icons

---

## 🚨 Critical Rules

### 1. Wrap React Icons with UI Library Icon Component

**ALWAYS wrap react-icons with your UI library's Icon component.**

**NEVER use react-icons directly without wrapper.**

### 2. Use Theme Colors

**ALWAYS use theme colors, NEVER hardcode hex values.**

---

## 📋 Standard Rules

### React Icons Pattern (Chakra UI)

```typescript
import { Icon } from '@chakra-ui/react';
import { HiOutlinePhone } from 'react-icons/hi';

export const PhoneIcon: React.FC = () => {
  return (
    <Icon color="primary">
      <HiOutlinePhone />
    </Icon>
  );
};
```

### Custom SVG Icons

```typescript
import { createIcon } from '@chakra-ui/react';

const StarIcon = createIcon({
  displayName: "StarIcon",
  viewBox: "0 0 40 39",
  path: (
    <path
      d="M17.1468 2.78115C18.0449..."
      fill="currentColor"
    />
  ),
});

// Usage
<StarIcon color="primary" boxSize={10} />
```

### File Organization

```
src/components/icons/
├── PhoneIcon/
│   ├── PhoneIcon.tsx
│   └── index.ts
├── EmailIcon/
│   ├── EmailIcon.tsx
│   └── index.ts
└── index.ts
```

---

## ✅ Checklist

- [ ] React icons wrapped with Icon component
- [ ] Theme colors used (no hex values)
- [ ] Custom SVGs use createIcon utility
- [ ] SVG paths use currentColor
- [ ] Icons organized in dedicated folders

---

## 🔍 Examples

### ✅ Good

```typescript
<Icon color="primary">
  <HiOutlinePhone />
</Icon>
```

### ❌ Bad

```typescript
// No wrapper
<HiOutlinePhone />

// Hardcoded color
<Icon color="#E57A44">
  <HiOutlinePhone />
</Icon>
```
