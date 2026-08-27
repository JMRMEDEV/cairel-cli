# DIR-02: Add enforcement level to directive manifest

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-02 |
| Priority | P0 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a cairel maintainer, I want each directive in the manifest to declare a default enforcement level (`enforced`, `contextual`, or `available`) so that the generator knows where to place it per platform.

## Acceptance Criteria

1. Manifest schema gains `enforcement` field: `"enforced" | "contextual" | "available"`
2. Each of the 24 directives is classified with a default enforcement level
3. Directives with MUST/NEVER hard rules default to `enforced` (e.g., git-management, conventional-commits, implementation-approval, package-manager-safety)
4. Guidance-only directives default to `contextual` (e.g., mock-data-strategy, component-structure, visual-verification)
5. Niche/optional directives default to `available` (e.g., chakra-ui-v3-integration, gluestack-ui-v1-themed)
6. Validation rejects directives without an enforcement level

## Related

- ADR-008: Hybrid Directives Model
- DIR-01: Rename skills to directives
