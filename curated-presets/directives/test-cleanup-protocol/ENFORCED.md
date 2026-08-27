# Test Cleanup Protocol — Enforced Rules

1. MUST remove all temporary test files before completing any task
2. MUST revert any test-specific path or import modifications
3. NEVER commit temporary test files (test_*, validate_*, check_*)
4. MUST verify `git status` shows no test artifacts before commit
5. MUST restore production import paths after testing
6. ALWAYS name temporary test files with test_, validate_, or check_ prefix
