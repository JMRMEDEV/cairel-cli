# carm - AI Rule Manager (Future Vision)

**Status**: Conceptual - Post v1.0  
**Inspiration**: npm, but for AI development rules and agents

---

## Problem Statement

As AI-driven development matures, developers will need:
- Shareable, versioned rules and agents
- Community-contributed best practices
- Dependency management for rule sets
- Update notifications for improved rules
- Cross-tool compatibility

**Current State**: Manual copy/paste or cairel init (one-time setup)  
**Future State**: Dynamic rule ecosystem with package management

---

## Vision

### carm (Cairel Rule Manager)

A package manager for AI development rules, agents, and configurations that enables:
- **Discovery**: Search and browse community rules
- **Installation**: Install rule packages with dependencies
- **Versioning**: Semantic versioning for rules
- **Updates**: Keep rules current with latest best practices
- **Publishing**: Share your rules with the community
- **Compatibility**: Cross-tool support (kiro-cli, Amazon Q, etc.)

---

## Architecture

### Registry

**Central Registry** (similar to npm registry):
```
https://registry.cairel.dev/
```

**Package Structure**:
```json
{
  "name": "@cairel/typescript-rules",
  "version": "2.1.0",
  "description": "TypeScript development rules",
  "author": "cairel-core",
  "license": "MIT",
  "keywords": ["typescript", "validation", "best-practices"],
  "ai-tools": ["kiro-cli", "amazon-q-developer"],
  "dependencies": {
    "@cairel/git-rules": "^1.0.0",
    "@cairel/context-rules": "^1.2.0"
  },
  "files": [
    "rules/typescript-validation.md",
    "rules/component-structure.md"
  ],
  "repository": "https://github.com/cairel/typescript-rules"
}
```

### Package Types

**1. Rule Packages**
```
@cairel/typescript-rules
@cairel/react-native-rules
@community/nextjs-best-practices
```

**2. Agent Packages**
```
@cairel/general-dev-agent
@cairel/ui-specialist-agent
@community/backend-expert-agent
```

**3. Bundle Packages**
```
@cairel/fullstack-bundle
@cairel/mobile-dev-bundle
@community/enterprise-bundle
```

**4. MCP Server Packages**
```
@cairel/mcp-amazon-q-history
@cairel/mcp-web-scraper
@community/mcp-custom-tool
```

---

## Commands

### Installation

```bash
# Install rule package
carm install @cairel/typescript-rules

# Install specific version
carm install @cairel/typescript-rules@2.1.0

# Install with dependencies
carm install @cairel/fullstack-bundle

# Install globally (user-wide)
carm install -g @cairel/general-dev-agent

# Install from GitHub
carm install github:username/custom-rules
```

### Search & Discovery

```bash
# Search for packages
carm search "react native"

# Show package info
carm info @cairel/typescript-rules

# List installed packages
carm list

# List outdated packages
carm outdated
```

### Updates

```bash
# Update all packages
carm update

# Update specific package
carm update @cairel/typescript-rules

# Update to latest major version
carm update @cairel/typescript-rules@latest
```

### Publishing

```bash
# Login to registry
carm login

# Publish package
carm publish

# Unpublish package
carm unpublish @username/package-name

# Deprecate version
carm deprecate @username/package-name@1.0.0 "Use 2.0.0 instead"
```

### Configuration

```bash
# Initialize carm.json
carm init

# Set registry
carm config set registry https://custom-registry.com

# Set auth token
carm config set token <token>
```

---

## Configuration File

### carm.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "ai-tools": ["kiro-cli"],
  "dependencies": {
    "@cairel/typescript-rules": "^2.1.0",
    "@cairel/git-rules": "^1.0.0",
    "@cairel/ui-verification": "^1.5.0",
    "@community/custom-rules": "^0.3.0"
  },
  "devDependencies": {
    "@cairel/testing-rules": "^1.2.0"
  },
  "agents": {
    "general-dev": "@cairel/general-dev-agent@^1.0.0",
    "ui-specialist": "@cairel/ui-specialist-agent@^2.0.0"
  },
  "mcpServers": {
    "amazon-q-history": "@cairel/mcp-amazon-q-history@^1.0.0",
    "web-scraper": "@cairel/mcp-web-scraper@^2.1.0"
  },
  "config": {
    "rulesPath": ".kiro/steering",
    "agentsPath": ".kiro/agents",
    "mcpPath": ".kiro/settings"
  }
}
```

---

## Package Structure

### Rule Package

```
@cairel/typescript-rules/
├── package.json
├── README.md
├── LICENSE
├── rules/
│   ├── typescript-validation.md
│   ├── component-structure.md
│   └── type-safety.md
├── templates/
│   └── typescript-config.hbs
└── schemas/
    └── rule-schema.json
```

### Agent Package

```
@cairel/ui-specialist-agent/
├── package.json
├── README.md
├── LICENSE
├── agents/
│   └── ui-specialist.json
├── templates/
│   └── agent-template.hbs
└── dependencies.json
```

### Bundle Package

```
@cairel/fullstack-bundle/
├── package.json
├── README.md
├── LICENSE
└── dependencies.json  # Lists all included packages
```

---

## Versioning Strategy

### Semantic Versioning

**Rules**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (rule format changes, removed rules)
- **MINOR**: New rules, enhancements (backward compatible)
- **PATCH**: Bug fixes, typos, clarifications

**Agents**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (config format, tool changes)
- **MINOR**: New features, MCP servers (backward compatible)
- **PATCH**: Bug fixes, config tweaks

### Compatibility Matrix

```json
{
  "@cairel/typescript-rules": {
    "2.1.0": {
      "kiro-cli": ">=1.0.0",
      "amazon-q-developer": ">=2.0.0"
    }
  }
}
```

---

## Community Contributions

### Publishing Guidelines

**1. Namespace Rules**
- `@cairel/*` - Official packages (core team only)
- `@community/*` - Verified community packages
- `@username/*` - User packages

**2. Quality Standards**
- Follow standardized rule format
- Include comprehensive examples
- Provide tests/validation
- Document AI tool compatibility
- Maintain semantic versioning

**3. Review Process**
- Submit to community registry
- Automated validation
- Community review (for @community namespace)
- Approval and publication

### Contribution Workflow

```bash
# 1. Create package
mkdir my-custom-rules
cd my-custom-rules
carm init

# 2. Add rules
# Create rules following standard format

# 3. Test locally
carm validate

# 4. Publish
carm login
carm publish
```

---

## Integration with cairel

### Backward Compatibility

**cairel v1.0** (current):
- One-time initialization
- Curated presets only
- No updates after init

**cairel v2.0** (with carm):
- Dynamic rule management
- Community packages
- Continuous updates
- Dependency resolution

### Migration Path

```bash
# Existing project with cairel v1.0
cairel init

# Upgrade to carm
carm migrate

# Now can install additional packages
carm install @community/custom-rules
```

---

## Technical Implementation

### Registry Backend

**Technology Stack**:
- **API**: Node.js + Express
- **Database**: PostgreSQL (metadata) + S3 (packages)
- **CDN**: CloudFront for package distribution
- **Auth**: OAuth2 + API tokens

**Endpoints**:
```
GET  /packages                    # Search packages
GET  /packages/:name              # Package info
GET  /packages/:name/:version     # Specific version
POST /packages                    # Publish package
PUT  /packages/:name              # Update package
DELETE /packages/:name/:version   # Unpublish version
```

### CLI Client

**Technology Stack**:
- **Language**: TypeScript
- **HTTP Client**: axios
- **Package Manager**: npm (for inspiration)
- **Validation**: zod + ajv

**Core Modules**:
```typescript
// src/registry/client.ts
class RegistryClient {
  async search(query: string): Promise<Package[]>
  async install(packageName: string, version?: string): Promise<void>
  async publish(packagePath: string): Promise<void>
  async update(packageName?: string): Promise<void>
}

// src/resolver/dependency.ts
class DependencyResolver {
  async resolve(dependencies: Dependencies): Promise<ResolvedTree>
  async checkCompatibility(packages: Package[]): Promise<CompatibilityReport>
}

// src/installer/package.ts
class PackageInstaller {
  async install(package: Package, target: string): Promise<void>
  async uninstall(packageName: string): Promise<void>
  async update(packageName: string, version: string): Promise<void>
}
```

---

## Security Considerations

### Package Verification

**1. Signature Verification**
- All packages signed with GPG keys
- Verify signature before installation
- Warn on unsigned packages

**2. Checksum Validation**
- SHA-256 checksums for all files
- Verify integrity after download
- Reject tampered packages

**3. Malicious Code Detection**
- Automated scanning for suspicious patterns
- Community reporting system
- Quarantine flagged packages

### Access Control

**1. Publishing**
- Authenticated users only
- Email verification required
- 2FA for @cairel namespace

**2. Namespaces**
- `@cairel/*` - Core team only
- `@community/*` - Verified contributors
- `@username/*` - Any authenticated user

**3. Deprecation**
- Package owners can deprecate versions
- Automated warnings on install
- Migration guides required

---

## Monetization (Optional)

### Free Tier
- All core packages free
- Community packages free
- Unlimited installs

### Pro Tier (Future)
- Private packages
- Team collaboration
- Priority support
- Advanced analytics

### Enterprise Tier (Future)
- Self-hosted registry
- Custom namespaces
- SLA guarantees
- Dedicated support

---

## Roadmap

### Phase 1: MVP (6 months)
- [ ] Registry backend
- [ ] CLI client
- [ ] Core packages (@cairel/*)
- [ ] Basic search and install
- [ ] Documentation

### Phase 2: Community (3 months)
- [ ] User authentication
- [ ] Publishing workflow
- [ ] Community packages
- [ ] Review system
- [ ] Quality badges

### Phase 3: Advanced (6 months)
- [ ] Dependency resolution
- [ ] Compatibility checking
- [ ] Update notifications
- [ ] Bundle packages
- [ ] Analytics dashboard

### Phase 4: Enterprise (Future)
- [ ] Self-hosted registry
- [ ] Private packages
- [ ] Team features
- [ ] Advanced security
- [ ] SLA support

---

## Success Metrics

### Adoption
- Number of published packages
- Number of installs
- Active users
- Community contributors

### Quality
- Average package rating
- Issue resolution time
- Update frequency
- Compatibility score

### Ecosystem
- AI tool integrations
- Framework support
- Language coverage
- Community engagement

---

## Conclusion

carm represents the natural evolution of cairel from a one-time initialization tool to a dynamic ecosystem for AI-driven development best practices. By enabling community contributions, versioning, and dependency management, we can create a sustainable, growing repository of AI development knowledge.

**Next Steps**:
1. Complete cairel v1.0
2. Gather community feedback
3. Design registry architecture
4. Build MVP
5. Launch beta program

---

**Document Status**: Living document - will evolve based on community needs and feedback.
