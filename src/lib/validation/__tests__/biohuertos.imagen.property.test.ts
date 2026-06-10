/**
 * Propiedad 15: Validación de Imagen por Tipo y Tamaño
 * Valida: Requirements 13.1, 13.4
 */
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { validarImagenArchivo } from '../biohuertos';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

describe('Propiedad 15: validarImagenArchivo', () => {
  it('Test 1: tipo válido + tamaño <= 5MB → { valido: true }', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        fc.integer({ min: 1, max: MAX_SIZE }),
        (tipo, tamanio) => {
          const result = validarImagenArchivo(tipo, tamanio);
          expect(result.valido).toBe(true);
        }
      )
    );
  });

  it('Test 2: tipo inválido + tamaño válido → { valido: false }', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(
          s => !['image/jpeg', 'image/png', 'image/webp'].includes(s)
        ),
        fc.integer({ min: 1, max: MAX_SIZE }),
        (tipo, tamanio) => {
          const result = validarImagenArchivo(tipo, tamanio);
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
        }
      )
    );
  });

  it('Test 3: tipo válido + tamaño > 5MB → { valido: false }', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        fc.integer({ min: MAX_SIZE + 1, max: 15 * 1024 * 1024 }),
        (tipo, tamanio) => {
          const result = validarImagenArchivo(tipo, tamanio);
          expect(result.valido).toBe(false);
          expect(result.error).toBeDefined();
        }
      )
    );
  });
});
