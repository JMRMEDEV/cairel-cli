# ENH-02: Configuration profiles (save/reuse)

## Metadata

| Field | Value |
|-------|-------|
| ID | ENH-02 |
| Priority | P2 |
| Scope | Post-MVP |
| Domain | enhancements |
| Subprojects | cli |

## Story

As a developer who works on similar projects, I want to save and reuse wizard configurations so that I don't repeat the same answers.

## Acceptance Criteria

1. Save wizard answers as a named profile
2. `cairel init --profile <name>` applies a saved profile
3. Profiles stored in `~/.config/cairel/profiles/`
4. List and delete profiles

## Related

- WIZ-01: Quick setup wizard
