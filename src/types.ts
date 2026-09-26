/**
 * TypeScript types matching the agentic YAML spec v0.1.
 * These represent the parsed YAML structure, not any editor-specific model.
 */

export interface AgenticYaml {
  agentic: '0.1';
  diagram?: AgenticDiagram;
  nodes?: Record<string, AgenticNode>;
  edges?: AgenticEdge[];
  scenarios?: Record<string, AgenticScenario>;
  layout?: AgenticLayout;
}

export interface AgenticDiagram {
  name?: string;
  description?: string;
  type?: 'system' | 'component';
  active_scenario?: string;
  parent_diagram?: string;
  created?: string;
  updated?: string;
}

export interface AgenticNode {
  type: string;
  label?: string;
  sub_title?: string;
  /** Short tag shown on the node, e.g. `NEW` or `beta`. */
  badge?: string;
  description?: string;
  sub_type?: string;
  url?: string;
  group?: string;
  linked_diagram?: string;
  is_looping?: boolean;
  auth?: string;
  auth_detail?: string;
  provider?: string;
  /** Model identifier, e.g. `claude-sonnet-4-6` — primarily for agent and model nodes. */
  model?: string;
  content?: string;
  example_response?: string;
  /** Input schema, usually JSON Schema serialised as a string — primarily for tool nodes. */
  input_schema?: string;
  /** Output schema, usually JSON Schema serialised as a string — primarily for tool nodes. */
  output_schema?: string;
  edges?: AgenticInlineEdge[];
  /** Retention lifetime — primarily for memory nodes. Preset values: 'session' | '24h' | 'permanent'. Freeform strings (e.g. '7d') are accepted. */
  ttl?: string;
  /** Audience scope — primarily for memory nodes. Preset values: 'per-user' | 'per-session' | 'global'. Freeform strings accepted. */
  scope?: string;
  /** Freeform properties the spec does not model (extra typed fields, editor hints). */
  metadata?: AgenticNodeMetadata;
}

/**
 * Freeform node properties the spec does not model — extra typed fields or
 * editor hints — so an editor can round-trip them without a schema change.
 * Values are limited to strings, numbers and booleans.
 */
export interface AgenticNodeMetadata {
  [key: string]: string | number | boolean;
}

/**
 * Freeform presentation hints for an edge (editor cosmetics). Known keys are
 * typed; unknown keys are allowed so the editor can stash additional hints
 * without a schema change.
 */
export interface AgenticEdgeMetadata {
  /** Label position along the edge as a fraction of its length (0 = source end, 1 = target end). Defaults to 0.5. */
  label_pos?: number;
  [key: string]: unknown;
}

/** Which ends of an edge show an arrowhead. Defaults to `'end'` (arrow at the target). */
export type AgenticEdgeArrows = 'none' | 'start' | 'end' | 'both';

export interface AgenticInlineEdge {
  to: string;
  type?: string;
  label?: string;
  condition?: string;
  animated?: boolean;
  arrows?: AgenticEdgeArrows;
  path?: string;
  source_handle?: string;
  target_handle?: string;
  metadata?: AgenticEdgeMetadata;
}

export interface AgenticEdge {
  from: string;
  to: string;
  type?: string;
  label?: string;
  condition?: string;
  animated?: boolean;
  arrows?: AgenticEdgeArrows;
  path?: string;
  source_handle?: string;
  target_handle?: string;
  metadata?: AgenticEdgeMetadata;
}

/** Fields shared by both step forms. */
export interface AgenticStepDetail {
  type?: string;
  label?: string;
  payload?: string;
  duration?: number;
  fragment?: {
    type: 'alt' | 'opt' | 'loop' | 'par';
    label?: string;
    position: 'start' | 'else' | 'end';
  };
  note?: {
    text: string;
    position: 'left' | 'right' | 'over';
  };
}

/** A step that is a message between two nodes. */
export interface AgenticMessageStep extends AgenticStepDetail {
  from: string;
  to: string;
  nodes?: never;
}

/** A step that highlights nodes together — one node, or more than two. */
export interface AgenticHighlightStep extends AgenticStepDetail {
  /** Node ids highlighted at this step (at least one, no duplicates). */
  nodes: string[];
  from?: never;
  to?: never;
}

/** A playback step: a `from`/`to` message or a `nodes` highlight, never both. */
export type AgenticStep = AgenticMessageStep | AgenticHighlightStep;

export interface AgenticScenario {
  name: string;
  description?: string;
  steps?: AgenticStep[];
}

export interface AgenticNodeStyle {
  borderless?: boolean;
  icon_url?: string;
  icon_layout?: string;
  image_url?: string;
}

export interface AgenticLayout {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  viewport?: [number, number, number];
  positions?: Record<string, [number, number]>;
  sizes?: Record<string, [number, number]>;
  node_styles?: Record<string, AgenticNodeStyle>;
}
