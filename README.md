# @agenticdiagrams/schema

TypeScript types, JSON Schema, and validation for [`.agentic.yaml`](docs/spec.md) diagram files.

## Install

```bash
npm install @agenticdiagrams/schema
```

## Usage

### Types

```ts
import type { AgenticYaml, AgenticNode, AgenticEdge } from '@agenticdiagrams/schema';
```

### Validation

Validate a parsed YAML object against the schema:

```ts
import * as yaml from 'js-yaml';
import { validate } from '@agenticdiagrams/schema';

const doc = yaml.load(yamlString);
const result = validate(doc);

if (!result.valid) {
  console.error(result.errors);
}
```

### JSON Schema

Use the JSON Schema directly for editor support or other tools:

```ts
import schema from '@agenticdiagrams/schema/schema.json';
```

Or reference it by URL: `https://agenticdiagrams.com/schemas/agentic/0.1.json`

## What's in the box

| Export | Description |
|--------|-------------|
| `AgenticYaml` | Root document type |
| `AgenticNode` | Node definition |
| `AgenticEdge` | Edge (connection) definition |
| `AgenticScenario` | Flow scenario with steps |
| `AgenticLayout` | Layout hints (positions, sizes, styles) |
| `validate()` | Structural validation against JSON Schema |

## Spec

See the full [Agentic YAML Specification v0.1](docs/spec.md).

## Examples

The [`examples/`](examples/) directory contains complete `.agentic.yaml` files:

- **[simple-agent](examples/simple-agent.agentic.yaml)** — Support bot with knowledge base search
- **[multi-agent-with-guardrails](examples/multi-agent-with-guardrails.agentic.yaml)** — Pipeline with input/output guardrails and human approval
- **[kitchen-manager](examples/kitchen-manager.agentic.yaml)** — Multi-agent system with MCP tools and parallel scenarios

## Minimum valid document

```yaml
agentic: "0.1"
```

A practical minimum:

```yaml
agentic: "0.1"
nodes:
  my-agent:
    type: agent
    edges:
      - to: my-tool
  my-tool:
    type: tool
    sub_type: mcp
```

## License

MIT
