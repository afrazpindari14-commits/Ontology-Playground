/**
 * style-validator.ts — Validate ontology naming conventions and style
 *
 * Enforces:
 * - Class labels: PascalCase or camelCase (not snake_case)
 * - Property labels: snake_case (not PascalCase/camelCase)
 * - Common typos (spell checking)
 */

import type { Ontology } from '../src/types/ontology.js';

export interface StyleError {
  entity: string;
  label: string;
  message: string;
  severity: 'error' | 'warning';
}

// Common misspellings to catch
const COMMON_TYPOS: Record<string, string> = {
  'Obeservation': 'Observation',
  'chnage': 'change',
  'chagne': 'change',
  'exprience': 'experience',
  'occured': 'occurred',
  'recieve': 'receive',
  'wich': 'which',
  'taht': 'that',
  'teh': 'the',
  'lenght': 'length',
  'hieght': 'height',
};

// Patterns for naming conventions
const PASCAL_CASE_RE = /^[A-Z][a-zA-Z0-9]*(?:[A-Z][a-z0-9]*)*$/;
const CAMEL_CASE_RE = /^[a-z][a-zA-Z0-9]*(?:[A-Z][a-z0-9]*)*$/;
const SNAKE_CASE_RE = /^[a-z][a-z0-9_]*[a-z0-9]$|^[a-z0-9]$/;

function isPascalCase(str: string): boolean {
  return PASCAL_CASE_RE.test(str);
}

function isCamelCase(str: string): boolean {
  return CAMEL_CASE_RE.test(str);
}

function isSnakeCase(str: string): boolean {
  return SNAKE_CASE_RE.test(str);
}

function checkSpelling(label: string): string | null {
  for (const [typo, correct] of Object.entries(COMMON_TYPOS)) {
    if (label.includes(typo)) {
      return `Possible typo: "${typo}" → "${correct}"`;
    }
  }
  return null;
}

export function validateOntologyStyle(ontology: Ontology): StyleError[] {
  const errors: StyleError[] = [];

  // Validate class labels (should be PascalCase or camelCase)
  for (const entityId in ontology.entities) {
    const entity = ontology.entities[entityId];
    const label = entity.label;

    // Spell check
    const typoMessage = checkSpelling(label);
    if (typoMessage) {
      errors.push({
        entity: entityId,
        label,
        message: typoMessage,
        severity: 'error',
      });
    }

    // Class naming: should NOT be snake_case
    if (isSnakeCase(label) && !isPascalCase(label) && !isCamelCase(label)) {
      errors.push({
        entity: entityId,
        label,
        message: `Class label should be PascalCase or camelCase, not snake_case: "${label}"`,
        severity: 'error',
      });
    }
  }

  // Validate data property labels (should be snake_case)
  for (const propId in ontology.dataProperties) {
    const prop = ontology.dataProperties[propId];
    const label = prop.label;

    // Spell check
    const typoMessage = checkSpelling(label);
    if (typoMessage) {
      errors.push({
        entity: propId,
        label,
        message: typoMessage,
        severity: 'error',
      });
    }

    // Data property naming: should be snake_case
    if (!isSnakeCase(label)) {
      errors.push({
        entity: propId,
        label,
        message: `Data property should be snake_case: "${label}" (use underscores, no spaces or camelCase)`,
        severity: 'error',
      });
    }
  }

  // Validate object property labels (should be snake_case)
  for (const propId in ontology.objectProperties) {
    const prop = ontology.objectProperties[propId];
    const label = prop.label;

    // Spell check
    const typoMessage = checkSpelling(label);
    if (typoMessage) {
      errors.push({
        entity: propId,
        label,
        message: typoMessage,
        severity: 'error',
      });
    }

    // Object property naming: should be snake_case or verb-like phrases
    // Allow common patterns like "is_a", "has_many", "belongs_to"
    if (!isSnakeCase(label) && !['is', 'has', 'belongs', 'performs', 'monitors', 'logs', 'derived'].some(v => label.toLowerCase().startsWith(v))) {
      // This is a warning since some properties use different conventions
      if (isPascalCase(label) || isCamelCase(label)) {
        errors.push({
          entity: propId,
          label,
          message: `Relationship label should prefer snake_case: "${label}"`,
          severity: 'warning',
        });
      }
    }
  }

  return errors;
}
