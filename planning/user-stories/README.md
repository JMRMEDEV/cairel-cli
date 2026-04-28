# User Stories — cairel-cli

> Machine-readable index: [INDEX.md](./INDEX.md) — for lookups by ID, domain, priority, scope, or subproject.

## Status Legend
- 🟢 **Done** — Implemented and shipped
- 🔴 **MVP** — Required for next release
- 🟡 **Post-MVP** — Planned for future iterations

## Priority Legend
- **P0** — Critical
- **P1** — Important
- **P2** — Nice to have
- **P3** — Future

## Subproject Key
- `cli` — cairel npm package (TypeScript)
- `mcp` — cairel-planning MCP server (JS)

## Story Index

### Wizard
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| WIZ-01 | Quick setup wizard (6 questions) | P0 | 🟢 Done | `cli` |
| WIZ-02 | Detailed setup wizard (12 questions) | P0 | 🟢 Done | `cli` |
| WIZ-03 | Custom mode (select specific skills) | P0 | 🟢 Done | `cli` |
| WIZ-04 | Review step before file generation | P1 | 🟢 Done | `cli` |
| WIZ-05 | MCP server auto-detection | P1 | 🟢 Done | `cli` |
| WIZ-06 | Getting started menu (no args) | P1 | 🟢 Done | `cli` |

### Generation
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| GEN-01 | Generate Agent Skills for Kiro | P0 | 🟢 Done | `cli` |
| GEN-02 | Generate Agent Skills for Claude Code | P0 | 🟢 Done | `cli` |
| GEN-03 | Generate Agent Skills for GitHub Copilot | P0 | 🟢 Done | `cli` |
| GEN-04 | Generate flat rules for Amazon Q (legacy) | P0 | 🟢 Done | `cli` |
| GEN-05 | Generate agent JSON from Handlebars template | P0 | 🟢 Done | `cli` |
| GEN-06 | Data-driven skill selection from manifest | P0 | 🟢 Done | `cli` |
| GEN-07 | Multi-platform simultaneous output | P1 | 🟢 Done | `cli` |

### Validation
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| VAL-01 | Validate skill frontmatter (Zod) | P0 | 🟢 Done | `cli` |
| VAL-02 | Validate agent JSON (AJV) | P0 | 🟢 Done | `cli` |
| VAL-03 | Validate individual files | P1 | 🟢 Done | `cli` |
| VAL-04 | Auto-detect skill directories for validation | P1 | 🟢 Done | `cli` |

### Commands
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| CMD-01 | cairel init — initialize project | P0 | 🟢 Done | `cli` |
| CMD-02 | cairel update — update existing config | P1 | 🟢 Done | `cli` |
| CMD-03 | cairel validate — validate files | P1 | 🟢 Done | `cli` |
| CMD-04 | cairel list — list available skills | P1 | 🟢 Done | `cli` |
| CMD-05 | cairel bootstrap — show .ai/ path for kiro-cli | P2 | 🟢 Done | `cli` |

### Skills
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| SKL-01 | 23 curated Agent Skills across 8 categories | P0 | 🟢 Done | `cli` |
| SKL-02 | Skills follow agentskills.io standard | P0 | 🟢 Done | `cli` |
| SKL-03 | Cairel metadata in skill frontmatter | P0 | 🟢 Done | `cli` |
| SKL-04 | Add new skill categories and skills | P1 | 🔴 MVP | `cli` |

### Constraints
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| CON-01 | Author constraint companions for curated skills | P1 | 🔴 MVP | `cli` |
| CON-02 | Generate always-loaded constraints for Kiro | P1 | 🔴 MVP | `cli` |
| CON-03 | Generate always-loaded constraints for Claude Code | P1 | 🔴 MVP | `cli` |
| CON-04 | Generate always-loaded constraints for GitHub Copilot | P1 | 🔴 MVP | `cli` |
| CON-05 | Generate always-loaded constraints for Cursor | P1 | 🔴 MVP | `cli` |
| CON-06 | Generate constraints for Amazon Q | P2 | 🔴 MVP | `cli` |
| CON-07 | Add Cursor as a supported platform | P1 | 🔴 MVP | `cli` |
| CON-08 | Validate constraint files | P2 | 🔴 MVP | `cli` |

### Planning Workflow
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| PLAN-01 | Planner agent with architecture focus | P0 | 🔴 MVP | `mcp` |
| PLAN-02 | Dev agent with implementation focus | P0 | 🔴 MVP | `mcp` |
| PLAN-03 | MCP server for planning knowledge base | P0 | 🔴 MVP | `mcp` |
| PLAN-04 | User stories with domain grouping | P0 | 🔴 MVP | `mcp` |
| PLAN-05 | Task tracking with story traceability | P0 | 🔴 MVP | `mcp` |

### Future — carm
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| CARM-01 | Package registry for AI rules | P3 | 🟡 Post-MVP | `cli` |
| CARM-02 | Install/update rule packages | P3 | 🟡 Post-MVP | `cli` |
| CARM-03 | Publish community rules | P3 | 🟡 Post-MVP | `cli` |
| CARM-04 | Dependency resolution for rule packages | P3 | 🟡 Post-MVP | `cli` |

### Future — Enhancements
| ID | Story | Priority | Scope | Subprojects |
|----|-------|----------|-------|-------------|
| ENH-01 | Plugin system for third-party extensions | P3 | 🟡 Post-MVP | `cli` |
| ENH-02 | Configuration profiles (save/reuse) | P2 | 🟡 Post-MVP | `cli` |
| ENH-03 | Smart merge for update command | P2 | 🟡 Post-MVP | `cli` |
| ENH-04 | Dry-run mode for init/update | P2 | 🟡 Post-MVP | `cli` |
| ENH-05 | YAML config support | P3 | 🟡 Post-MVP | `cli` |

---

**Total Stories**: 45
- 🟢 Done: 22
- 🔴 MVP: 13
- 🟡 Post-MVP: 10

**By Domain**:
| Domain | Count |
|--------|-------|
| wizard | 6 |
| generation | 8 |
| validation | 5 |
| commands | 5 |
| skills | 4 |
| constraints | 7 |
| planning | 5 |
| carm | 4 |
| enhancements | 5 |

**Last Updated**: April 28, 2026
