---
name: react-props-destructuring
description: Use destructured props in React component function parameters for better readability and type safety. Use when creating React, React Native, or Next.js components. Covers default values and rest props pattern.
metadata:
  cairel-category: typescript
  cairel-version: "1.0.0"
  cairel-tags:
    - react
    - props
    - destructuring
    - patterns
  cairel-conditions:
    frameworks:
      - react
      - react-native
      - next-js
---

# React Props Destructuring Pattern

**Purpose**: Maintain consistent props destructuring pattern in React components.

**Applies To**: React, React Native, Next.js projects

---

## 🚨 Critical Rules

### Destructure Props in Function Parameters

**ALWAYS destructure props directly in function parameter parentheses. NEVER destructure inside function body.**

```typescript
// ✅ Correct
export const Component: React.FC<IProps> = ({
  prop1,
  prop2 = defaultValue,
  ...rest
}) => {
  return <div {...rest}>{prop1}</div>;
};

// ❌ Wrong
export const Component: React.FC<IProps> = (props) => {
  const { prop1, prop2 = defaultValue, ...rest } = props;
  return <div {...rest}>{prop1}</div>;
};
```

---

## ✅ Checklist

- [ ] Props destructured in function parameters
- [ ] Default values applied in destructuring
- [ ] Rest props captured with `...rest`
- [ ] No props destructuring in function body
