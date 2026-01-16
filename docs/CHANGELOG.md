# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-16

### Added
- Initial release of Cairel CLI
- Interactive wizard with 3 modes (Quick, Detailed, Custom)
- 22 curated project-agnostic rules across 7 categories
- Support for kiro-cli and Amazon Q Developer
- MCP server auto-detection and configuration
- Commands: init, bootstrap, update, validate, list
- Review step before file generation
- Comprehensive test coverage (74 tests)
- Complete documentation (architecture, testing, contributing)

### Categories
- General (7 rules)
- TypeScript (4 rules)
- Git (1 rule)
- UI (6 rules)
- Backend (1 rule)
- Lua (1 rule)
- Testing (2 rules)

### Features
- Data-driven rule selection from frontmatter
- Automatic manifest generation on build
- Timestamped backups for updates
- Individual file validation support
- Custom rule selection with category grouping

[1.0.0]: https://github.com/JMRMEDEV/cairel-cli/releases/tag/v1.0.0
