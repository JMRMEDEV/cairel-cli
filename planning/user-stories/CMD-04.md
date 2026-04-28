# CMD-04: cairel list — list available skills

## Metadata

| Field | Value |
|-------|-------|
| ID | CMD-04 |
| Priority | P1 |
| Scope | Done |
| Domain | commands |
| Subprojects | cli |

## Story

As a developer, I want to list all available skills so that I can see what cairel offers before running init.

## Acceptance Criteria

1. `cairel list` shows all skills grouped by category
2. `cairel list --skills` shows skills only
3. `cairel list --agents` shows agents only
4. `cairel list --category <name>` filters by category
5. Shows skill descriptions and conditions

## Related

- SKL-01: 23 curated Agent Skills
