---
name: icon-usage-patterns
description: Standardize icon usage with proper wrapping and theming support. Use when adding icons to React components with Chakra UI or GlueStack UI. Covers react-icons wrapping, custom SVG icons, and theme color enforcement.
metadata:
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - icons
    - react-icons
    - svg
    - ui-components
  cairel-conditions:
    project-types:
      - ui
      - fullstack
    ui-library:
      - chakra-ui
      - gluestack-ui
---

# Icon Usage Patterns

**Purpose**: Standardize icon usage with proper wrapping and theming support.

**Applies To**: React projects using icons with Chakra UI or GlueStack UI

---

## 🚨 Critical Rules

### 1. Wrap React Icons with UI Library Icon Component

**NEVER use react-icons directly without wrapper.**

### 2. Use Theme Colors

**ALWAYS use theme colors, NEVER hardcode hex values.**

---

## 📋 Standard Rules

### React Icons Pattern (Chakra UI)

```typescript
import { Icon } from '@chakra-ui/react';
import { HiOutlinePhone } from 'react-icons/hi';

// ✅ Correct
<Icon color="primary"><HiOutlinePhone /></Icon>

// ❌ Wrong - no wrapper
<HiOutlinePhone />

// ❌ Wrong - hardcoded color
<Icon color="#E57A44"><HiOutlinePhone /></Icon>
```

### Custom SVG Icons

```typescript
import { createIcon } from '@chakra-ui/react';

const StarIcon = createIcon({
  displayName: "StarIcon",
  viewBox: "0 0 40 39",
  path: <path d="M17.1468..." fill="currentColor" />,
});
```

---

## ✅ Checklist

- [ ] React icons wrapped with Icon component
- [ ] Theme colors used (no hex values)
- [ ] Custom SVGs use createIcon utility
- [ ] SVG paths use currentColor
