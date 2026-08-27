# carm — AI Directive Manager (Future Vision)

**Status**: Conceptual — Post v2.0
**Inspiration**: npm's distribution + trust model, applied to a problem npm never had:
**cross-vendor** AI directives.

> This is a living strategy document. It captures *why* carm should exist and *what to
> validate before building it* — not a commitment to build the full system. Read the
> "Validation Gate" section before treating anything below as a roadmap.

---

## Thesis: carm is a consolidation layer, not another store

The AI-tooling market is **not** short on capability stores. It has too many, and they
are **silos**:

- Kiro has steering + "powers"
- Claude Code has Skills (and an emerging skills/marketplace surface)
- Cursor has `.cursor/rules` (and a community informally sharing them)
- GitHub Copilot has instructions + skills
- Amazon Q has rules
- MCP already spawned its own server registries

Every vendor is incentivized to make their store **lock content to their format**. A Kiro
power is not a Claude skill is not a Cursor rule. That fragmentation is the opportunity.

**carm's bet:** the valuable, unowned layer is the *neutral, cross-vendor* one —
"author or install a directive once, and get it correctly shaped for whichever tools you
actually use." Vendors won't build this (interop works against lock-in), so the
consolidation layer has to come from outside. cairel already owns the hard part: the
**hybrid-directives transform** (one authored directive → enforced / contextual /
available, routed per platform, see ADR-008). carm is *distribution on top of a proven
transform*, not a new store competing with the vendors'.

Positioning in one line:
> **npm-for-portable-AI-directives** — the free, neutral layer that consolidates what the
> vendor stores keep fragmented.

---

## Why the maintenance burden becomes a strength, not a liability

The obvious objection to a consolidation layer: *"you now inherit the churn of five
vendors' formats — every protocol change breaks you."* We felt this firsthand while
building cairel (npm token model changed mid-flight; enforcement docs shift constantly).

The answer is the same one that makes npm itself viable: **community-maintained
adapters.** The registry team does not maintain every package; the ecosystem does.

- Cursor users maintain the Cursor adapter; Kiro users maintain Kiro's; etc.
- Format churn becomes a stream of small, distributed PRs instead of a solo treadmill.
- Evolving tech/protocols stop being a *risk* and become the *reason the community
  exists* — the shared incentive to keep the neutral layer current.

**Honest caveat:** community maintenance only kicks in *after* there is a community.
Early on, the maintainer(s) carry adapter upkeep alone. The strategic problem is
therefore **surviving to critical mass**, not whether the model works long-term.

---

## Scope reality: consolidate the *portable subset*, be honest about the rest

Not everything ports losslessly. A Claude Skill can bundle executable scripts and
resources; a Kiro steering file is markdown + frontmatter; a Cursor rule is `.mdc`.

- The **portable subset** — guidance/constraints as markdown + an enforcement level —
  ports cleanly today. That is exactly what cairel already generates across five platforms.
- The **powerful, vendor-specific content** (skills with code, tool bindings) may not be
  losslessly convertible.

carm should be upfront that it consolidates the portable subset and clearly marks
vendor-specific capabilities as non-portable, rather than pretending everything converts.
That honesty bounds the pitch correctly and builds trust.

---

## Validation Gate (do this BEFORE building the registry)

Everything below this line — registry backend, dependency resolution, private instances —
is **premature until one hypothesis is validated**:

> **People want to publish and consume cross-vendor AI directives from a shared source.**

Donations, paid custom-directive work, and private instances *all* presuppose this. If it
is false — if everyone only ever wants their own bespoke rules — there is no commons to
consolidate and the whole model has nothing to stand on.

**Smallest test that proves it** (the real "carm MVP"):
- cairel, but able to pull directives from a **shared remote source** instead of only
  bundled presets: `carm add <directive>` fetches and installs it, correctly shaped for
  the user's tools.
- No registry backend required at first — a Git-backed source (e.g. a GitHub repo/org of
  directives) is enough to test the behavior.
- Success signal: **strangers publish directives, and other strangers install them across
  different tools, and it works.** If that happens, the rest of this document is justified.
  If it does not, stop here — the engine is the product and presets are disposable.

Only after this gate should the registry/monetization work below be scheduled.

---

## Monetization (npm-shaped, mostly free)

The core must be **free and neutral** — the moment the base layer is paywalled, a
vendor's free importer beats it. Sustainability comes from three sources that do **not**
compromise neutrality and do **not** fight each other:

1. **Donations for the overall solution.** Funds the free public commons (core CLI,
   public registry, community adapters). Keeps the neutral layer neutral.
2. **Paid on-demand custom directive creation.** Productized curation expertise — teams
   pay to have bespoke, high-quality directives authored for their stack. Revenue from day
   one; scales with maintainer time (consulting, productized).
3. **Paid private instances / private registries.** The npm model: public is free, private
   is paid. Teams keep proprietary internal directives (company standards, internal tooling
   conventions) off the public registry. Demand-pulled enterprise wedge; scales without
   maintainer time.

Flywheel: free public core → adoption → community maintains adapters → community/content
creates demand → private instances + custom work fund sustainability. None of it requires
the big-bang registry to exist first.

Explicitly **dropped** from the earlier vision: speculative Pro/Enterprise tier ladders,
analytics dashboards, and SLA products. Those are end-state details, not first moves.

---

## Package & config shapes (reference — unchanged in spirit)

Retained from the original concept because the shapes are still sound; treat as
illustrative, not committed.

### Package types

```
@cairel/typescript-directives     # official (core team)
@community/nextjs-best-practices   # verified community
@username/my-directives            # any authenticated user
@cairel/general-dev-agent          # agent packages
@cairel/fullstack-bundle           # bundles
```

### Example package manifest

```json
{
  "name": "@cairel/typescript-directives",
  "version": "2.1.0",
  "description": "TypeScript development directives",
  "license": "MIT",
  "ai-tools": ["kiro", "cursor", "claude-code", "github-copilot", "amazon-q"],
  "dependencies": {
    "@cairel/git-directives": "^1.0.0"
  },
  "files": ["directives/typescript-validation/SKILL.md"],
  "repository": "https://github.com/cairel/typescript-directives"
}
```

### Project config (carm.json)

```json
{
  "name": "my-project",
  "ai-tools": ["kiro", "cursor"],
  "dependencies": {
    "@cairel/typescript-directives": "^2.1.0",
    "@community/custom-directives": "^0.3.0"
  }
}
```

### Illustrative commands

```bash
carm add @cairel/typescript-directives     # install, shaped per the project's tools
carm search "react native"
carm publish
carm update
```

---

## Trust infrastructure — already partly built

A registry needs a trust model. cairel's release pipeline already established the
relevant primitives (REL-01/REL-02, ADR-010/ADR-011): **tokenless OIDC publishing** and
**automatic provenance attestations**. The same posture (short-lived credentials,
provenance, no long-lived secrets) is the right foundation for a carm registry — so the
publishing-trust groundwork is not hypothetical, it is the model cairel itself ships on.

Registry security (signing/checksums, namespace access control, malicious-content
reporting) remains post-validation work.

---

## Sequenced roadmap (gated)

1. **Validate portability demand** (the MVP above; Git-backed source, `carm add`).
   *Gate: strangers publish + install cross-tool successfully.*
2. **Public registry MVP** — only if step 1 succeeds. Search, install, publish;
   community-maintained adapters; provenance via the OIDC model already in use.
3. **Private instances** — the paid wedge, once public adoption is real.
4. **Advanced** — dependency resolution, bundles, compatibility matrices.

Enterprise SLA/self-hosting stays out of scope until there is demonstrated pull.

---

## Success metrics (adoption-first, not feature-first)

- **Validation phase:** number of *external* publishers, number of cross-tool installs by
  people who are not the author. This is the only metric that matters early.
- **Growth phase:** community adapter PRs (proxy for the maintenance model working),
  published packages, active installs.
- **Sustainability phase:** donations, custom-directive engagements, private-instance
  subscribers.

---

## Conclusion

carm is worth building **if and only if** the portability-demand hypothesis holds. Its
edge is not "another skills store" — it is the **neutral cross-vendor consolidation layer**
that vendors are structurally disinclined to build, powered by a transform cairel already
owns, maintained by a community that turns protocol churn from a liability into shared
purpose, and sustained by an npm-shaped model (free core + paid custom work + private
instances).

Build the smallest thing that tests the hypothesis first. Everything else follows from
whether strangers actually share and reuse directives across tools.

---

**Document Status**: Living strategy document. Reframed 2026-08-27 from the original
big-bang-registry concept to a consolidation-layer thesis with a validation gate. See
ADR-009 (and the future ADR that will supersede it once the MVP is scheduled).
