# Git Commit Rules

- Commit messages: **subject line ONLY, NO body, NO exceptions** unless user explicitly requests one
- Follow Conventional Commits: `type(scope): description`
- Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Subject line ≤ 50 characters total
- Imperative mood ("add" not "added")
- Breaking changes: add `!` after type/scope
- Show files + proposed message to user before committing, wait for approval
- NEVER push without explicit user request
- NEVER force push without explaining consequences and getting confirmation
- Pull base branch before creating any new branch
