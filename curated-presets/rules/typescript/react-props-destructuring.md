---
meta:
  id: "react-props-destructuring"
  title: "React Props Destructuring Pattern"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "typescript"
  tags: ["react", "props", "destructuring", "patterns"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# React Props Destructuring Pattern

**Purpose**: Maintain consistent props destructuring pattern in React components.

**Applies To**: React, React Native, Next.js projects

---

## 🚨 Critical Rules

### 1. Destructure Props in Function Parameters

**ALWAYS destructure props directly in function parameter parentheses.**

**NEVER destructure inside function body.**

---

## 📋 Standard Rules

### Destructuring Pattern

**✅ Correct:**
```typescript
export const Component: React.FC<IProps> = ({
  prop1,
  prop2 = defaultValue,
  ...rest
}) => {
  return <div {...rest}>{prop1}</div>;
};
```

**❌ Wrong:**
```typescript
export const Component: React.FC<IProps> = (props) => {
  const { prop1, prop2 = defaultValue, ...rest } = props;
  return <div {...rest}>{prop1}</div>;
};
```

### Default Values

Apply defaults directly in parameter destructuring:

```typescript
export const Button: React.FC<IButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...rest
}) => {
  // Use props directly
};
```

---

## ✅ Checklist

When creating React components:

- [ ] Props destructured in function parameters
- [ ] Default values applied in destructuring
- [ ] Rest props captured with `...rest`
- [ ] No props destructuring in function body

---

## 🔍 Examples

### ✅ Good: Parameter Destructuring

```typescript
export const InputSearch: React.FC<IInputSearchProps> = ({
  onInputChange = () => {},
  label = 'Search',
  placeholder,
  ...rest
}) => {
  return (
    <Input
      placeholder={placeholder || label}
      onChange={(e) => onInputChange(e.target.value)}
      {...rest}
    />
  );
};
```

### ❌ Bad: Body Destructuring

```typescript
export const InputSearch: React.FC<IInputSearchProps> = (props) => {
  const {
    onInputChange = () => {},
    label = 'Search',
    ...rest
  } = props;
  
  return <Input {...rest} />;
};
```

---

## 🚫 Common Mistakes

### Mistake 1: Body Destructuring

**Problem**: Destructuring props inside function body

**Solution**: Move destructuring to function parameters

**Why**: Cleaner, more concise, standard React pattern

### Mistake 2: Not Using Rest Props

**Problem**: Not capturing remaining props with `...rest`

**Solution**: Always include `...rest` for prop forwarding

**Why**: Enables style props and other attributes to pass through

---

## 🤖 AI Self-Check Protocol

**When creating React component:**

1. Are props destructured in parameters?
   - If NO → Move to parameters
   - If YES → Continue

2. Are default values in destructuring?
   - If NO → Add defaults in parameters
   - If YES → Continue

3. Is `...rest` captured?
   - If NO → Add `...rest`
   - If YES → Good to go
