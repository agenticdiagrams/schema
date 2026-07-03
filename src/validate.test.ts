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

  it('returns structured error messages', () => {
    const result = validate({ agentic: '0.1', edges: 'not-an-array' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('/edges');
  });

  it('exposes structured issues alongside the flattened strings', () => {
    const result = validate({ agentic: '0.1', edges: 'not-an-array' });
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBe(result.errors.length);
    const issue = result.issues[0];
    expect(issue.path).toBe('/edges');
    expect(issue.keyword).toBe('type');
    expect(typeof issue.message).toBe('string');
    expect(issue.params).toBeTypeOf('object');
    // The flattened string is derived from the structured issue.
    expect(result.errors[0]).toBe(`${issue.path}: ${issue.message}`);
  });

  it('surfaces the failed keyword for an enum violation', () => {
    const result = validate({
      agentic: '0.1',
      nodes: { n: { type: 'not_a_real_type' } },
    });
    expect(result.valid).toBe(false);
    const enumIssue = result.issues.find((i) => i.keyword === 'enum');
    expect(enumIssue).toBeDefined();
    expect(Array.isArray(enumIssue?.params.allowedValues)).toBe(true);
  });

  it('reports no issues for a valid document', () => {
    const result = validate({ agentic: '0.1' });
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
