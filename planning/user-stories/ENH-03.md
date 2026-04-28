# ENH-03: Smart merge for update command

## Metadata

| Field | Value |
|-------|-------|
| ID | ENH-03 |
| Priority | P2 |
| Scope | Post-MVP |
| Domain | enhancements |
| Subprojects | cli |

## Story

As a developer who has customized generated skills, I want the update command to intelligently merge changes so that my customizations are preserved.

## Acceptance Criteria

1. Detect user modifications in generated skills
2. Show diff between current and new version
3. Offer merge options: keep mine, take theirs, manual merge
4. Never silently overwrite user changes

## Related

- CMD-02: cairel update
