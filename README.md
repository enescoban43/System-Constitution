# EvoSpec DSL

**Specification-driven software evolution for LLM-guided development**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@evospec/validator.svg)](https://www.npmjs.com/package/@evospec/validator)

EvoSpec DSL is a domain-specific language designed for **managed LLM-driven software evolution**. It provides a formal, machine-readable specification format that describes your system, controls code generation, and ensures safe evolution.

## Features

- 📋 **Specification-Driven** — Define your entire system in a single, version-controlled spec
- 🤖 **LLM-Safe Generation** — Clear boundaries prevent AI from making unauthorized changes
- 🔄 **Managed Evolution** — Track every change with full history and migrations
- 🔧 **Stack-Agnostic** — Works with any technology stack
- ✅ **Verifiable Contracts** — Define invariants, temporal constraints, and policies
- 🧪 **Test Generation** — Scenarios become executable tests

## Quick Start

### Installation

```bash
npm install -g @evospec/cli
```

### Environment Setup

For LLM-powered features (generate, evolve), set up your API key:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key (choose one provider)
OPENROUTER_API_KEY=sk-or-v1-your-key-here  # Recommended
# or
OPENAI_API_KEY=sk-your-key-here
# or
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> **Note:** For local development without API keys, use Ollama (free, runs locally) or `--no-generate` flag.

### Create Your First Spec

```bash
# With LLM generation
evospec init myshop -d "E-commerce platform with products and orders"

# Without LLM (minimal template)
evospec init myapp --no-generate
```

This creates `myapp.evospec.yaml`:

```yaml
spec: evospec/v1

project:
  id: myapp
  versioning:
    strategy: semver
    current: "1.0.0"

structure:
  root: NodeRef(system.root)

domain:
  nodes:
    - kind: System
      id: system.root
      spec:
        goals:
          - "My application"

    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          email: { type: string, required: true }
      contracts:
        - invariant: "email != ''"
```

### Validate

```bash
evospec validate myapp.evospec.yaml
```

## Documentation

- 📖 [Full Specification](docs/v1/spec/01-introduction.md)
- 🚀 [Quick Start Guide](docs/v1/guides/quick-start.md)
- 📚 [Reference](docs/v1/reference/node-kinds.md)
- 🌐 [Website](https://evospec.dev)

## Project Structure

```
EvoSpec-DSL/
├── docs/v1/              # Human-readable documentation
│   ├── spec/             # Specification (7 chapters)
│   ├── guides/           # How-to guides
│   └── reference/        # API reference
├── schema/v1/            # JSON Schema
├── llm/v1/               # LLM integration
│   ├── SYSTEM_PROMPT.md  # Prompt for LLMs
│   └── examples/         # Example specs
├── validator/            # TypeScript validator
├── cli/                  # CLI tool
├── website/              # Docusaurus site
└── .env.example          # Environment variables template
```

## Packages

| Package | Description |
|---------|-------------|
| `@evospec/validator` | Validation library |
| `@evospec/cli` | Command-line interface |
| `@evospec/schema` | JSON Schema |

## Core Concepts

### Node Kinds

| Kind | Purpose |
|------|---------|
| `System` | Root container |
| `Module` | Logical grouping |
| `Entity` | Persistent data |
| `Command` | Write operation |
| `Event` | State change notification |
| `Process` | Multi-step workflow |
| `Scenario` | Test case |

### Validation Phases

1. **Structural** — Syntax and required fields
2. **Referential** — References and identity
3. **Semantic** — Kind-specific rules
4. **Evolution** — History and migrations
5. **Generation** — Zone and hook safety
6. **Verifiability** — Pipelines and scenarios

### Generation Zones

| Mode | Description |
|------|-------------|
| `overwrite` | Fully regenerated |
| `anchored` | Has hook anchors for user code |
| `preserve` | Never touched |
| `spec-controlled` | Changes only via spec |

## LLM Integration

### CLI Commands

The CLI includes built-in LLM support for generating and evolving specs:

```bash
# Generate new spec from description
evospec generate "Task management with projects and tasks" -o tasks.evospec.yaml

# Evolve existing spec
evospec evolve myapp.evospec.yaml -c "Add user authentication"

# Interactive chat mode
evospec chat myapp.evospec.yaml
```

### Supported Providers

| Provider | API Key Variable | Model Variable | Default Model |
|----------|-----------------|----------------|---------------|
| **OpenRouter** (default) | `OPENROUTER_API_KEY` | `OPENROUTER_MODEL` | `anthropic/claude-sonnet-4.5` |
| OpenAI | `OPENAI_API_KEY` | `OPENAI_MODEL` | `gpt-5.2` |
| Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` | `claude-sonnet-4-5` |
| Ollama (local) | — | `OLLAMA_MODEL` | `llama4` |

**Popular OpenRouter models:**
- `anthropic/claude-sonnet-4.5` (default, recommended)
- `anthropic/claude-opus-4.1` (most capable)
- `openai/gpt-5.2`
- `openai/gpt-5.2-pro`
- `google/gemini-2.0-pro`
- `meta-llama/llama-4-maverick`

See full list at [openrouter.ai/models](https://openrouter.ai/models)

### Validation Loop

All generated specs are automatically validated. If validation fails, the LLM retries with error feedback (up to 3 attempts by default).

### System Prompt

Include the [System Prompt](llm/v1/SYSTEM_PROMPT.md) in your LLM context for custom integrations:

```markdown
# EvoSpec DSL v1 — LLM Generation Guide
...
```

The prompt is optimized for ~3-4K tokens and includes:
- Core structure reference
- Node kinds table
- Type system
- Validation rules
- Minimal example

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Documentation](https://evospec.dev)
- [GitHub](https://github.com/evospec/evospec-dsl)
- [npm](https://www.npmjs.com/package/@evospec/validator)
