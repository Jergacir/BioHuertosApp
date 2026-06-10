/**
 * Propiedad 7: Validación de Área de Parcela vs. Biohuerto
 * Valida: Requirements 8.2, 9.2, 11.1, 11.2
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { calcularDisponibilidadArea } from '../biohuertos';

describe('Propiedad 7: calcularDisponibilidadArea', () => {
  it('Test 1: sumaExistentes + areaNueva > areaBiohuerto → { valido: false, disponible: X }', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10), max: Math.fround(1000), noNaN: true }),   // areaBiohuerto
        fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), { minLength: 1, maxLength: 10 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(500), noNaN: true }),   // areaNueva
        (areaBiohuerto, areasExistentes, areaNueva) => {
          const sumaExistentes = areasExistentes.reduce((a, b) => a + b, 0);
          // Only test when it actually exceeds
          if (sumaExistentes + areaNueva > areaBiohuerto) {
            const result = calcularDisponibilidadArea(areaBiohuerto, areasExistentes, areaNueva);
            expect(result.valido).toBe(false);
            expect(result.disponible).toBeCloseTo(areaBiohuerto - sumaExistentes, 5);
          }
        }
      )
    );
  });

  it('Test 2: sumaExistentes + areaNueva <= areaBiohuerto → { valido: true }', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(100), max: Math.fround(5000), noNaN: true }), // areaBiohuerto
        fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }), { minLength: 0, maxLength: 5 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }),   // areaNueva
        (areaBiohuerto, areasExistentes, areaNueva) => {
          const sumaExistentes = areasExistentes.reduce((a, b) => a + b, 0);
          if (sumaExistentes + areaNueva <= areaBiohuerto) {
            const result = calcularDisponibilidadArea(areaBiohuerto, areasExistentes, areaNueva);
            expect(result.valido).toBe(true);
          }
        }
      )
    );
  });

  it('Test 3: disponible reportado es siempre areaBiohuerto - sumaExistentes', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10), max: Math.fround(5000), noNaN: true }),
        fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), { minLength: 0, maxLength: 10 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
        (areaBiohuerto, areasExistentes, areaNueva) => {
          const sumaExistentes = areasExistentes.reduce((a, b) => a + b, 0);
          const result = calcularDisponibilidadArea(areaBiohuerto, areasExistentes, areaNueva);
          expect(result.disponible).toBeCloseTo(areaBiohuerto - sumaExistentes, 5);
        }
      )
    );
  });
});
