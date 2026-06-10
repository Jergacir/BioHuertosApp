/**
 * Propiedad 6: Validación de Área — Valor Positivo
 *
 * Valida: Requirements 3.8, 8.5
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { validarArea } from '../biohuertos';

describe('Propiedad 6: validarArea', () => {
  it('Test 1: números positivos finitos > 0 → { valido: true }', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(1e6), noNaN: true }),
        (area) => {
          // fc.float with min: 0.01 always produces values > 0
          const result = validarArea(area);
          expect(result.valido).toBe(true);
        }
      )
    );
  });

  it('Test 2: valores <= 0 (incluyendo 0 y negativos) → { valido: false }', () => {
    fc.assert(
      fc.property(
        fc.float({ max: 0, noNaN: true }),
        (area) => {
          const result = validarArea(area);
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
        }
      )
    );
  });

  it('Test 3: NaN e Infinity → { valido: false }', () => {
    for (const area of [NaN, Infinity, -Infinity]) {
      const result = validarArea(area);
      expect(result.valido).toBe(false);
      expect(result.error).toBeDefined();
    }
  });
});
