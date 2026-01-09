---
sidebar_position: 1
title: Introduction
---

# 1. Introduction

## 1.1 Purpose

**System Constitution** is an **architectural governance layer** designed for **autonomous software evolution**. It provides a formal, machine-readable definition that:

- **Enforces structural integrity** — Defines boundaries and invariants that cannot be violated
- **Controls permissible evolution** — Specifies what changes are allowed over time
- **Prevents architectural degradation** — Blocks unauthorized coupling, contract violations, and schema drift
- **Enables autonomous generation** — LLMs can operate without human-in-the-loop oversight

Unlike specification-driven approaches that rely on process discipline and human review, System Constitution embeds **formal constraints** directly into the system definition. The result: stability through constraints, not rituals.

## 1.2 The Problem

Autonomous LLM-guided development faces a fundamental challenge: **architectural erosion**. Without constant human oversight, AI agents can gradually degrade system structure through:

- Unauthorized coupling between modules
- Contract violations and invariant breaches
- Uncontrolled schema evolution
- Loss of separation of concerns

**Process-based solutions** address this through discipline and iteration—requiring human review at each step. This works, but limits autonomy.

## 1.3 Our Approach: Formal Constraints

System Constitution takes a different path:

| Without System Constitution | With System Constitution |
|----------------------------|--------------------------|
| Stability through discipline and iteration | Stability through formal constraints |
| Human-in-the-loop required | Autonomous generation possible |
| Process protects the system | Contracts protect the system |
| LLM can propose any change | LLM cannot violate contracts |

The system uses **Git** for version control of constitution files, providing full history, branching, and diff capabilities for architectural evolution.

## 1.4 Goals

System Constitution enables:

1. **Architectural Governance** — Define structural boundaries that are machine-enforced
2. **Autonomous-Safe Generation** — LLMs operate within formal constraints, no human oversight required
3. **Stack-Agnostic Design** — Works with any technology stack
4. **Verifiable Evolution** — Every modification is validated before application
5. **Complete Audit Trail** — Full history of architectural changes with migration paths

## 1.5 Non-Goals

System Constitution is **NOT**:

- A programming language for implementing algorithms
- A compiler that generates code in any language
- A replacement for frameworks or libraries
- A runtime execution environment

Algorithms (CV, ML, optimization) are implemented in user code through **hooks**, but under the control of contracts defined in the constitution.

## 1.6 Document Conventions

This specification uses requirement levels as defined in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt):

| Keyword | Meaning |
|---------|---------|
| **MUST** | Absolute requirement |
| **MUST NOT** | Absolute prohibition |
| **SHOULD** | Recommended but not required |
| **SHOULD NOT** | Not recommended but not prohibited |
| **MAY** | Optional |

## 1.7 Specification Version

This document describes **System Constitution v1**.

All conforming documents MUST declare:

```yaml
spec: sysconst/v1
```

## 1.8 File Format

Constitution files:

- **MUST** be serializable to JSON
- **MAY** use YAML as a human-friendly format
- **MUST** have deterministic canonical form (sorted keys, stable ordering) for diff operations
- **SHOULD** use `.sysconst.yaml` or `.sysconst.json` file extension
- **SHOULD** be version-controlled with Git

## 1.9 Core Concepts

### Nodes

Everything in System Constitution is a **Node**. Nodes are the universal building blocks:

```yaml
- kind: <NodeKind>      # Type of node (Entity, Command, etc.)
  id: <stable-id>       # Unique identifier
  meta:                 # Human-readable metadata
    title: "..."
    description: "..."
  spec: { ... }         # What this node IS (required)
  impl: { ... }         # How/where it's implemented (optional)
  children: [...]       # Child nodes
  contracts: [...]      # Invariants and constraints
  hooks: [...]          # User code extension points
```

### Stable IDs

Every node has a **stable ID** that:

- **MUST** match pattern `^[a-z][a-z0-9_.-]*$`
- **MUST** be unique across the entire constitution
- **MUST NOT** change between versions (use rename operations instead)

Examples:
- `system.root`
- `entity.customer`
- `cmd.order.submit`
- `evt.order.submitted`

### NodeRef

References to other nodes use the `NodeRef(id)` syntax:

```yaml
children:
  - NodeRef(entity.customer)
  - NodeRef(entity.order)
```

## 1.10 Constitution Structure

A complete System Constitution document has this structure:

```yaml
spec: sysconst/v1          # Version declaration (REQUIRED)

project:                   # Project metadata (REQUIRED)
  id: my.project
  versioning:
    strategy: semver
    current: "1.0.0"

structure:                 # Entry point (REQUIRED)
  root: NodeRef(system.root)

domain:                    # Domain model (REQUIRED)
  nodes: [...]

generation:                # Code generation rules (optional)
  zones: [...]
  hooks: [...]
  pipelines: {...}

history:                   # Version history (optional but recommended)
  - version: "1.0.0"
    changes: [...]
    migrations: [...]

tests:                     # Test scenarios (optional)
  scenarios: [...]

docs:                      # Documentation config (optional)
  packs: [...]
```

## 1.11 Layers

System Constitution has three conceptual layers:

### Domain Layer
Describes **what** the system is:
- Entities, Enums, Values
- Commands, Events, Queries
- Processes, Steps
- Policies, Contracts

### Evolution Layer
Describes **how** the system changes:
- Version history
- Change operations
- Migrations
- Compatibility rules

### Generation Layer
Describes **how** code is generated:
- File zones (overwrite, anchored, preserve)
- Hook points for user code
- Build/test pipelines
- Verification requirements

## 1.12 Validation

Every System Constitution document **MUST** pass validation before use. Validation occurs in phases:

1. **Structural** — Correct syntax and required fields
2. **Referential** — All references resolve, no illegal cycles
3. **Semantic** — Kind-specific rules are satisfied
4. **Evolution** — History chain is valid, migrations exist
5. **Generation** — Zones cover all files, hooks are valid
6. **Verifiability** — Pipelines defined, scenarios exist

See [Validator](./validator) for complete validation rules.
