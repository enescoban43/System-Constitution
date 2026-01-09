# @redush/sysconst

**Define your architecture once. Let LLMs evolve it safely.**

[![npm version](https://img.shields.io/npm/v/@redush/sysconst.svg)](https://www.npmjs.com/package/@redush/sysconst)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/redush-com/System-Constitution/blob/main/LICENSE)

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

## Installation

```bash
# Global CLI
npm install -g @redush/sysconst

# As library
npm install @redush/sysconst
```

## Quick Start

### CLI Usage

```bash
# Create constitution with LLM generation
sysconst init myshop -d "E-commerce platform with products and orders"

# Create minimal template (no LLM)
sysconst init myapp --no-generate

# Validate
sysconst validate myapp.sysconst.yaml
```

### Programmatic Usage

```typescript
import { validateYaml } from '@redush/sysconst';

const result = validateYaml(`
spec: sysconst/v1
project:
  id: myapp
  versioning:
    strategy: semver
    current: "1.0.0"
domain:
  nodes:
    - kind: System
      id: system.root
      spec:
        goals: ["My application"]
`);

if (result.ok) {
  console.log('Constitution is valid!');
} else {
  console.log('Errors:', result.errors);
}
```

## CLI Commands

### `init` — Create New Constitution

```bash
sysconst init <name> [options]

Options:
  -d, --description <text>   Description for LLM generation
  --no-generate              Skip LLM, create minimal template
  --provider <name>          LLM provider (openrouter|openai|anthropic|ollama)
  --model <name>             Specific model to use
```

### `validate` — Validate Constitution

```bash
sysconst validate myapp.sysconst.yaml
```

### `evolve` — Evolve with LLM

```bash
sysconst evolve myapp.sysconst.yaml -c "Add payment processing"
```

### `generate` — Generate from Description

```bash
sysconst generate "Task management system" -o tasks.sysconst.yaml
```

### Version Management

```bash
sysconst version bump <major|minor|patch> -f <file>
sysconst version tag -f <file>
sysconst history -f <file>
sysconst diff v1.0.0 v1.1.0 -f <file>
sysconst checkout v1.0.0
```

## Validation Phases

| Phase | Description |
|-------|-------------|
| **1. Structural** | Syntax, required fields, JSON Schema |
| **2. Referential** | NodeRef resolution, unique IDs |
| **3. Semantic** | Kind-specific rules |
| **4. Evolution** | Version history, migrations |
| **5. Generation** | Zone safety, hooks |
| **6. Verifiability** | Scenarios, pipelines |

## Validation API

```typescript
import { validateYaml, validate, parseSpec } from '@redush/sysconst';

// Validate YAML string
const result = validateYaml(yamlString);

// Validate parsed object
const result = validate(specObject);

// Parse YAML to object
const spec = parseSpec(yamlString);
```

### ValidationResult

```typescript
interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  phase: ValidationPhase;
}
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

### API Key Configuration

On first use, CLI prompts for API key → saved to `~/.sysconst/config.yaml`.

**For CI/CD:**

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Constitution File Format

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
          userId: { type: ref(entity.user), required: true }
      contracts:
        - invariant: "userId != null"
```

## Links

- [GitHub](https://github.com/redush-com/System-Constitution)
- [Documentation](https://github.com/redush-com/System-Constitution/blob/main/docs/v1/spec/01-introduction.md)
- [Quick Start](https://github.com/redush-com/System-Constitution/blob/main/docs/v1/guides/quick-start.md)

## License

MIT
