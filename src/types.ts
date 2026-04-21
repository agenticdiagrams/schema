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
  description?: string;
  sub_type?: string;
  url?: string;
  group?: string;
  linked_diagram?: string;
  is_looping?: boolean;
  auth?: string;
  auth_detail?: string;
  provider?: string;
  content?: string;
  example_response?: string;
  edges?: AgenticInlineEdge[];
  /** Retention lifetime — primarily for memory nodes. Preset values: 'session' | '24h' | 'permanent'. Freeform strings (e.g. '7d') are accepted. */
  ttl?: string;
  /** Audience scope — primarily for memory nodes. Preset values: 'per-user' | 'per-session' | 'global'. Freeform strings accepted. */
  scope?: string;
}

export interface AgenticInlineEdge {
  to: string;
  type?: string;
  label?: string;
  animated?: boolean;
  path?: string;
  source_handle?: string;
  target_handle?: string;
}

export interface AgenticEdge {
  from: string;
  to: string;
  type?: string;
  label?: string;
  animated?: boolean;
  path?: string;
  source_handle?: string;
  target_handle?: string;
}

export interface AgenticStep {
  from: string;
  to: string;
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
