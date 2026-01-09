# System Constitution v1 — Compact Guide

Architectural governance layer for autonomous software evolution. Uses Git for version control.

## Format
- YAML with `spec: sysconst/v1`
- IDs: `^[a-z][a-z0-9_.-]*$`

## Structure
```yaml
spec: sysconst/v1
project: { id: my.app, versioning: { strategy: semver, current: "1.0.0" } }
structure: { root: NodeRef(system.root) }
domain: { nodes: [...] }
```

## Node
```yaml
- kind: System|Module|Entity|Enum|Command|Event|Process|Step|Scenario
  id: stable.id
  spec: { ... }  # kind-specific, REQUIRED
  children: [NodeRef(...)]  # optional
  contracts: [...]  # ENFORCES ARCHITECTURAL INTEGRITY
```

## Kind → spec

| Kind | spec |
|------|------|
| System | `goals: [str]` |
| Entity | `fields: { name: { type, required? } }` |
| Enum | `values: [str]` |
| Command | `input: { field: type }`, `effects?: { emits: [id] }` |
| Event | `payload: { field: type }` |
| Process | `trigger: id`, `state?: { vars: {...} }` |
| Step | `action: str` |
| Scenario | `given: [], when: [], then: []` |

## Types
`uuid`, `string`, `int`, `bool`, `datetime`, `ref(entity.x)`, `enum(Name)`

## Contracts (Core of Governance)
```yaml
contracts:
  - invariant: "expression"  # MUST always hold
  - temporal: "G(condition)"  # State transitions
  - type: api-compatibility
    rule: "minor cannot remove fields"
```

## Example
```yaml
spec: sysconst/v1
project:
  id: demo
  versioning: { strategy: semver, current: "1.0.0" }
structure:
  root: NodeRef(system.root)
domain:
  nodes:
    - kind: System
      id: system.root
      spec: { goals: ["Demo"] }
    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          name: { type: string, required: true }
      contracts:
        - invariant: "name != ''"
```

## Rules
- All IDs unique
- All NodeRef must resolve
- Entity needs `fields`, Command needs `input`, Event needs `payload`
- **Contracts cannot be violated** by any generated change
