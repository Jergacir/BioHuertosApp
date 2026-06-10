/**
 * Propiedad 5: Validación de Nombre — Biohuertos y Parcelas
 * Valida: Requirements 3.7, 8.4
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { validarNombre } from '../biohuertos';

describe('Propiedad 5: validarNombre', () => {
  it('Test 1: strings válidos (1-100 chars no vacíos al trim) → { valido: true }', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (nombre) => {
          const result = validarNombre(nombre);
          expect(result.valido).toBe(true);
          expect(result.error).toBeUndefined();
        }
      )
    );
  });

  it('Test 2: strings de solo espacios → { valido: false, error: string }', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant(' '), { minLength: 1, maxLength: 100 }).map(arr => arr.join('')),
        (nombre) => {
          const result = validarNombre(nombre);
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        }
      )
    );
  });

  it('Test 3: strings cuyo trim() supera 100 chars → { valido: false, error: string }', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 300 }).filter(s => s.trim().length > 100),
        (nombre) => {
          const result = validarNombre(nombre);
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        }
      )
    );
  });
});
