/**
 * Propiedades de Corrección — Servicio biohuertos.ts
 *
 * Propiedad 1: Aislamiento de Datos por Usuario — Solo Activos
 * Valida: Requirements 2.1, 5.3, 14.5
 *
 * Propiedad 2: Ordenamiento de Listado por Fecha
 * Valida: Requirements 2.5
 *
 * Propiedad 3: Invariante de Creación — Campos de Estado Correctos
 * Valida: Requirements 3.6
 *
 * Propiedad 8: Eliminación Lógica en Cascada — Biohuerto y Parcelas
 * Valida: Requirements 5.2
 */

import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock @/lib/db ────────────────────────────────────────────────────────────
// All methods used by biohuertos.ts are stubbed here so every test can
// control behaviour without touching a real database.

vi.mock('@/lib/db', () => {
  return {
    db: {
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
      $transaction: vi.fn(),
      parcela: {
        updateMany: vi.fn(),
      },
      biohuerto: {
        update: vi.fn(),
      },
    },
  };
});

import { db } from '@/lib/db';
import {
  listarBiohuertosActivosDeUsuario,
  crearBiohuerto,
  eliminarBiohuerto,
} from '../biohuertos';

// Typed aliases for the mocked functions
const mockQueryRaw    = db.$queryRaw    as ReturnType<typeof vi.fn>;
const mockTransaction = db.$transaction as ReturnType<typeof vi.fn>;
const mockUpdateMany  = (db as unknown as { parcela:   { updateMany: ReturnType<typeof vi.fn> } }).parcela.updateMany;
const mockUpdate      = (db as unknown as { biohuerto: { update:     ReturnType<typeof vi.fn> } }).biohuerto.update;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reconstructs the SQL string from a Prisma tagged-template call.
 * Prisma passes a TemplateStringsArray as the first arg followed by
 * bound values. We interleave static strings with placeholder markers.
 */
function reconstructSql(callArgs: unknown[]): string {
  const strings = callArgs[0] as TemplateStringsArray;
  const values  = callArgs.slice(1);
  return strings.reduce((acc, part, idx) => {
    const val = idx < values.length ? `<val:${idx}>` : '';
    return acc + part + val;
  }, '');
}

/** Returns the bound-value array from a tagged-template call. */
function getValues(callArgs: unknown[]): unknown[] {
  return callArgs.slice(1);
}

// ─── Propiedad 1 — listarBiohuertosActivosDeUsuario ──────────────────────────

describe('Propiedad 1: Aislamiento de Datos por Usuario — Solo Activos', () => {
  /**
   * **Validates: Requirements 2.1, 5.3, 14.5**
   *
   * listarBiohuertosActivosDeUsuario delegates all filtering to the SQL
   * (WHERE dueno_id = $duenoId AND activo = true). We verify:
   *   A) The result length equals exactly what the mock returns (the service
   *      neither adds nor drops rows on its own).
   *   B) The duenoId is forwarded as a bound SQL parameter.
   *
   * NOTE: vi.clearAllMocks is called inside the property body because
   * fast-check runs the predicate many times within a single `it` block,
   * and beforeEach only runs once per `it`.
   */
  beforeEach(() => vi.clearAllMocks());

  it('solo retorna registros que el mock devuelve para el duenoId dado', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            nombre_huerto: fc.string({ minLength: 1, maxLength: 50 }),
            descripcion: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
            direccion_texto: fc.string({ minLength: 1, maxLength: 100 }),
            foto_portada_url: fc.option(fc.string({ minLength: 1 }), { nil: null }),
            area_metros_cuadrados: fc.integer({ min: 1, max: 10000 }),
            fecha_creacion: fc.constant(new Date('2024-01-01T00:00:00Z')),
            lat: fc.option(fc.integer({ min: -90, max: 90 }), { nil: null }),
            lng: fc.option(fc.integer({ min: -180, max: 180 }), { nil: null }),
            n_parcelas_activas: fc.bigInt({ min: 0n, max: 100n }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        async (userId, mockRows) => {
          // Reset within the property body so each run starts clean
          mockQueryRaw.mockReset();
          mockQueryRaw.mockResolvedValue(mockRows);

          const result = await listarBiohuertosActivosDeUsuario(userId);

          // A: no extra rows added or dropped by the service
          expect(result.length).toBe(mockRows.length);

          // B: duenoId must appear in the bound parameters
          expect(mockQueryRaw).toHaveBeenCalledTimes(1);
          const callArgs = mockQueryRaw.mock.calls[0] as unknown[];
          const values   = getValues(callArgs);
          expect(values).toContain(userId);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Propiedad 2 — listarBiohuertosActivosDeUsuario (ordering) ───────────────

describe('Propiedad 2: Ordenamiento de Listado por Fecha', () => {
  /**
   * **Validates: Requirements 2.5**
   *
   * The SQL includes ORDER BY fecha_creacion DESC. The service must preserve
   * (not reverse or shuffle) the order returned by the DB.
   * We pre-sort mock rows DESC and assert the DTOs are also DESC.
   */
  beforeEach(() => vi.clearAllMocks());

  it('preserva el orden DESC de filas devuelto por la BD (sin re-ordenar)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            nombre_huerto: fc.string({ minLength: 1, maxLength: 50 }),
            descripcion: fc.constant(null),
            direccion_texto: fc.string({ minLength: 1, maxLength: 100 }),
            foto_portada_url: fc.constant(null),
            area_metros_cuadrados: fc.integer({ min: 1, max: 10000 }),
            // noInvalidDate: true ensures no NaN/invalid dates are generated
            fecha_creacion: fc.date({
              min: new Date('2020-01-01T00:00:00.000Z'),
              max: new Date('2024-12-31T23:59:59.999Z'),
              noInvalidDate: true,
            }),
            lat: fc.constant(null),
            lng: fc.constant(null),
            n_parcelas_activas: fc.constant(0n),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (userId, mockRows) => {
          mockQueryRaw.mockReset();

          // Simulate the DB returning rows already sorted DESC
          const sortedRows = [...mockRows].sort(
            (a, b) => b.fecha_creacion.getTime() - a.fecha_creacion.getTime()
          );
          mockQueryRaw.mockResolvedValue(sortedRows);

          const result = await listarBiohuertosActivosDeUsuario(userId);

          // Every consecutive pair must maintain DESC order
          for (let i = 0; i < result.length - 1; i++) {
            const curr = new Date(result[i].fechaCreacion).getTime();
            const next = new Date(result[i + 1].fechaCreacion).getTime();
            expect(curr).toBeGreaterThanOrEqual(next);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Propiedad 3 — crearBiohuerto ─────────────────────────────────────────────

describe('Propiedad 3: Invariante de Creación — Campos de Estado Correctos', () => {
  /**
   * **Validates: Requirements 3.6**
   *
   * For any valid creation payload, the INSERT SQL sent to the DB MUST:
   *   A) Include `activo` column with bound value `true`
   *   B) Pass `duenoId` as a bound parameter
   *   C) NOT include `fecha_eliminacion` in the column list (defaults to NULL)
   *
   * fast-check v4 requires fc.float min/max to be 32-bit floats (Math.fround).
   * We use fc.integer for area/coordinates to avoid that constraint entirely.
   */
  beforeEach(() => vi.clearAllMocks());

  const FAKE_UUID = '00000000-0000-4000-8000-000000000001';

  it('el INSERT sin geo incluye activo=true, duenoId y excluye fecha_eliminacion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duenoId:             fc.uuid(),
          nombreHuerto:        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          direccionTexto:      fc.string({ minLength: 1, maxLength: 200 }),
          areaMetrosCuadrados: fc.integer({ min: 1, max: 1_000_000 }),
          descripcion:         fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
          fotoPortadaUrl:      fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        }),
        async (payload) => {
          mockQueryRaw.mockReset();
          mockQueryRaw.mockResolvedValue([{ id: FAKE_UUID }]);

          const returnedId = await crearBiohuerto(payload);
          expect(returnedId).toBe(FAKE_UUID);

          expect(mockQueryRaw).toHaveBeenCalledTimes(1);
          const callArgs = mockQueryRaw.mock.calls[0] as unknown[];
          const sql      = reconstructSql(callArgs);
          const values   = getValues(callArgs);

          // A: activo column present in column list AND the SQL literal `true`
          //    is embedded in the VALUES clause (not a bound param but a literal)
          expect(sql).toMatch(/activo/i);
          expect(sql).toMatch(/\btrue\b/i);

          // B: duenoId forwarded to the query as a bound parameter
          expect(values).toContain(payload.duenoId);

          // C: fecha_eliminacion absent from the INSERT
          expect(sql).not.toMatch(/fecha_eliminacion/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el INSERT con ubicación incluye activo=true, duenoId y excluye fecha_eliminacion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duenoId:             fc.uuid(),
          nombreHuerto:        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          direccionTexto:      fc.string({ minLength: 1, maxLength: 200 }),
          areaMetrosCuadrados: fc.integer({ min: 1, max: 1_000_000 }),
          lat:                 fc.integer({ min: -90,  max: 90  }),
          lng:                 fc.integer({ min: -180, max: 180 }),
        }),
        async (payload) => {
          mockQueryRaw.mockReset();
          mockQueryRaw.mockResolvedValue([{ id: FAKE_UUID }]);

          await crearBiohuerto(payload);

          const callArgs = mockQueryRaw.mock.calls[0] as unknown[];
          const sql      = reconstructSql(callArgs);
          const values   = getValues(callArgs);

          expect(sql).toMatch(/activo/i);
          expect(sql).toMatch(/\btrue\b/i);
          expect(values).toContain(payload.duenoId);
          expect(sql).not.toMatch(/fecha_eliminacion/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el INSERT con ubicación y polígono incluye activo=true, duenoId y excluye fecha_eliminacion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duenoId:             fc.uuid(),
          nombreHuerto:        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          direccionTexto:      fc.string({ minLength: 1, maxLength: 200 }),
          areaMetrosCuadrados: fc.integer({ min: 1, max: 1_000_000 }),
          lat:                 fc.integer({ min: -90,  max: 90  }),
          lng:                 fc.integer({ min: -180, max: 180 }),
          poligono:            fc.array(
            fc.tuple(
              fc.integer({ min: -90,  max: 90  }),
              fc.integer({ min: -180, max: 180 })
            ),
            { minLength: 3, maxLength: 10 }
          ) as fc.Arbitrary<[number, number][]>,
        }),
        async (payload) => {
          mockQueryRaw.mockReset();
          mockQueryRaw.mockResolvedValue([{ id: FAKE_UUID }]);

          await crearBiohuerto(payload);

          const callArgs = mockQueryRaw.mock.calls[0] as unknown[];
          const sql      = reconstructSql(callArgs);
          const values   = getValues(callArgs);

          expect(sql).toMatch(/activo/i);
          expect(sql).toMatch(/\btrue\b/i);
          expect(values).toContain(payload.duenoId);
          expect(sql).not.toMatch(/fecha_eliminacion/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Propiedad 8 — eliminarBiohuerto ──────────────────────────────────────────

describe('Propiedad 8: Eliminación Lógica en Cascada — Biohuerto y Parcelas', () => {
  /**
   * **Validates: Requirements 5.2**
   *
   * For any biohuerto id, after eliminarBiohuerto(id):
   *   A) db.$transaction is called exactly once
   *   B) parcela.updateMany is called with:
   *        where = { biohuertoId, activo: true }
   *        data  = { activo: false, fechaEliminacion: <non-null Date> }
   *   C) biohuerto.update is called with:
   *        where = { id }
   *        data  = { activo: false, fechaEliminacion: <non-null Date> }
   *   D) Both operations share the same Date instance (atomicidad temporal)
   *
   * $transaction is configured to execute the operations array so the Prisma
   * model calls (parcela.updateMany / biohuerto.update) are actually invoked.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops));
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockUpdate.mockResolvedValue({});
  });

  it('la transacción setea activo=false y fechaEliminacion≠null en parcelas y biohuerto', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (biohuertoId) => {
          // Reset counts between fast-check iterations
          mockTransaction.mockClear();
          mockUpdateMany.mockClear();
          mockUpdate.mockClear();

          await eliminarBiohuerto(biohuertoId);

          // A: exactly one transaction
          expect(mockTransaction).toHaveBeenCalledTimes(1);

          // B: parcela.updateMany shape
          expect(mockUpdateMany).toHaveBeenCalledTimes(1);
          const umArgs = mockUpdateMany.mock.calls[0][0] as {
            where: { biohuertoId: string; activo: boolean };
            data:  { activo: boolean; fechaEliminacion: unknown };
          };
          expect(umArgs.where.biohuertoId).toBe(biohuertoId);
          expect(umArgs.where.activo).toBe(true);
          expect(umArgs.data.activo).toBe(false);
          expect(umArgs.data.fechaEliminacion).not.toBeNull();
          expect(umArgs.data.fechaEliminacion).toBeInstanceOf(Date);

          // C: biohuerto.update shape
          expect(mockUpdate).toHaveBeenCalledTimes(1);
          const updArgs = mockUpdate.mock.calls[0][0] as {
            where: { id: string };
            data:  { activo: boolean; fechaEliminacion: unknown };
          };
          expect(updArgs.where.id).toBe(biohuertoId);
          expect(updArgs.data.activo).toBe(false);
          expect(updArgs.data.fechaEliminacion).not.toBeNull();
          expect(updArgs.data.fechaEliminacion).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('parcela y biohuerto comparten la misma fecha de eliminación (atomicidad temporal)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (biohuertoId) => {
          mockTransaction.mockClear();
          mockUpdateMany.mockClear();
          mockUpdate.mockClear();

          await eliminarBiohuerto(biohuertoId);

          const umData  = (mockUpdateMany.mock.calls[0][0] as { data: { fechaEliminacion: Date } }).data;
          const updData = (mockUpdate.mock.calls[0][0]     as { data: { fechaEliminacion: Date } }).data;

          // D: same Date instance used for both operations
          expect(umData.fechaEliminacion).toStrictEqual(updData.fechaEliminacion);
        }
      ),
      { numRuns: 50 }
    );
  });
});
