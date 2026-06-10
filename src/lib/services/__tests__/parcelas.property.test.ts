/**
 * Propiedad 4: Invariante de Creación de Parcela — Campos de Estado Correctos
 * Valida: Requirements 8.3
 *
 * Verifica que cualquier payload de creación válido resulta en:
 *   - activo = true
 *   - biohuerto_id = B.id
 *   - fecha_eliminacion no se establece (NULL)
 */
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ParcelaFormPayload } from '@/types';

// ─── Mock de db ───────────────────────────────────────────────────────────────
// Se mockeamos ANTES de importar el servicio para que vi.mock() intercepte
// el módulo "@/lib/db" antes de que parcelas.ts lo use.

vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

// Importar DESPUÉS del mock
import { crearParcela } from '../parcelas';
import { db } from '@/lib/db';

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Extrae el texto SQL completo de los argumentos del template literal
 * que recibe db.$queryRaw. Prisma pasa un TemplateStringsArray como
 * primer argumento y los valores interpolados como argumentos siguientes.
 */
function extractSqlText(callArgs: unknown[]): string {
  // callArgs[0] es el TemplateStringsArray (array de strings fijos)
  const strings = callArgs[0] as TemplateStringsArray;
  return Array.from(strings).join(' ??? ');
}

/**
 * Devuelve todos los valores interpolados en la llamada a $queryRaw
 * (los argumentos 1..N después del TemplateStringsArray).
 */
function extractSqlValues(callArgs: unknown[]): unknown[] {
  return callArgs.slice(1);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Propiedad 4: Invariante de Creación de Parcela — Campos de Estado Correctos', () => {
  const mockQueryRaw = db.$queryRaw as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, la llamada a $queryRaw retorna un UUID falso
    mockQueryRaw.mockResolvedValue([{ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }]);
  });

  it('Test 1: el SQL de inserción siempre incluye activo = true', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          biohuertoId: fc.uuid(),
          nombreIdentificador: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          areaMetrosCuadrados: fc.float({ min: 0.01, max: 1000, noNaN: true }),
        }),
        async (payload: ParcelaFormPayload) => {
          vi.clearAllMocks();
          mockQueryRaw.mockResolvedValue([{ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }]);

          await crearParcela(payload);

          expect(mockQueryRaw).toHaveBeenCalledOnce();
          const sqlText = extractSqlText(mockQueryRaw.mock.calls[0]);

          // El SQL debe mencionar el valor booleano true para el campo activo
          expect(sqlText.toLowerCase()).toMatch(/true/);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Test 2: el SQL de inserción NO contiene fecha_eliminacion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          biohuertoId: fc.uuid(),
          nombreIdentificador: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          areaMetrosCuadrados: fc.float({ min: 0.01, max: 1000, noNaN: true }),
        }),
        async (payload: ParcelaFormPayload) => {
          vi.clearAllMocks();
          mockQueryRaw.mockResolvedValue([{ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }]);

          await crearParcela(payload);

          expect(mockQueryRaw).toHaveBeenCalledOnce();
          const sqlText = extractSqlText(mockQueryRaw.mock.calls[0]);

          // El SQL NO debe referenciar fecha_eliminacion en absoluto
          expect(sqlText.toLowerCase()).not.toContain('fecha_eliminacion');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Test 3: el biohuertoId del payload se pasa como valor interpolado en el SQL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          biohuertoId: fc.uuid(),
          nombreIdentificador: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          areaMetrosCuadrados: fc.float({ min: 0.01, max: 1000, noNaN: true }),
        }),
        async (payload: ParcelaFormPayload) => {
          vi.clearAllMocks();
          mockQueryRaw.mockResolvedValue([{ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }]);

          await crearParcela(payload);

          expect(mockQueryRaw).toHaveBeenCalledOnce();
          const values = extractSqlValues(mockQueryRaw.mock.calls[0]);

          // El biohuertoId debe aparecer entre los valores interpolados
          expect(values).toContain(payload.biohuertoId);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Test 4: la función retorna el UUID generado por la BD', async () => {
    const fakeId = 'ffffffff-0000-1111-2222-333333333333';

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          biohuertoId: fc.uuid(),
          nombreIdentificador: fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          areaMetrosCuadrados: fc.float({ min: 0.01, max: 1000, noNaN: true }),
        }),
        async (payload: ParcelaFormPayload) => {
          vi.clearAllMocks();
          mockQueryRaw.mockResolvedValue([{ id: fakeId }]);

          const result = await crearParcela(payload);

          expect(result).toBe(fakeId);
        }
      ),
      { numRuns: 50 }
    );
  });
});
