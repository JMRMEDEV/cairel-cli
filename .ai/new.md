# New Project Initialization Protocol (new.md)

**Purpose**:  
Define a strict, repeatable, and AI-safe flow for creating a brand-new project using Amazon Q Developer / kiro-cli, with strong emphasis on:
- Human-in-the-loop decision making
- Reliable architecture formation
- Efficient documentation for token savings
- Controlled, stage-based implementation

This file is the **single source of truth** the dev-agent must follow when initializing any new project.

---

## 0. Core Principles (Non-Negotiable)

1. **Human is the final authority**
   - The agent may suggest, analyze, and warn
   - The human decides what is built and how

2. **No silent assumptions**
   - Every assumption must be tracked and classified
   - Unconfirmed assumptions must be surfaced explicitly

3. **No implementation without approval**
   - Planning and documentation first
   - Code only after explicit human confirmation

4. **Documentation is part of the system**
   - Docs are not optional or “nice to have”
   - Docs enable continuity, auditing, and token efficiency

---

## 1. Required Human Inputs (Intake Phase)

Before any planning begins, the agent MUST collect at least:

### 1.1 Problem Statement
- What is being built?
- Why does it exist?
- Who is it for?

Plain language is acceptable.

### 1.2 Goals and Non-Goals
- Must-have outcomes
- Explicit non-goals (what this project will NOT try to do)

### 1.3 Constraints
- Budget or cost sensitivity
- Timeline or deadlines
- Deployment constraints (cloud, on-prem, region)
- Compliance or legal constraints (if any)
- Data sensitivity (PII, secrets, regulated data)

### 1.4 Success Criteria
- How will we know this is successful?
- Functional, performance, or reliability signals

---

## 2. Tech Stack Definition & Negotiation

### 2.1 Classification Rule

Each technology MUST be classified as one of:

- **NON-NEGOTIABLE**
- **PREFERRED**
- **OPTIONAL / OPEN**

If classification is unclear, the agent MUST ask.

### 2.2 Agent Responsibilities

- Respect NON-NEGOTIABLE items
- Propose improvements *within* non-negotiables
- Suggest alternatives for PREFERRED / OPTIONAL items
- Always explain trade-offs:
  - Cost
  - Complexity
  - Vendor lock-in
  - Scalability
  - Team skill availability

### 2.3 Decision Ownership

- Suggestions ≠ decisions
- Final stack choices must be explicitly confirmed by the human

---

## 3. Assumptions & Open Questions Protocol

### 3.1 Mandatory Assumption Tracking

The agent MUST maintain a list of assumptions, each tagged as:

- **CONFIRMED** – explicitly approved by human
- **PENDING** – awaiting confirmation
- **RISKY** – likely to cause rework if wrong

### 3.2 Rules

- CONFIRMED assumptions may be used freely
- PENDING assumptions must be called out in plans
- RISKY assumptions must block implementation until resolved

### 3.3 Placement

Assumptions MUST be documented in:
- `docs/dev-plan.md`
- Referenced when relevant in `docs/architecture.md`

---

## 4. Architecture & Planning Phase

### 4.1 Architecture Requirements

The agent MUST describe:
- High-level components
- Responsibilities and boundaries
- Data flow
- External integrations
- Authentication & authorization model
- Error handling strategy
- Observability (logs, metrics, traces)

ASCII diagrams are allowed and encouraged.

### 4.2 Planning Requirements (Stage-Based)

Work MUST be split into **stages**, not vague task lists.

Each stage MUST define:
- Objective
- Scope boundaries
- Exit criteria (clear “done” conditions)
- Dependencies
- Risks

---

## 5. Human Architecture Checkpoint

Before any code is written, the agent MUST ask:

> “Does this plan and architecture make sense?  
> Do you want changes before implementation begins?”

If the answer is:
- **No** → revise earlier steps
- **Yes** → proceed to documentation finalization

---

## 6. Required Project Documentation

Once the plan is approved, the agent MUST create:

### Required
- `README.md`  
  Overview, goals, how to run, and doc references

- `docs/dev-plan.md`  
  Stage-based execution plan, assumptions, risks

- `docs/architecture.md`  
  System architecture and technology rationale

- `docs/progress.md`  
  Chronological log of work performed by the agent

- `docs/bugs.md`  
  Known issues, technical debt, discovered risks

### Optional (Recommended)
- `docs/decisions.md`  
  Short decision records explaining *why* choices were made

---

## 7. Steering Directory (Minimum Set)

The agent MUST ask:

> “Should this repository include agent steering configuration?”

If **yes**, create:

```
.kiro-cli/steering/
├── context-retrieval-rules.md
├── markdown-maintenance-rules.md
└── implementation-approval-rules.md
```

These files govern:
- Token-efficient reading
- Documentation maintenance discipline
- Implementation safety and approval gates

---

## 8. Implementation Rules

### 8.1 Approval Gate (Hard Rule)

The agent MUST NOT:
- Write or modify code
- Run state-changing commands
- Commit to git

Without **explicit human approval**.

### 8.2 Implementation Loop (Per Stage)

For each approved stage:
1. Restate stage objective
2. State which files will change
3. Obtain approval
4. Implement
5. Run non-interactive tests if applicable
6. Update:
   - `docs/progress.md`
   - `docs/bugs.md` (if issues found)
7. Ask whether to proceed to next stage

---

## 9. Git & Secrets Safety (Condensed Rules)

- Never commit real secrets
- Use `.env.example` for variable names only
- Verify repository before git operations
- Prefer small, logical commits
- Avoid history rewrites unless explicitly requested

---

## 10. Definition of Done: “Project Initialized”

A project is considered **initialized** when:

- Human-approved architecture exists
- Stage-based dev plan exists
- All required docs are created
- Assumptions are tracked and visible
- Steering directory exists (if approved)
- No code has been written without approval

Only after this point may implementation begin.

---

## 11. Final Reminder

**The agent’s job is not speed.  
The agent’s job is correctness, clarity, and reversibility.**

If unsure at any point:
- Stop
- Ask
- Document
