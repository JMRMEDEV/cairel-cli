# Story Index

Machine-readable index for story lookups.

Format: `ID | Priority | Scope | Title | Domain | Subprojects`

Subproject key: `cli` = cairel npm package, `mcp` = cairel-planning MCP server

## Lookup by ID

```
WIZ-01   | P0 | Done     | Quick setup wizard (6 questions)                       | wizard     | cli
WIZ-02   | P0 | Done     | Detailed setup wizard (12 questions)                   | wizard     | cli
WIZ-03   | P0 | Done     | Custom mode (select specific skills)                   | wizard     | cli
WIZ-04   | P1 | Done     | Review step before file generation                     | wizard     | cli
WIZ-05   | P1 | Done     | MCP server auto-detection                              | wizard     | cli
WIZ-06   | P1 | Done     | Getting started menu (no args)                          | wizard     | cli
GEN-01   | P0 | Done     | Generate Agent Skills for Kiro                          | generation | cli
GEN-02   | P0 | Done     | Generate Agent Skills for Claude Code                   | generation | cli
GEN-03   | P0 | Done     | Generate Agent Skills for GitHub Copilot                | generation | cli
GEN-04   | P0 | Done     | Generate flat rules for Amazon Q (legacy)               | generation | cli
GEN-05   | P0 | Done     | Generate agent JSON from Handlebars template            | generation | cli
GEN-06   | P0 | Done     | Data-driven skill selection from manifest               | generation | cli
GEN-07   | P1 | Done     | Multi-platform simultaneous output                      | generation | cli
VAL-01   | P0 | Done     | Validate skill frontmatter (Zod)                        | validation | cli
VAL-02   | P0 | Done     | Validate agent JSON (AJV)                               | validation | cli
VAL-03   | P1 | Done     | Validate individual files                               | validation | cli
VAL-04   | P1 | Done     | Auto-detect skill directories for validation            | validation | cli
CMD-01   | P0 | Done     | cairel init — initialize project                        | commands   | cli
CMD-02   | P1 | Done     | cairel update — update existing config                  | commands   | cli
CMD-03   | P1 | Done     | cairel validate — validate files                        | commands   | cli
CMD-04   | P1 | Done     | cairel list — list available skills                     | commands   | cli
CMD-05   | P2 | Done     | cairel bootstrap — show .ai/ path for kiro-cli          | commands   | cli
SKL-01   | P0 | Done     | 23 curated Agent Skills across 8 categories             | skills     | cli
SKL-02   | P0 | Done     | Skills follow agentskills.io standard                   | skills     | cli
SKL-03   | P0 | Done     | Cairel metadata in skill frontmatter                    | skills     | cli
SKL-04   | P1 | MVP      | Add new skill categories and skills                     | skills     | cli
PLAN-01  | P0 | MVP      | Planner agent with architecture focus                   | planning   | mcp
PLAN-02  | P0 | MVP      | Dev agent with implementation focus                     | planning   | mcp
PLAN-03  | P0 | MVP      | MCP server for planning knowledge base                  | planning   | mcp
PLAN-04  | P0 | MVP      | User stories with domain grouping                       | planning   | mcp
PLAN-05  | P0 | MVP      | Task tracking with story traceability                   | planning   | mcp
CARM-01  | P3 | Post-MVP | Package registry for AI rules                           | carm       | cli
CARM-02  | P3 | Post-MVP | Install/update rule packages                            | carm       | cli
CARM-03  | P3 | Post-MVP | Publish community rules                                 | carm       | cli
CARM-04  | P3 | Post-MVP | Dependency resolution for rule packages                  | carm       | cli
ENH-01   | P3 | Post-MVP | Plugin system for third-party extensions                 | enhancements | cli
ENH-02   | P2 | Post-MVP | Configuration profiles (save/reuse)                     | enhancements | cli
ENH-03   | P2 | Post-MVP | Smart merge for update command                          | enhancements | cli
ENH-04   | P2 | Post-MVP | Dry-run mode for init/update                            | enhancements | cli
ENH-05   | P3 | Post-MVP | YAML config support                                    | enhancements | cli
```

## Counts

| Filter | Count |
|--------|-------|
| Total | 37 |
| Done | 22 |
| MVP | 5 |
| Post-MVP | 10 |
| P0 | 19 |
| P1 | 9 |
| P2 | 4 |
| P3 | 8 |

### By Domain
| Domain | Count |
|--------|-------|
| wizard | 6 |
| generation | 7 |
| validation | 4 |
| commands | 5 |
| skills | 4 |
| planning | 5 |
| carm | 4 |
| enhancements | 5 |

### By Subproject (stories touching each)
| Subproject | Total | Done | MVP |
|------------|-------|------|-----|
| cli | 32 | 22 | 1 |
| mcp | 5 | 0 | 5 |
