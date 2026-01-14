---
meta:
  id: "chakra-ui-v3-integration"
  title: "Chakra UI v3 Integration with MCP Tools"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "ui"
  tags: ["chakra-ui", "mcp", "ui-library", "components"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# Chakra UI v3 Integration with MCP Tools

**Purpose**: Ensure correct Chakra UI v3 usage by always consulting MCP tools before implementation.

**Applies To**: Projects using Chakra UI v3

---

## 🚨 Critical Rules

### 1. MANDATORY MCP Tools Usage

**ALWAYS use Chakra UI MCP server tools BEFORE implementing ANY Chakra UI component.**

This is MANDATORY, not optional.

### 2. Check Component API First

**Before using any Chakra component:**
1. Use `get_component_props` to check current API
2. Use `get_component_example` to see usage patterns
3. Implement based on current v3 patterns

---

## 📋 Standard Rules

### MCP Tools Workflow

```typescript
// 1. Check component props
get_component_props(component: "avatar")

// 2. Get usage examples
get_component_example(component: "avatar")

// 3. Implement based on v3 API
import { Avatar } from '@chakra-ui/react';

<Avatar.Root>
  <Avatar.Image src="..." />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

### When to Use MCP Tools

**EVERY TIME you:**
- Implement new Chakra UI component
- Modify existing Chakra UI component
- Troubleshoot component rendering
- Migrate from v2 to v3
- Update component props

---

## ✅ Checklist

Before implementing ANY Chakra component:

- [ ] Used `get_component_props` to check API
- [ ] Used `get_component_example` for patterns
- [ ] Verified v3 compound component structure
- [ ] Checked for breaking changes from v2

---

## 🔍 Examples

### ✅ Good: MCP Tools First

```typescript
// 1. Check API
get_component_props(component: "dialog")

// 2. Get examples
get_component_example(component: "dialog")

// 3. Implement correctly
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
  </Dialog.Content>
</Dialog.Root>
```

### ❌ Bad: No MCP Tools

```typescript
// Implementing without checking API
<Modal>  // Wrong - v2 API
  <ModalContent>
    ...
  </ModalContent>
</Modal>
```

---

## 🚫 Common Mistakes

### Mistake 1: Using v2 API

**Problem**: Using old Modal instead of Dialog

**Solution**: Check MCP tools for v3 API

### Mistake 2: Wrong Props

**Problem**: Using deprecated props

**Solution**: Use `get_component_props` first

### Mistake 3: No Compound Components

**Problem**: Not using .Root, .Content pattern

**Solution**: Check `get_component_example`
