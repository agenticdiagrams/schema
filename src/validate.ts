import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from '../schema/agentic.v0.1.json';

/**
 * A single validation failure, in structured form for programmatic handling
 * (e.g. mapping an error back to a form field or diagram element). Decoupled
 * from Ajv's own error type so consumers don't take an ajv dependency.
 */
export interface ValidationIssue {
  /** JSON Pointer to the offending value (`'/'` for the document root). */
  path: string;
  /** Human-readable description of what failed. */
  message: string;
  /** The failed schema keyword, e.g. `'type'`, `'required'`, `'enum'`. */
  keyword: string;
  /** Keyword-specific detail, e.g. `{ allowedValues }` or `{ missingProperty }`. */
  params: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  /**
   * Flattened `"<path>: <message>"` strings — the stable, human-facing form.
   * Retained for backwards compatibility; prefer {@link ValidationIssue} for
   * programmatic handling.
   */
  errors: string[];
  /** Structured, per-failure detail. Empty when {@link ValidationResult.valid}. */
  issues: ValidationIssue[];
}

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const compiledValidate = ajv.compile(schema);

/**
 * Validate a parsed YAML object against the agentic schema v0.1.
 *
 * This validates structure only — it does not parse YAML strings.
 * Use your preferred YAML parser (js-yaml, yaml, etc.) first.
 *
 * @example
 * ```ts
 * import * as yaml from 'js-yaml';
 * import { validate } from '@agenticdiagrams/schema';
 *
 * const doc = yaml.load(yamlString);
 * const result = validate(doc);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validate(data: unknown): ValidationResult {
  const valid = compiledValidate(data);

  if (valid) {
    return { valid: true, errors: [], issues: [] };
  }

  const issues: ValidationIssue[] = (compiledValidate.errors ?? []).map((err) => ({
    path: err.instancePath || '/',
    message: err.message || 'unknown error',
    keyword: err.keyword,
    params: (err.params ?? {}) as Record<string, unknown>,
  }));

  const errors = issues.map((issue) => `${issue.path}: ${issue.message}`);

  return { valid: false, errors, issues };
}
