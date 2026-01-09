---
sidebar_position: 1
title: Quick Start
---

# Quick Start Guide

Get started with System Constitution in 5 minutes.

## Installation

```bash
npm install -g @sysconst/cli
```

## Your First Constitution

Create `myapp.sysconst.yaml`:

```yaml
spec: sysconst/v1

project:
  id: myapp
  name: "My Application"
  versioning:
    strategy: semver
    current: "1.0.0"

structure:
  root: NodeRef(system.root)

domain:
  nodes:
    - kind: System
      id: system.root
      meta:
        title: "My Application"
      spec:
        goals:
          - "Manage users"
      children:
        - NodeRef(entity.user)

    - kind: Entity
      id: entity.user
      meta:
        title: "User"
      spec:
        fields:
          id:
            type: uuid
            required: true
          email:
            type: string
            required: true
          name:
            type: string
            required: true
      contracts:
        - invariant: "email != ''"
          level: hard
        - type: api-compatibility
          rule: "minor cannot remove fields"

history:
  - version: "1.0.0"
    basedOn: null
    changes: []
    migrations: []
```

## Version Control with Git

Constitution files should be version-controlled:

```bash
git add myapp.sysconst.yaml
git commit -m "Initial system constitution"
```

## Validate

```bash
sysconst validate myapp.sysconst.yaml
```

## Why Formal Constraints?

| Without Constitution | With Constitution |
|---------------------|-------------------|
| Stability via discipline | Stability via constraints |
| Human-in-the-loop required | Autonomous generation |
| Process protects system | Contracts protect system |

## Next Steps

1. Read the [Specification](../spec/introduction)
2. Explore [Examples](https://github.com/nicholasoxford/system-constitution/tree/main/llm/v1/examples)
3. Set up code generation
