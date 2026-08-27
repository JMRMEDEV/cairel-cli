# TypeScript Validation — Enforced Rules

1. MUST run `npx tsc --noEmit` after every .ts/.tsx file change
2. MUST fix ALL TypeScript errors before proceeding to next task
3. NEVER accumulate TypeScript errors across multiple files
4. MUST stop adding new code when compilation errors exist
5. MUST re-run validation after fixing errors to confirm clean compilation
6. MUST validate after creating main component before creating subcomponents
