---
meta:
  id: "gluestack-ui-v1-themed"
  title: "GlueStack UI v1 (Themed) Component Patterns"
  author: "cairel-core"
  version: "1.0.0"
  category: "ui"
  tags: ["gluestack-ui", "react-native", "themed", "components"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
  conditions:
    ui-library:
      - gluestack-ui
---

# GlueStack UI v1 (Themed) Component Patterns

**Purpose**: Extend GlueStack UI component props for styling compatibility.

**Applies To**: React Native projects using @gluestack-ui/themed

---

## 🚨 Critical Rules

### 1. Extend Base Component Props

**ALWAYS extend GlueStack UI component props using ComponentProps<typeof Component>.**

### 2. Use Rest Props Pattern

**ALWAYS capture and spread rest props for styling compatibility.**

---

## 📋 Standard Rules

### Component Pattern

```typescript
import { View, Text } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';

interface ICustomComponentProps extends ComponentProps<typeof View> {
  title?: string;
  onPress?: () => void;
}

export const CustomComponent: React.FC<ICustomComponentProps> = ({
  title,
  onPress,
  ...rest
}): JSX.Element => {
  return (
    <View {...rest}>
      <Text>{title}</Text>
    </View>
  );
};
```

### Usage with Styling

```typescript
<CustomComponent
  title="Hello"
  bg="$primary500"
  p="$4"
  borderRadius="$md"
/>
```

### Common Base Components

```typescript
import {
  View,
  Text,
  Button,
  Input,
  Box,
  HStack,
  VStack
} from '@gluestack-ui/themed';
```

---

## ✅ Checklist

When creating GlueStack components:

- [ ] Extended ComponentProps<typeof BaseComponent>
- [ ] Captured ...rest props
- [ ] Spread rest props on base component
- [ ] Imported from @gluestack-ui/themed

---

## 🔍 Examples

### ✅ Good: Proper Extension

```typescript
interface ICardProps extends ComponentProps<typeof View> {
  title: string;
  subtitle?: string;
}

export const Card: React.FC<ICardProps> = ({
  title,
  subtitle,
  ...rest
}) => {
  return (
    <View {...rest}>
      <Text>{title}</Text>
      {subtitle && <Text>{subtitle}</Text>}
    </View>
  );
};

// Usage with styling
<Card
  title="Title"
  bg="$white"
  p="$4"
  borderRadius="$lg"
  shadowColor="$black"
/>
```

### ❌ Bad: No Extension

```typescript
interface ICardProps {
  title: string;
  // Missing ComponentProps extension
}

export const Card: React.FC<ICardProps> = ({ title }) => {
  return (
    <View>  {/* Can't pass styling props */}
      <Text>{title}</Text>
    </View>
  );
};
```

---

## 🚫 Common Mistakes

### Mistake 1: Not Extending Props

**Problem**: Can't pass styling props to component

**Solution**: Extend ComponentProps<typeof BaseComponent>

### Mistake 2: Not Using Rest Props

**Problem**: Styling props not forwarded

**Solution**: Capture ...rest and spread on base component

### Mistake 3: Wrong Import

**Problem**: Importing from wrong package

**Solution**: Always import from @gluestack-ui/themed
