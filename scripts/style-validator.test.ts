/**
 * style-validator.test.ts — Tests for ontology naming convention validation
 */

import { describe, it, expect } from 'vitest';
import { validateOntologyStyle } from './style-validator';
import type { Ontology } from '../src/types/ontology';

describe('Style Validator', () => {
  describe('Class naming (PascalCase or camelCase)', () => {
    it('should accept PascalCase class names', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {
          'e1': { id: 'e1', label: 'Customer', comment: '', icon: '👤', color: '#000000' },
          'e2': { id: 'e2', label: 'CustomerOrder', comment: '', icon: '📦', color: '#000000' },
        },
        dataProperties: {},
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(0);
    });

    it('should accept camelCase class names', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {
          'e1': { id: 'e1', label: 'customer', comment: '', icon: '👤', color: '#000000' },
        },
        dataProperties: {},
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(0);
    });

    it('should reject snake_case class names', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {
          'e1': { id: 'e1', label: 'customer_order', comment: '', icon: '👤', color: '#000000' },
        },
        dataProperties: {},
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('PascalCase or camelCase');
    });
  });

  describe('Data property naming (snake_case)', () => {
    it('should accept snake_case data properties', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {},
        dataProperties: {
          'p1': {
            id: 'p1',
            label: 'first_name',
            domain: 'e1',
            range: 'http://www.w3.org/2001/XMLSchema#string',
            comment: '',
          },
        },
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(0);
    });

    it('should reject PascalCase data properties', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {},
        dataProperties: {
          'p1': {
            id: 'p1',
            label: 'FirstName',
            domain: 'e1',
            range: 'http://www.w3.org/2001/XMLSchema#string',
            comment: '',
          },
        },
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('snake_case');
    });

    it('should reject camelCase data properties', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {},
        dataProperties: {
          'p1': {
            id: 'p1',
            label: 'firstName',
            domain: 'e1',
            range: 'http://www.w3.org/2001/XMLSchema#string',
            comment: '',
          },
        },
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('snake_case');
    });
  });

  describe('Spell checking', () => {
    it('should detect common typos in class labels', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {
          'e1': { id: 'e1', label: 'Obeservation', comment: '', icon: '📝', color: '#000000' },
        },
        dataProperties: {},
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors.some(e => e.message.includes('Obeservation'))).toBe(true);
    });

    it('should detect common typos in property labels', () => {
      const ontology: Ontology = {
        uri: 'http://example.org/test',
        label: 'Test',
        comment: '',
        entities: {},
        dataProperties: {
          'p1': {
            id: 'p1',
            label: 'chnage_time',
            domain: 'e1',
            range: 'http://www.w3.org/2001/XMLSchema#dateTime',
            comment: '',
          },
        },
        objectProperties: {},
      };
      const errors = validateOntologyStyle(ontology);
      expect(errors.some(e => e.message.includes('chnage'))).toBe(true);
    });
  });

  describe('Baby Routine Tracking ontology', () => {
    it('should pass validation after fixes', () => {
      // Simulating the fixed baby routine tracking ontology
      const ontology: Ontology = {
        uri: 'http://example.org/ontology/baby-routine-tracking/',
        label: 'Baby Routine Tracking',
        comment: 'Models a baby\'s daily routine...',
        entities: {
          'e1': { id: 'e1', label: 'Baby', comment: '', icon: '👤', color: '#5C2D91' },
          'e2': { id: 'e2', label: 'CareGiver', comment: '', icon: '👤', color: '#FFB900' },
          'e3': { id: 'e3', label: 'Activity', comment: '', icon: '📈', color: '#107C10' },
          'e4': { id: 'e4', label: 'Observation', comment: '', icon: '📝', color: '#00A9E0' }, // Fixed typo
          'e5': { id: 'e5', label: 'sleep', comment: '', icon: '⚡', color: '#FFB900' },
          'e6': { id: 'e6', label: 'feeding', comment: '', icon: '⚡', color: '#E81123' },
          'e7': { id: 'e7', label: 'DiaperChange', comment: '', icon: '⚡', color: '#008272' },
          'e8': { id: 'e8', label: 'RoutinePattern', comment: '', icon: '📋', color: '#D83B01' },
        },
        dataProperties: {
          'p1': { id: 'p1', label: 'baby_id', domain: 'e1', range: 'http://www.w3.org/2001/XMLSchema#integer', comment: '' },
          'p2': { id: 'p2', label: 'baby_name', domain: 'e1', range: 'http://www.w3.org/2001/XMLSchema#string', comment: '' },
          'p3': { id: 'p3', label: 'caregiver_id', domain: 'e2', range: 'http://www.w3.org/2001/XMLSchema#integer', comment: '' },
          'p4': { id: 'p4', label: 'activity_id', domain: 'e3', range: 'http://www.w3.org/2001/XMLSchema#string', comment: '' },
          'p5': { id: 'p5', label: 'observation_id', domain: 'e4', range: 'http://www.w3.org/2001/XMLSchema#string', comment: '' },
          'p6': { id: 'p6', label: 'change_time', domain: 'e7', range: 'http://www.w3.org/2001/XMLSchema#dateTime', comment: '' }, // Fixed typo
          'p7': { id: 'p7', label: 'feeding_quantity', domain: 'e6', range: 'http://www.w3.org/2001/XMLSchema#integer', comment: '' }, // Fixed case
        },
        objectProperties: {
          'op1': { id: 'op1', label: 'is_a', domain: 'e5', range: 'e3', comment: '', cardinality: 'many-to-one' },
          'op2': { id: 'op2', label: 'has_observation', domain: 'e3', range: 'e4', comment: '', cardinality: 'one-to-many' },
          'op3': { id: 'op3', label: 'monitors', domain: 'e2', range: 'e1', comment: '', cardinality: 'one-to-one' },
        },
      };
      const errors = validateOntologyStyle(ontology);
      // Should have no errors after fixes
      expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
  });
});
