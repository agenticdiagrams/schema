import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from '../schema/agentic.v0.1.json';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
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
    return { valid: true, errors: [] };
  }

  const errors = (compiledValidate.errors ?? []).map((err) => {
    const path = err.instancePath || '/';
    const message = err.message || 'unknown error';
    return `${path}: ${message}`;
  });

  return { valid: false, errors };
}
