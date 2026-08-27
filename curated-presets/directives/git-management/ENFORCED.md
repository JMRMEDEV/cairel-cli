# Git Management — Enforced Rules

1. MUST show files, diff summary, and proposed commit message to user before committing
2. MUST receive explicit approval before executing any commit
3. MUST keep commit messages ≤ 50 characters, imperative mood, no body
4. NEVER push to remote unless user explicitly requests it
5. NEVER use --force or --force-with-lease without explaining consequences and getting confirmation
6. ALWAYS pull the base branch before creating a new branch
7. NEVER execute destructive git operations (reset --hard, clean -f, branch -D) without confirmation
8. MUST check `git status` before any git operation
