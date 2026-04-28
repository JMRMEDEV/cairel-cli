# CMD-02: cairel update — update existing config

## Metadata

| Field | Value |
|-------|-------|
| ID | CMD-02 |
| Priority | P1 |
| Scope | Done |
| Domain | commands |
| Subprojects | cli |

## Story

As a developer, I want to update my existing AI configuration so that I can add new skills or remove outdated ones without starting over.

## Acceptance Criteria

1. Detects existing configuration (.kiro/, .amazonq/, etc.)
2. Creates timestamped backups before changes
3. Selective update: skills only, agents only, or both
4. Preserves custom skills not managed by cairel
5. Shows summary of changes (added, updated, removed)

## Related

- GEN-01 through GEN-07: Generation stories
