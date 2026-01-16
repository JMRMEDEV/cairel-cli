---
meta:
  id: "react-native-component-patterns"
  title: "React Native Component Patterns (GlueStack UI v1)"
  author: "cairel-core"
  version: "1.0.0"
  category: "ui"
  tags: ["react-native", "gluestack-ui", "components", "patterns"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-16"
  description: "Strict patterns for React Native component creation with GlueStack UI v1 themed components."
  always-include: false
  conditions:
    frameworks:
      - react-native
    ui-library:
      - gluestack-ui
---

# React Native Component Patterns (GlueStack UI v1)

**Purpose**: Strict patterns for React Native component creation, organization, and structure with GlueStack UI v1.

**Applies To**: React Native projects using GlueStack UI v1 (@gluestack-ui/themed)

---

## 🚨 Critical Rules

### Rule 1: Follow Component Structure Template

**All components MUST follow the standardized structure:**
- Import GlueStack UI components from `@gluestack-ui/themed`
- Use TypeScript with proper interface definitions
- Extend appropriate base component props
- Use PascalCase for component and interface names
- Include JSX.Element return type annotation
- Use destructuring with rest props pattern

### Rule 2: Maintain Directory Structure

**Components MUST be organized in proper directories:**
- Elements: `components/elements/ComponentName/`
- Providers: `components/providers/ProviderName/`
- Each component in its own directory
- Include `index.tsx` for exports

---

## 📋 Standard Rules

### Basic Component Template

```typescript
import { Text, View } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';

interface IComponentNameProps extends ComponentProps<typeof View> {
  // Additional props here
}

export const ComponentName: React.FC<IComponentNameProps> = ({
  ...rest
}): JSX.Element => {
  return (
    <View {...rest}>
      <Text>ComponentName</Text>
    </View>
  );
};
```

### Directory Structure Patterns

#### Elements (Reusable Components)
```
components/elements/ComponentName/
├── ComponentName.tsx          # Main component
├── index.tsx                  # Export barrel
└── components/                # Internal subcomponents (if needed)
    ├── SubComponent1.tsx
    └── SubComponent2.tsx
```

#### Providers
```
components/providers/ProviderName/
├── ProviderName.tsx
├── index.tsx
└── components/                # Internal subcomponents (if needed)
```

### Index File Pattern

**All component directories MUST have an index.tsx:**
```typescript
export * from './ComponentName';
```

### Barrel Export Pattern

**Main index files use barrel exports:**
```typescript
// components/elements/index.tsx
export * from './ComponentName';
export * from './AnotherComponent';
// -- APPEND IMPORT HERE --
```

### Subcomponent Organization

**When a component has non-reusable subcomponents:**
- Create `components/` directory inside parent
- Place subcomponents as `.tsx` files (no individual folders)
- Import using relative paths in parent
- Do NOT export in main barrel files

**Example:**
```
Card/
├── Card.tsx
├── index.tsx
└── components/
    ├── CardButton.tsx      # Not reusable elsewhere
    ├── CardButtons.tsx     # Not reusable elsewhere
    └── DescriptionHeader.tsx # Not reusable elsewhere
```

### Interface Naming Convention

- Component interfaces: `IComponentNameProps`
- Always extend appropriate base component props
- Use TypeScript's `type` keyword for imports

**Example:**
```typescript
import { type ComponentProps } from 'react';

interface IButtonProps extends ComponentProps<typeof Button> {
  label: string;
  onPress: () => void;
}
```

### Import Organization

**Follow this order:**
1. External libraries (React, Expo, etc.)
2. GlueStack UI components
3. Type imports (with `type` keyword)
4. Internal utilities, helpers, mocks
5. Relative component imports

**Example:**
```typescript
import React from 'react';
import { Button, Text, View } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';
import { formatDate } from '@/utils/date';
import { SubComponent } from './components/SubComponent';
```

### Component Props Pattern

**Always use destructuring with rest props:**
```typescript
export const Component: React.FC<IComponentProps> = ({
  customProp,
  ...rest
}): JSX.Element => {
  return <View {...rest}>{/* content */}</View>;
};
```

**This ensures all GlueStack UI styling props work correctly.**

---

## ✅ Checklist

### Creating New Component

- [ ] Create component directory in appropriate location
- [ ] Create main component file (ComponentName.tsx)
- [ ] Create index.tsx with export
- [ ] Define interface with `I` prefix
- [ ] Extend appropriate base component props
- [ ] Use destructuring with rest props
- [ ] Add JSX.Element return type
- [ ] Import GlueStack UI components correctly
- [ ] Follow import organization order
- [ ] Add to barrel export file

### Adding Subcomponents

- [ ] Determine if subcomponent is reusable
- [ ] If not reusable, create in `components/` subdirectory
- [ ] If reusable, create as separate element
- [ ] Use relative imports for non-reusable subcomponents
- [ ] Do NOT export non-reusable subcomponents in barrel

### Before Committing

- [ ] All components follow template structure
- [ ] All directories have index.tsx
- [ ] Barrel exports updated
- [ ] Interfaces properly named
- [ ] Imports properly organized
- [ ] TypeScript compiles without errors

---

## 🔍 Examples

### Good: Proper Component Structure

```typescript
// components/elements/Card/Card.tsx
import { View, Text } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';
import { CardButton } from './components/CardButton';

interface ICardProps extends ComponentProps<typeof View> {
  title: string;
  description: string;
}

export const Card: React.FC<ICardProps> = ({
  title,
  description,
  ...rest
}): JSX.Element => {
  return (
    <View {...rest}>
      <Text>{title}</Text>
      <Text>{description}</Text>
      <CardButton />
    </View>
  );
};
```

```typescript
// components/elements/Card/index.tsx
export * from './Card';
```

```typescript
// components/elements/Card/components/CardButton.tsx
import { Button } from '@gluestack-ui/themed';
import { type ComponentProps } from 'react';

interface ICardButtonProps extends ComponentProps<typeof Button> {
  // Props specific to CardButton
}

export const CardButton: React.FC<ICardButtonProps> = ({
  ...rest
}): JSX.Element => {
  return <Button {...rest}>Action</Button>;
};
```

### Bad: Incorrect Structure

```typescript
// ❌ Wrong: Not extending base props
interface ICardProps {
  title: string;
}

// ❌ Wrong: Not using rest props
export const Card: React.FC<ICardProps> = ({ title }) => {
  return <View><Text>{title}</Text></View>;
};

// ❌ Wrong: No return type annotation
export const Card: React.FC<ICardProps> = ({ title, ...rest }) => {
  return <View {...rest}><Text>{title}</Text></View>;
};

// ❌ Wrong: Not using type keyword for imports
import { ComponentProps } from 'react';

// ❌ Wrong: Exporting non-reusable subcomponent in barrel
// components/elements/index.tsx
export * from './Card';
export * from './Card/components/CardButton';  // ❌ Don't do this
```

---

## 🚫 Common Mistakes

### Mistake 1: Not Extending Base Props

**Problem**: Interface doesn't extend ComponentProps

**Fix**: Always extend appropriate base component props
```typescript
// ✅ Correct
interface ICardProps extends ComponentProps<typeof View> {
  title: string;
}
```

### Mistake 2: Forgetting Rest Props

**Problem**: Not spreading rest props to root element

**Fix**: Always use destructuring and spread rest props
```typescript
// ✅ Correct
export const Card: React.FC<ICardProps> = ({ title, ...rest }) => {
  return <View {...rest}>{/* content */}</View>;
};
```

### Mistake 3: Wrong Import Organization

**Problem**: Imports not organized by category

**Fix**: Follow the import order (external → GlueStack → types → internal → relative)

### Mistake 4: Exporting Non-Reusable Subcomponents

**Problem**: Subcomponents exported in main barrel file

**Fix**: Only export main components in barrel files

### Mistake 5: Missing Index Files

**Problem**: Component directory without index.tsx

**Fix**: Always create index.tsx with export

---

## 🤖 AI Self-Check Protocol

### Before Creating Component

Ask yourself:

1. **Where should this component go?**
   - Is it an element or provider?
   - Is it reusable or component-specific?

2. **What should it extend?**
   - View? Button? Text?
   - What base props are needed?

3. **Does it need subcomponents?**
   - Are they reusable elsewhere?
   - Should they be in `components/` subdirectory?

### After Creating Component

Verify:

1. **Structure correct?**
   - Directory created
   - Main file created
   - Index file created
   - Barrel export updated

2. **Interface correct?**
   - Named with `I` prefix
   - Extends base props
   - Uses `type` keyword for imports

3. **Props pattern correct?**
   - Destructuring used
   - Rest props spread
   - Return type annotation

4. **Imports organized?**
   - Correct order
   - GlueStack UI from `@gluestack-ui/themed`
   - Type imports with `type` keyword

---

## 📊 Component Checklist Matrix

| Aspect | Requirement | Example |
|--------|-------------|---------|
| Directory | Own folder in elements/ or providers/ | `elements/Card/` |
| Main file | ComponentName.tsx | `Card.tsx` |
| Index file | Export barrel | `index.tsx` |
| Interface | `IComponentNameProps` | `ICardProps` |
| Extends | Base component props | `ComponentProps<typeof View>` |
| Props | Destructuring + rest | `({ title, ...rest })` |
| Return type | JSX.Element | `: JSX.Element` |
| Imports | Organized by category | External → GlueStack → Types → Internal |

---

## 🎯 Quick Reference

**Component Template:**
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

**Directory Structure:**
```
ComponentName/
├── ComponentName.tsx
├── index.tsx
└── components/  (if needed)
```

**Barrel Export:**
```typescript
export * from './ComponentName';
```

**Golden Rule**: Follow the template structure exactly. This ensures consistency, proper typing, and GlueStack UI compatibility.
