# DIR-01: Rename skills to directives in manifest and curated content

## Metadata

| Field | Value |
|-------|-------|
| ID | DIR-01 |
| Priority | P0 |
| Scope | MVP |
| Domain | directives |
| Subprojects | cli |

## Story

As a cairel maintainer, I want the curated content to be named "directives" (not "skills" or "rules") so that the terminology is platform-agnostic and reflects that the content can be deployed at any enforcement level.

## Acceptance Criteria

1. `curated-presets/skills/` renamed to `curated-presets/directives/`
2. `rules-manifest.json` renamed to `directives-manifest.json`
3. Each directive's frontmatter uses `name` field (no changes needed — already present)
4. Manifest schema updated: `rules[]` → `directives[]`
5. Internal references updated (generator, rules-selector, wizard, list, update, validate)
6. All existing tests updated and passing
7. CLI user-facing text says "directives" where it previously said "skills" or "rules"
8. README updated to reflect the directives terminology

## Related

- ADR-008: Hybrid Directives Model
