---
name: chakra-ui-v3-integration
description: Integrate Chakra UI v3 components using MCP tools for accurate component reference. Use when implementing any Chakra UI component. Mandates checking component props and examples via MCP before implementation.
metadata:
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - chakra-ui
    - mcp
    - ui-library
    - components
  cairel-conditions:
    ui-library:
      - chakra-ui
---

# Chakra UI v3 Integration with MCP Tools

**Purpose**: Ensure correct Chakra UI v3 usage by always consulting MCP tools before implementation.

**Applies To**: Projects using Chakra UI v3

---

## 🚨 Critical Rules

### 1. MANDATORY MCP Tools Usage

**ALWAYS use Chakra UI MCP server tools BEFORE implementing ANY Chakra UI component.**

### 2. Check Component API First

1. Use `get_component_props` to check current API
2. Use `get_component_example` to see usage patterns
3. Implement based on current v3 patterns

---

## 📋 Standard Rules

```typescript
// 1. Check component props
get_component_props(component: "avatar")

// 2. Get usage examples
get_component_example(component: "avatar")

// 3. Implement based on v3 API (compound components)
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
  </Dialog.Content>
</Dialog.Root>
```

---

## ✅ Checklist

- [ ] Used `get_component_props` to check API
- [ ] Used `get_component_example` for patterns
- [ ] Verified v3 compound component structure
- [ ] Checked for breaking changes from v2
