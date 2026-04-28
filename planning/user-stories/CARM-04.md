# CARM-04: Dependency resolution for rule packages

## Metadata

| Field | Value |
|-------|-------|
| ID | CARM-04 |
| Priority | P3 |
| Scope | Post-MVP |
| Domain | carm |
| Subprojects | cli |

## Story

As a developer, I want rule packages to declare and resolve dependencies so that installing a bundle automatically pulls in required packages.

## Acceptance Criteria

1. Packages declare dependencies in their manifest
2. `carm install` resolves dependency tree
3. Version conflicts are detected and reported
4. Compatibility checking across AI tool versions

## Related

- CARM-01: Package registry
- CARM-02: Install/update packages
