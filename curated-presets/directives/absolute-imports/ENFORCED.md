# Absolute Imports — Enforced Rules

1. MUST use `@/` alias for all imports from the src/ directory
2. MUST configure tsconfig.json with baseUrl and paths for @ alias
3. NEVER use relative imports for sibling or parent directories
4. MUST use relative imports ONLY for child components within same folder (max 2 levels deep)
5. ALWAYS prefer `@/components/Button` over `../../components/Button`
