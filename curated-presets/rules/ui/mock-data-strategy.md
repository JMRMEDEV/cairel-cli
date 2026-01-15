---
meta:
  id: "mock-data-strategy"
  title: "Mock Data Strategy for Frontend Development"
  author: "cairel-core"
  version: "1.0.0"
  category: "ui"
  tags: ["mock-data", "frontend", "testing", "development"]
  ai-tools: ["kiro-cli", "amazon-q-developer"]
  last-updated: "2026-01-14"
  conditions:
    project-types:
      - ui
      - fullstack
---

# Mock Data Strategy for Frontend Development

**Purpose**: Use mock data for frontend development when backend is not available.

**Applies To**: UI/Frontend projects

---

## 🚨 Critical Rules

### 1. Use Mock Data When Backend Unavailable

**When backend services are not implemented and task doesn't request backend:**

- ✅ ALWAYS use mock data
- ✅ Create mock data if none exists
- ✅ Focus on frontend functionality
- ✅ Document mock data usage

**NEVER attempt to implement backend unless explicitly requested.**

---

## 📋 Standard Rules

### When to Use Mock Data

**✅ Use mock data when:**
- Backend API endpoints not available
- Database connections not configured
- Authentication services are placeholders
- Task focuses on UI/UX development
- Prototyping and proof-of-concept
- Developing features before backend ready

**❌ Implement backend when:**
- Task explicitly requests backend
- User specifically asks for API integration
- Backend implementation is primary requirement

### Mock Data Guidelines

**Data Structure:**
- Match expected API response format
- Include realistic data types and values
- Provide variety for testing edge cases
- Use TypeScript interfaces for type safety

**Implementation Pattern:**
```typescript
// data/mockUsers.ts
export const mockUsers: IUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user'
  }
];

// services/users.ts
export const getUsers = async (): Promise<IUser[]> => {
  // TODO: Replace with actual API call when backend ready
  return Promise.resolve(mockUsers);
};
```

### File Organization

```
src/
├── data/
│   ├── mockUsers.ts
│   ├── mockProducts.ts
│   └── index.ts
└── services/
    ├── users.ts      # Uses mock data
    └── products.ts   # Uses mock data
```

---

## ✅ Checklist

When using mock data:

- [ ] Mock data matches expected API format
- [ ] TypeScript interfaces defined
- [ ] Realistic and varied data
- [ ] TODO comments for future API integration
- [ ] Mock files organized in data/ directory
- [ ] Services use mock data with Promise pattern

---

## 🔍 Examples

### ✅ Good: Mock Data Implementation

```typescript
// data/mockContractors.ts
export const mockContractors: IContractor[] = [
  {
    id: '1',
    name: 'ABC Construction',
    email: 'contact@abc.com',
    phone: '+1234567890',
    rating: 4.5,
    projects: 23
  },
  {
    id: '2',
    name: 'XYZ Builders',
    email: 'info@xyz.com',
    phone: '+0987654321',
    rating: 4.8,
    projects: 45
  }
];

// services/contractors.ts
export const getContractors = async (): Promise<IContractor[]> => {
  // TODO: Replace with actual API when backend ready
  // return fetch('/api/contractors').then(r => r.json());
  return Promise.resolve(mockContractors);
};

export const getContractorById = async (id: string): Promise<IContractor | null> => {
  // TODO: Replace with actual API
  const contractor = mockContractors.find(c => c.id === id);
  return Promise.resolve(contractor || null);
};
```

### ❌ Bad: Attempting Backend Implementation

```typescript
// WRONG - implementing backend when not requested
import express from 'express';
const app = express();

app.get('/api/contractors', (req, res) => {
  // Don't implement backend unless explicitly requested
});
```

---

## 🚫 Common Mistakes

### Mistake 1: Implementing Backend Unnecessarily

**Problem**: Creating API endpoints when task is frontend-focused

**Solution**: Use mock data, document for future backend

### Mistake 2: Hardcoded Data in Components

**Problem**: Mock data directly in component files

**Solution**: Centralize mock data in data/ directory

### Mistake 3: No Migration Path

**Problem**: Mock data without TODO comments

**Solution**: Always add TODO for future API integration

---

## 🤖 AI Self-Check Protocol

**Before implementing data fetching:**

1. Is backend available?
   - If NO → Use mock data
   - If YES → Use actual API

2. Does task request backend implementation?
   - If NO → Use mock data
   - If YES → Implement backend

3. Is mock data organized properly?
   - data/ directory → YES
   - TypeScript interfaces → YES
   - TODO comments → YES

4. Does mock data match API format?
   - If NO → Update structure
   - If YES → Proceed
