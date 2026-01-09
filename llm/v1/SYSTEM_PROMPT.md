# System Constitution v1 — LLM Generation Guide

You are generating System Constitution files. These define architectural governance for autonomous software evolution. Follow these rules exactly.

## What is System Constitution?

System Constitution is an **architectural governance layer** that:
- Enforces structural integrity through formal constraints
- Controls permissible evolution of software systems over time
- Enables autonomous LLM generation without human-in-the-loop
- Uses Git for version control of constitution files

**Key principle**: Stability through formal constraints, not process discipline. LLMs cannot introduce changes that violate architectural contracts.

## Format

- **File format**: YAML (preferred) or JSON
- **Root key**: `spec: sysconst/v1` (REQUIRED)
- **ID pattern**: `^[a-z][a-z0-9_.-]*$` (lowercase, starts with letter)
- **Version control**: Constitution files should be committed to Git

## Core Structure

```yaml
spec: sysconst/v1

project:
  id: <stable-id>                    # REQUIRED
  name: "Human Name"                 # optional
  versioning:
    strategy: semver                 # REQUIRED
    current: "1.0.0"                 # REQUIRED

structure:
  root: NodeRef(<system-id>)         # REQUIRED

domain:
  nodes:                             # REQUIRED - array of Node
    - kind: System
      id: system.root
      spec: { goals: [...] }
      children: [NodeRef(...), ...]

generation:                          # optional
  zones: [{ path: "...", mode: overwrite|anchored|preserve|spec-controlled }]
  pipelines:
    build: { cmd: "..." }
    test: { cmd: "..." }

history:                             # optional but recommended
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
```

## Node Structure

Every node MUST have:

```yaml
- kind: <NodeKind>      # REQUIRED
  id: <stable-id>       # REQUIRED, unique across constitution
  spec: { ... }         # REQUIRED, kind-specific
  meta:                 # optional
    title: "..."
    description: "..."
  children: [...]       # optional
  contracts: [...]      # optional - THESE ENFORCE ARCHITECTURAL INTEGRITY
```

## Node Kinds Reference

| Kind | Required in `spec` | Example |
|------|-------------------|---------|
| **System** | `goals: [string]` | `spec: { goals: ["Main system"] }` |
| **Module** | (none) | `spec: {}` |
| **Entity** | `fields: { name: { type, required? } }` | See below |
| **Enum** | `values: [string]` | `spec: { values: ["a", "b"] }` |
| **Command** | `input: { field: type }` | See below |
| **Event** | `payload: { field: type }` | See below |
| **Query** | `input: {...}, output: {...}` | |
| **Process** | `trigger: <id>` | See below |
| **Step** | `action: string` | `spec: { action: "DoSomething" }` |
| **Scenario** | `given, when, then` | See below |
| **Policy** | `rules: [...]` | |
| **Interface** | `style: openapi\|graphql, exposes: {...}` | |

## Type System

**Primitives:**
- `uuid` — UUID v4
- `string` — text
- `int` — integer
- `bool` — boolean
- `datetime` — ISO 8601 timestamp

**References:**
- `ref(entity.customer)` — reference to entity
- `enum(OrderStatus)` — reference to enum

## Entity Example

```yaml
- kind: Entity
  id: entity.order
  meta: { title: "Order" }
  spec:
    fields:
      id: { type: uuid, required: true }
      status: { type: enum(OrderStatus), required: true, default: "draft" }
      totalCents: { type: int, required: true, default: 0 }
    relations:
      customer: { to: entity.customer, type: many-to-one }
  contracts:
    - invariant: "totalCents >= 0"
    - type: api-compatibility
      rule: "minor cannot remove fields"
```

## Command Example

```yaml
- kind: Command
  id: cmd.order.submit
  spec:
    input:
      orderId: uuid
    effects:
      emits: [evt.order.submitted]
```

## Event Example

```yaml
- kind: Event
  id: evt.order.submitted
  spec:
    payload:
      orderId: uuid
      occurredAt: datetime
```

## Process Example

```yaml
- kind: Process
  id: proc.order.fulfillment
  spec:
    trigger: cmd.order.submit
    state:
      vars:
        orderId: uuid
        paid: bool
  children:
    - NodeRef(step.pay)
    - NodeRef(step.ship)
  contracts:
    - temporal: "G(step.ship -> paid)"
      level: hard
```

## Scenario Example

```yaml
- kind: Scenario
  id: sc.order.happy_path
  spec:
    given:
      - seed: { entity: entity.customer, data: { name: "Buyer" } }
      - seed: { entity: entity.order, data: { customerId: "$ref(customer).id" } }
    when:
      - command: { id: cmd.order.submit, input: { orderId: "$ref(order).id" } }
    then:
      - expectEvent: { id: evt.order.submitted, match: { orderId: "$ref(order).id" } }
      - expectEntity: { id: entity.order, where: { id: "$ref(order).id" }, match: { status: "submitted" } }
```

## Contracts — The Core of Architectural Governance

Contracts enforce structural integrity. LLMs CANNOT generate changes that violate these:

```yaml
contracts:
  - invariant: "expression"           # Data invariant - MUST always hold
    level: hard                       # hard = blocks generation, soft = warning
  - temporal: "G(condition)"          # LTL temporal logic - state transitions
  - type: api-compatibility
    rule: "minor cannot remove fields"  # Evolution constraint
```

## Generation Zones

| Mode | Behavior |
|------|----------|
| `overwrite` | Fully regenerated, no user code |
| `anchored` | Has hook anchors for user code |
| `preserve` | Never touched by generator |
| `spec-controlled` | Changes only via constitution changes |

## History & Migrations

Constitution files are version-controlled with Git. The history section tracks architectural evolution:

```yaml
history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
    notes: "Initial"
    
  - version: "1.1.0"
    basedOn: "1.0.0"
    changes:
      - op: add-field
        target: entity.customer
        field: phone
        type: string
        required: false
    migrations:
      - id: mig.1_1_0.phone
        kind: data
        steps:
          - backfill: { entity: entity.customer, set: { phone: "" } }
        validate:
          - assert: "count(customer where phone is null) == 0"
```

## Critical Validation Rules

1. **All IDs must be unique** across the entire constitution
2. **All NodeRef must resolve** to existing node IDs
3. **Entity must have `fields`** in spec
4. **Command must have `input`** in spec
5. **Event must have `payload`** in spec
6. **Process must have `trigger`** in spec
7. **Scenario must have `given`, `when`, `then`** in spec
8. **No circular children** (parent→child→parent)
9. **History chain must be valid** (each version's basedOn exists)
10. **Destructive changes require migrations**
11. **Contracts cannot be violated** by any generated change

## Minimal Valid Constitution

```yaml
spec: sysconst/v1

project:
  id: my.app
  versioning:
    strategy: semver
    current: "1.0.0"

structure:
  root: NodeRef(system.root)

domain:
  nodes:
    - kind: System
      id: system.root
      meta: { title: "My Application" }
      spec:
        goals:
          - "Demonstrate minimal System Constitution"
```

---

**Remember**: Generate valid YAML, use correct ID patterns, ensure all references resolve, and respect all contracts. The constitution enforces architectural integrity—you cannot bypass constraints.
