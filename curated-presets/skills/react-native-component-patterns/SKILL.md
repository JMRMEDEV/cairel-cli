---
name: react-native-component-patterns
description: Strict patterns for React Native component creation with GlueStack UI v1 themed components. Use when creating React Native components, organizing directories, or setting up barrel exports. Covers interface naming, import organization, and subcomponent patterns.
metadata:
  cairel-title: "React Native Component Patterns (GlueStack UI v1)"
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - react-native
    - gluestack-ui
    - components
    - patterns
  cairel-conditions:
    frameworks:
      - react-native
    ui-library:
      - gluestack-ui
---

# React Native Component Patterns (GlueStack UI v1)

**Purpose**: Strict patterns for React Native component creation with GlueStack UI v1.

**Applies To**: React Native projects using @gluestack-ui/themed

---

## 🚨 Critical Rules

### Rule 1: Follow Component Structure Template

```typescript
import { View } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';

interface IComponentProps extends ComponentProps<typeof View> {}

export const Component: React.FC<IComponentProps> = ({
  ...rest
}): JSX.Element => {
  return <View {...rest} />;
};
```

### Rule 2: Maintain Directory Structure

```
components/elements/ComponentName/
├── ComponentName.tsx
├── index.tsx
└── components/          # Non-reusable subcomponents
    └── SubComponent.tsx
```

---

## 📋 Standard Rules

### Interface Naming

- Component interfaces: `IComponentNameProps`
- Always extend appropriate base component props
- Use `type` keyword for imports: `import { type ComponentProps } from 'react'`

### Import Organization Order

1. External libraries (React, Expo)
2. GlueStack UI components
3. Type imports (with `type` keyword)
4. Internal utilities
5. Relative component imports

### Barrel Exports

```typescript
// components/elements/index.tsx
export * from './ComponentName';
// -- APPEND IMPORT HERE --
```

---

## ✅ Checklist

- [ ] Component directory created with index.tsx
- [ ] Interface with `I` prefix extending base props
- [ ] Destructuring with rest props and JSX.Element return type
- [ ] Imports organized by category
- [ ] Barrel export updated
- [ ] Non-reusable subcomponents in `components/` subdirectory
