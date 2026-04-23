---
name: mock-data-strategy
description: Use realistic mock data in frontend development with clear separation from production data. Use when backend is unavailable, prototyping UI, or developing features before API is ready. Covers mock data organization and migration path.
metadata:
  cairel-title: "Mock Data Strategy for Frontend Development"
  cairel-category: ui
  cairel-version: "1.0.0"
  cairel-tags:
    - mock-data
    - frontend
    - testing
    - development
  cairel-conditions:
    project-types:
      - ui
      - fullstack
---

# Mock Data Strategy for Frontend Development

**Purpose**: Use mock data for frontend development when backend is not available.

**Applies To**: UI/Frontend projects

---

## 🚨 Critical Rules

### Use Mock Data When Backend Unavailable

- ✅ ALWAYS use mock data when backend not implemented
- ✅ Focus on frontend functionality
- ❌ NEVER attempt to implement backend unless explicitly requested

---

## 📋 Standard Rules

### Implementation Pattern

```typescript
// data/mockUsers.ts
export const mockUsers: IUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
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
├── data/           # Mock data files
│   ├── mockUsers.ts
│   └── index.ts
└── services/       # Uses mock data with Promise pattern
    └── users.ts
```

---

## ✅ Checklist

- [ ] Mock data matches expected API format
- [ ] TypeScript interfaces defined
- [ ] TODO comments for future API integration
- [ ] Mock files organized in data/ directory
- [ ] Services use Promise pattern
