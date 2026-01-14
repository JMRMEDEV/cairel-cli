---
meta:
  id: "visual-verification"
  title: "Visual Verification for UI Changes"
  author: "ordaiv-core"
  version: "1.0.0"
  category: "ui"
  tags: ["ui", "testing", "verification", "screenshots"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
---

# Visual Verification for UI Changes

**Purpose**: Ensure all UI claims are backed by actual visual evidence through screenshot analysis.

**Applies To**: UI/Frontend projects (React, React Native, Next.js, Vue, etc.)

---

## 🚨 Critical Rules

### 1. NEVER Make UI Claims Without Screenshots

**AI MUST take and analyze screenshots before making ANY claims about visual elements.**

**Forbidden without verification:**
- "The button is now visible"
- "The colors are correct"
- "The layout matches the design"
- "The icon appears properly"
- "The styling is applied"

**Required workflow:**
1. Make UI changes
2. Take screenshot
3. Analyze screenshot with image analysis tools
4. Report only what is actually visible
5. Fix issues if found
6. Repeat until verified

### 2. Evidence-Based Reporting Only

**All UI statements MUST reference actual screenshot analysis:**

**✅ Correct - Evidence-Based:**
```
Looking at the screenshot, I can see:
- The search icon (magnifying glass) on the right side of the input
- Colored square avatars: purple (HA), blue (AA), green (MB)
- Proper spacing between elements (16px margins visible)
```

**❌ Wrong - Assumptions:**
```
The search icon is now visible
The avatars are colored properly
The layout matches the source
```

### 3. Use Image Analysis Tools

**When screenshots are available:**

```typescript
// Take screenshot first
take_screenshot({ url: "http://localhost:3000" })

// Then analyze the image
fs_read({
  mode: "Image",
  image_paths: ["/tmp/screenshot-xyz.png"]
})

// Report based on analysis
```

---

## 📋 Standard Rules

### Screenshot Workflow

**For every UI change:**

1. **Implement changes** in code
2. **Start dev server** (if not running)
3. **Take screenshot** of the page/component
4. **Analyze screenshot** using image analysis
5. **Report findings** based on actual visual content
6. **Fix issues** if visual doesn't match expectations
7. **Repeat** until verified

### What to Verify

**Visual Elements:**
- Element presence (buttons, icons, text)
- Colors and styling
- Layout and spacing
- Responsive behavior
- Animations and transitions

**Functional Elements:**
- Interactive states (hover, active, disabled)
- Form validation feedback
- Loading states
- Error messages

### Tools for Verification

**Screenshot Tools:**
- `take_screenshot` (for web apps)
- `test_react_app` with screenshot action (for React apps)
- Browser DevTools screenshot feature

**Analysis Tools:**
- `fs_read` with Image mode
- Visual comparison tools
- Accessibility checkers

---

## ✅ Checklist

Before making ANY UI claim:

- [ ] Took screenshot of the UI
- [ ] Analyzed screenshot with image tools
- [ ] Verified element is actually visible
- [ ] Checked colors/styling match expectations
- [ ] Confirmed layout is correct
- [ ] Reported only what is visible in screenshot

After UI implementation:

- [ ] Screenshot taken and analyzed
- [ ] All claimed elements verified
- [ ] Issues documented if found
- [ ] Fixes applied if needed
- [ ] Re-verified after fixes

---

## 🔍 Examples

### ✅ Good: Evidence-Based Verification

```typescript
// 1. Take screenshot
take_screenshot({ 
  url: "http://localhost:3000/dashboard",
  fullPage: true 
})

// 2. Analyze image
fs_read({
  mode: "Image",
  image_paths: ["/tmp/screenshot-dashboard.png"]
})

// 3. Report based on analysis
"Based on the screenshot analysis:
- The dashboard header is visible with logo on the left
- Navigation menu shows 5 items: Home, Projects, Team, Settings, Logout
- Main content area displays 3 project cards in a grid layout
- Each card has a colored icon (blue, green, purple)
- Footer is visible at the bottom with copyright text"
```

### ❌ Bad: Assumptions Without Verification

```typescript
// Made changes to CSS
"The button is now blue and centered on the page"

// Problem: No screenshot taken, no verification
// Could be wrong color, wrong position, or not visible at all
```

---

## 🚫 Common Mistakes

### Mistake 1: Claiming Success Without Verification

**Problem**: Saying "it works" without checking

**Solution**: Always take screenshot and analyze

**Why**: Visual bugs are common and easy to miss

### Mistake 2: Partial Verification

**Problem**: Checking one element but claiming all are correct

**Solution**: Verify all claimed elements in screenshot

**Why**: One correct element doesn't mean all are correct

### Mistake 3: Ignoring Visual Differences

**Problem**: Seeing issues in screenshot but not reporting them

**Solution**: Report all visual discrepancies found

**Why**: Honesty about issues leads to better solutions

### Mistake 4: Not Re-verifying After Fixes

**Problem**: Fixing issues without confirming the fix worked

**Solution**: Take new screenshot after every fix

**Why**: Fixes can introduce new issues

---

## 🤖 AI Self-Check Protocol

**Before making ANY UI claim:**

1. Have I taken a screenshot?
   - If NO → Take screenshot now
   - If YES → Continue

2. Have I analyzed the screenshot?
   - If NO → Analyze with image tools
   - If YES → Continue

3. Does the screenshot show what I'm claiming?
   - If NO → Report actual state, fix issues
   - If YES → Report with evidence

4. Am I referencing specific visual elements?
   - If NO → Add specific details from screenshot
   - If YES → Proceed with report

**Verification Workflow:**

```
Make UI Changes
        ↓
Take Screenshot
        ↓
Analyze Image
        ↓
Visual Matches Expected? ──NO──→ Fix Issues ──→ Take New Screenshot
        ↓ YES                                            ↓
        ↓ ←──────────────────────────────────────────────
        ↓
Report with Evidence
```

---

## 📊 Success Criteria

**Verified UI:**
- All claims backed by screenshots
- Specific visual elements referenced
- Colors and styling confirmed
- Layout verified
- No assumptions made

**Quality Assurance:**
- Visual bugs caught early
- Accurate reporting
- User expectations met
- Professional results
