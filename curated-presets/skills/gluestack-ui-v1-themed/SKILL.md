---
name: gluestack-ui-v1-themed
description: Use GlueStack UI v1 themed components with proper prop extension and rest props pattern. Use when creating React Native components with @gluestack-ui/themed. Covers ComponentProps extension and styling compatibility.
metadata:
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - gluestack-ui
    - react-native
    - themed
    - components
  cairel-conditions:
    ui-library:
      - gluestack-ui
---

# GlueStack UI v1 (Themed) Component Patterns

**Purpose**: Extend GlueStack UI component props for styling compatibility.

**Applies To**: React Native projects using @gluestack-ui/themed

---

## 🚨 Critical Rules

### 1. Extend Base Component Props

**ALWAYS extend using `ComponentProps<typeof Component>`.**

### 2. Use Rest Props Pattern

**ALWAYS capture and spread rest props for styling compatibility.**

---

## 📋 Standard Rules

```typescript
import { View, Text } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';

interface ICustomComponentProps extends ComponentProps<typeof View> {
  title?: string;
}

export const CustomComponent: React.FC<ICustomComponentProps> = ({
  title,
  ...rest
}): JSX.Element => {
  return (
    <View {...rest}>
      <Text>{title}</Text>
    </View>
  );
};

// Usage with styling
<CustomComponent title="Hello" bg="$primary500" p="$4" borderRadius="$md" />
```

---

## ✅ Checklist

- [ ] Extended `ComponentProps<typeof BaseComponent>`
- [ ] Captured `...rest` props
- [ ] Spread rest props on base component
- [ ] Imported from `@gluestack-ui/themed`
