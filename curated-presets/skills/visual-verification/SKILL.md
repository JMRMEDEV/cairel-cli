---
name: visual-verification
description: Verify UI changes through screenshot analysis and evidence-based validation. Use when making any visual changes to components, pages, or layouts. Mandates taking screenshots before claiming UI correctness. Covers test IDs and element inspection.
metadata:
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - ui
    - testing
    - verification
    - screenshots
  cairel-conditions:
    project-types:
      - ui
      - fullstack
---

# Visual Verification for UI Changes

**Purpose**: Ensure all UI claims are backed by actual visual evidence through screenshot analysis.

**Applies To**: UI/Frontend projects

---

## 🚨 Critical Rules

### 1. NEVER Make UI Claims Without Screenshots

**Forbidden without verification:**
- "The button is now visible"
- "The colors are correct"
- "The layout matches the design"

**Required workflow:**
1. Make UI changes
2. Take screenshot
3. Analyze screenshot with image analysis tools
4. Report only what is actually visible
5. Fix issues if found
6. Repeat until verified

### 2. Evidence-Based Reporting Only

```
✅ "Looking at the screenshot, I can see the search icon on the right side of the input"
❌ "The search icon is now visible" (no screenshot taken)
```

---

## 📋 Standard Rules

### Test ID Strategy

```typescript
interface IButtonProps extends ButtonProps {
  dataTestId?: string;
}

export const Button: React.FC<IButtonProps> = ({
  dataTestId = 'button',
  ...rest
}) => {
  return <ChakraButton data-testid={dataTestId} {...rest} />;
};
```

### Element Inspection

```bash
# By test ID (recommended)
inspect_element --selector '[data-testid="landing-section"]' --url http://localhost:3000

# By CSS class (fallback)
inspect_element --selector '.chakra-stack' --url http://localhost:3000
```

---

## ✅ Checklist

- [ ] Took screenshot of the UI
- [ ] Analyzed screenshot with image tools
- [ ] Verified element is actually visible
- [ ] Checked colors/styling match expectations
- [ ] Reported only what is visible in screenshot
- [ ] Re-verified after fixes
