import { describe, it, expect } from 'vitest';
import { validate } from './validate';

describe('validate', () => {
  it('accepts a minimal valid document', () => {
    const result = validate({ agentic: '0.1' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a full document with nodes, edges, and scenarios', () => {
    const result = validate({
      agentic: '0.1',
      diagram: {
        name: 'Test Diagram',
        type: 'system',
      },
      nodes: {
        'agent-1': { type: 'agent', label: 'My Agent' },
        'tool-1': { type: 'tool', sub_type: 'mcp' },
      },
      edges: [{ from: 'agent-1', to: 'tool-1', type: 'request' }],
      scenarios: {
        'flow-1': {
          name: 'Happy Path',
          steps: [
            { from: 'agent-1', to: 'tool-1', label: 'Call tool' },
            { from: 'tool-1', to: 'agent-1', type: 'return', label: 'Result' },
          ],
        },
      },
      layout: {
        direction: 'TB',
        positions: { 'agent-1': [100, 200], 'tool-1': [100, 400] },
        sizes: { 'agent-1': [220, 100] },
      },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts inline edges on nodes', () => {
    const result = validate({
      agentic: '0.1',
      nodes: {
        a: {
          type: 'agent',
          edges: [{ to: 'b', type: 'async' }],
        },
        b: { type: 'tool' },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts edge metadata with label_pos', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a', to: 'b', metadata: { label_pos: 0.72 } }],
    });
    expect(result.valid).toBe(true);
  });

  it('accepts edge metadata with unknown keys', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a', to: 'b', metadata: { label_pos: 0.5, future_hint: 'x' } }],
    });
    expect(result.valid).toBe(true);
  });

  it('rejects label_pos out of range', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a', to: 'b', metadata: { label_pos: 1.5 } }],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts all node types', () => {
    const types = [
      'agent',
      'tool',
      'component',
      'backend',
      'generic',
      'note',
      'system',
      'memory',
      'gateway',
      'skill',
      'channel',
      'waypoint',
      'router',
      'human',
      'trigger',
      'guardrail',
      'model',
      'aggregator',
      'observability',
      'group',
      'block',
      'image',
      'prompt',
      'user',
      'output',
      'knowledge_base',
      'environment',
      'text_label',
      'divider',
    ];
    for (const type of types) {
      const result = validate({
        agentic: '0.1',
        nodes: { n: { type } },
      });
      expect(result.valid, `node type "${type}" should be valid`).toBe(true);
    }
  });

  it('rejects missing agentic version', () => {
    const result = validate({ nodes: {} });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('agentic'))).toBe(true);
  });

  it('rejects wrong version', () => {
    const result = validate({ agentic: '2.0' });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid node type', () => {
    const result = validate({
      agentic: '0.1',
      nodes: { n: { type: 'not_a_real_type' } },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects edge missing from', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ to: 'b' }],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects edge missing to', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a' }],
    });
    expect(result.valid).toBe(false);
  });

  it('rejects unknown top-level properties', () => {
    const result = validate({
      agentic: '0.1',
      unknown_field: true,
    });
    expect(result.valid).toBe(false);
  });

  it('accepts scenario with fragments and notes', () => {
    const result = validate({
      agentic: '0.1',
      nodes: {
        a: { type: 'agent' },
        b: { type: 'tool' },
      },
      scenarios: {
        flow: {
          name: 'Flow',
          steps: [
            {
              from: 'a',
              to: 'b',
              fragment: { type: 'loop', label: 'Retry', position: 'start' },
              note: { text: 'Important', position: 'right' },
            },
            {
              from: 'b',
              to: 'a',
              type: 'return',
              fragment: { type: 'loop', position: 'end' },
            },
          ],
        },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts node style properties', () => {
    const result = validate({
      agentic: '0.1',
      nodes: { a: { type: 'agent' } },
      layout: {
        node_styles: {
          a: {
            borderless: true,
            icon_url: 'https://example.com/icon.png',
            icon_layout: 'left',
          },
        },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts badge, model, input_schema and output_schema on nodes', () => {
    const result = validate({
      agentic: '0.1',
      nodes: {
        planner: { type: 'agent', badge: 'NEW', model: 'claude-sonnet-4-6' },
        search: {
          type: 'tool',
          input_schema: '{"type":"object","properties":{"q":{"type":"string"}}}',
          output_schema: '{"type":"array"}',
        },
      },
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('accepts node metadata with string, number and boolean values', () => {
    const result = validate({
      agentic: '0.1',
      nodes: {
        a: { type: 'agent', metadata: { region: 'us', replicas: 3, subAgent: true } },
      },
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('rejects node metadata with nested object or array values', () => {
    for (const value of [{ nested: 'x' }, ['x'], null]) {
      const result = validate({
        agentic: '0.1',
        nodes: { a: { type: 'agent', metadata: { bad: value } } },
      });
      expect(result.valid).toBe(false);
    }
  });

  it('accepts the data, control, stream and tool edge types', () => {
    const result = validate({
      agentic: '0.1',
      nodes: {
        a: { type: 'agent', edges: [{ to: 'b', type: 'tool' }] },
        b: { type: 'tool' },
      },
      edges: [
        { from: 'a', to: 'b', type: 'data' },
        { from: 'a', to: 'b', type: 'control' },
        { from: 'a', to: 'b', type: 'stream' },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('still rejects an unknown edge type', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a', to: 'b', type: 'telepathy' }],
    });
    expect(result.valid).toBe(false);
  });

  it('accepts slot handles at any whole-number percentage', () => {
    const result = validate({
      agentic: '0.1',
      edges: [{ from: 'a', to: 'b', source_handle: 'right-37', target_handle: 'left-63-t' }],
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('accepts steps that highlight a nodes list, alongside from/to steps', () => {
    const result = validate({
      agentic: '0.1',
      scenarios: {
        flow: {
          name: 'Flow',
          steps: [
            { nodes: ['a'], label: 'Start at a' },
            { from: 'a', to: 'b', label: 'Call b' },
            { nodes: ['a', 'b', 'c'], type: 'event', payload: '{"fan":"out"}', duration: 900 },
          ],
        },
      },
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('rejects a step that mixes nodes with from or to', () => {
    for (const step of [
      { nodes: ['a'], from: 'a', to: 'b' },
      { nodes: ['a'], from: 'a' },
      { nodes: ['a'], to: 'b' },
    ]) {
      const result = validate({
        agentic: '0.1',
        scenarios: { flow: { name: 'Flow', steps: [step] } },
      });
      expect(result.valid).toBe(false);
    }
  });

  it('rejects a step with neither a from/to pair nor nodes', () => {
    for (const step of [{ label: 'nothing' }, { from: 'a' }, { to: 'b' }]) {
      const result = validate({
        agentic: '0.1',
        scenarios: { flow: { name: 'Flow', steps: [step] } },
      });
      expect(result.valid).toBe(false);
    }
  });

  it('rejects an empty or duplicated nodes list', () => {
    for (const nodes of [[], ['a', 'a']]) {
      const result = validate({
        agentic: '0.1',
        scenarios: { flow: { name: 'Flow', steps: [{ nodes }] } },
      });
      expect(result.valid).toBe(false);
    }
  });

  it('returns structured error messages', () => {
    const result = validate({ agentic: '0.1', edges: 'not-an-array' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('/edges');
  });
});
