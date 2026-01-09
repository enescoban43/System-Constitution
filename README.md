# System Constitution

**Define your architecture once. Let LLMs evolve it safely.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@redush/sysconst.svg)](https://www.npmjs.com/package/@redush/sysconst)

System Constitution designed for autonomous AI coding agents. Prevents architectural degradation as your project grows — it's a YAML-based architecture definition with built-in contracts that preserves system stability over time. When agents modify your system, the validator ensures every change respects your architectural rules.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HOW IT WORKS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  1. INIT — Bootstrap architecture from user prompt                    ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│       User                         LLM                      Constitution    │
│    ┌─────────┐               ┌─────────────┐             ┌──────────────┐   │
│    │ "Build  │               │  Generates  │             │ myapp.       │   │
│    │ e-comm  │──────────────▶│  initial    │────────────▶│ sysconst.    │   │
│    │ system" │               │  structure  │             │ yaml         │   │
│    └─────────┘               └─────────────┘             └──────┬───────┘   │
│                                                                 │           │
│  ═══════════════════════════════════════════════════════════════╪═══════   │
│                                                                 ▼           │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  2. EVOLVE — Continuous development with guardrails                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│    Constitution              LLM Evolution                 Your Code        │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────────────┐  │
│  │ entities:        │    │  "Add payment"   │    │  src/                 │  │
│  │   - User         │───▶│                  │───▶│    entities/          │  │
│  │   - Order        │    │  Modifies YAML:  │    │    commands/          │  │
│  │                  │    │  + PaymentModule │    │    events/            │  │
│  │ contracts:       │    │  + PaymentEntity │    │                       │  │
│  │   - "no cycles"  │    └────────┬─────────┘    │  (generated from YAML)│  │
│  │   - "refs valid" │             │              └───────────────────────┘  │
│  └────────▲─────────┘             ▼                                         │
│           │              ┌──────────────────┐                               │
│           │              │    VALIDATOR     │                               │
│           │              │                  │                               │
│           │              │  ✓ Schema OK     │                               │
│           │              │  ✓ Refs resolve  │                               │
│           │              │  ✓ Contracts OK  │                               │
│           │              │  ✓ Evolution OK  │                               │
│           │              │                  │                               │
│           │              │  ✗ Violation?    │                               │
│           │              │    → REJECTED    │                               │
│           │              └────────┬─────────┘                               │
│           │                       │                                         │
│           └───────────────────────┘                                         │
│                  Only valid changes saved                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Problem

When LLMs evolve your codebase autonomously, they don't understand your architectural decisions:
- Why modules are separated
- Which dependencies are forbidden  
- What invariants must hold
- How schemas can evolve

**Result**: Gradual architectural erosion. Each change seems fine, but over time the system degrades.

## The Solution

Put your architecture in a **machine-readable file** with explicit contracts. LLMs read and modify this file. The validator blocks any change that violates your rules.

| Without Constitution | With Constitution |
|---------------------|-------------------|
| Architecture lives in developers' heads | Architecture is explicit YAML |
| LLM guesses what's allowed | LLM sees exact constraints |
| Bad changes slip through | Validator blocks violations |
| Manual review required | Autonomous evolution possible |

## Quick Start

```bash
npm install -g @redush/sysconst
```

```bash
# Create constitution with LLM generation
sysconst init myshop -d "E-commerce platform with products and orders"

# Or create minimal template
sysconst init myapp --no-generate

# Validate
sysconst validate myapp.sysconst.yaml
```

This creates `myapp.sysconst.yaml`:

```yaml
spec: sysconst/v1

project:
  id: myapp
  versioning:
    strategy: semver
    current: "1.0.0"

domain:
  nodes:
    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          email: { type: string, required: true }
      contracts:
        - invariant: "email != ''"

    - kind: Entity  
      id: entity.order
      spec:
        fields:
          id: { type: uuid, required: true }
          userId: { type: ref(entity.user), required: true }
          status: { type: enum(OrderStatus), required: true }
      contracts:
        - invariant: "userId != null"  # Orders MUST have a user
```

## Key Features

- **Contracts** — Invariants, preconditions, and rules that must always hold
- **6-Phase Validation** — Structural → Referential → Semantic → Evolution → Generation → Verifiability
- **Git-Native Versioning** — Full history, diff, rollback for your architecture
- **LLM Integration** — Built-in support for OpenRouter, OpenAI, Anthropic, Ollama
- **Stack-Agnostic** — Works with any technology

## CLI Commands

```bash
# Evolve constitution with LLM
sysconst evolve myapp.sysconst.yaml -c "Add payment processing"

# Generate new constitution
sysconst generate "Task management system" -o tasks.sysconst.yaml

# Version management
sysconst version bump minor -f myapp.sysconst.yaml
sysconst history -f myapp.sysconst.yaml
sysconst diff v1.0.0 v1.1.0 -f myapp.sysconst.yaml
```

## Node Kinds

| Kind | Purpose |
|------|---------|
| `System` | Root container |
| `Module` | Logical grouping with boundaries |
| `Entity` | Persistent data with invariants |
| `Command` | Write operation with preconditions |
| `Event` | State change notification |
| `Process` | Multi-step workflow |
| `Scenario` | Verification case |

## LLM Providers

| Provider | Default Model |
|----------|---------------|
| **OpenRouter** (default) | `anthropic/claude-sonnet-4.5` |
| OpenAI | `gpt-5.2` |
| Anthropic | `claude-sonnet-4-5` |
| Ollama | `llama4` (free, local) |

```bash
sysconst init myapp -d "..." --provider ollama  # Free, no API key
```

## Documentation

- 📖 [Full Specification](docs/v1/spec/01-introduction.md)
- 🚀 [Quick Start Guide](docs/v1/guides/quick-start.md)
- 📚 [Reference](docs/v1/reference/node-kinds.md)

## License

MIT — see [LICENSE](LICENSE)

## Links

- [GitHub](https://github.com/redush-com/System-Constitution)
- [npm](https://www.npmjs.com/package/@redush/sysconst)
