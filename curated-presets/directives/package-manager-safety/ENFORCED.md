# Package Manager Safety — Enforced Rules

1. NEVER use --force flag on any package manager command without explicit user permission
2. MUST detect and use the project's package manager (check lock files: yarn.lock, pnpm-lock.yaml, package-lock.json)
3. NEVER mix package managers in the same project
4. MUST run tests in non-interactive mode (--watchAll=false)
5. MUST explain risks before using --force and wait for confirmation
6. NEVER modify or delete lock files without explicit permission
