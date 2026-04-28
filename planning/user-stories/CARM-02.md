# CARM-02: Install/update rule packages

## Metadata

| Field | Value |
|-------|-------|
| ID | CARM-02 |
| Priority | P3 |
| Scope | Post-MVP |
| Domain | carm |
| Subprojects | cli |

## Story

As a developer, I want to install and update rule packages from the registry so that I can keep my AI configuration current.

## Acceptance Criteria

1. `carm install @cairel/typescript-rules` installs a package
2. `carm update` updates all installed packages
3. Supports version pinning and ranges
4. Resolves dependencies between packages

## Related

- CARM-01: Package registry
- CARM-04: Dependency resolution
