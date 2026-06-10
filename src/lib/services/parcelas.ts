import { db } from "@/lib/db";
import type { ParcelaDashboardDTO, ParcelaFormPayload } from "@/types";

// ─── Raw query result shapes ───────────────────────────────────────────────────

interface ParcelaRaw {
  id: string;
  biohuerto_id: string;
  nombre_identificador: string;
  area_metros_cuadrados: number | string;
  tipo_suelo: string | null;
  fecha_creacion: Date | string;
  lat: number | null;
  lng: number | null;
  poligono_geojson: string | null;
  n_cultivos_activos: bigint | number;
}

interface AreaSumaRaw {
  suma: string | null;
}

interface AreaBiohuertoRaw {
  area_metros_cuadrados: number | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsePoligonoGeoJSON(
  geojson: string | null
): [number, number][] | null {
  if (!geojson) return null;
  try {
    const parsed = JSON.parse(geojson) as {
      type: string;
      coordinates?: number[][][];
    };
    if (
      parsed.type === "Polygon" &&
      Array.isArray(parsed.coordinates) &&
      parsed.coordinates.length > 0
    ) {
      // GeoJSON coords are [lng, lat]; convert to [lat, lng] for Leaflet
      return parsed.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
    }
    return null;
  } catch {
    return null;
  }
}

function toNumber(val: number | string | bigint | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "bigint") return Number(val);
  return typeof val === "string" ? parseFloat(val) : val;
}

function toISOString(val: Date | string): string {
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

function mapParcelaRaw(p: ParcelaRaw): ParcelaDashboardDTO {
  return {
    id: p.id,
    biohuertoId: p.biohuerto_id,
    nombreIdentificador: p.nombre_identificador,
    areaMetrosCuadrados: toNumber(p.area_metros_cuadrados),
    tipoSuelo: p.tipo_suelo,
    fechaCreacion: toISOString(p.fecha_creacion),
    lat: p.lat !== null ? Number(p.lat) : null,
    lng: p.lng !== null ? Number(p.lng) : null,
    poligono: parsePoligonoGeoJSON(p.poligono_geojson),
    nCultivosActivos: toNumber(p.n_cultivos_activos),
  };
}

// ─── Service functions ─────────────────────────────────────────────────────────

/**
 * Lista las parcelas activas de un biohuerto, ordenadas por fecha_creacion DESC.
 * Extrae coordenadas geoespaciales opcionales via PostGIS y cuenta cultivos activos.
 * Requirements: 7.1
 */
export async function listarParcelasActivas(
  biohuertoId: string
): Promise<ParcelaDashboardDTO[]> {
  const rows = await db.$queryRaw<ParcelaRaw[]>`
    SELECT
      p.id,
      p.biohuerto_id,
      p.nombre_identificador,
      p.area_metros_cuadrados,
      p.tipo_suelo,
      p.fecha_creacion,
      ST_X(p.ubicacion_geo::geometry)      AS lat,
      ST_Y(p.ubicacion_geo::geometry)      AS lng,
      ST_AsGeoJSON(p.area_geografica)      AS poligono_geojson,
      COUNT(c.id) FILTER (WHERE c.etapa_actual IS NOT NULL) AS n_cultivos_activos
    FROM parcela p
    LEFT JOIN cultivo c ON c.parcela_id = p.id
    WHERE p.biohuerto_id = ${biohuertoId}::uuid
      AND p.activo = true
    GROUP BY p.id
    ORDER BY p.fecha_creacion DESC
  `;

  return rows.map(mapParcelaRaw);
}

/**
 * Valida que el área propuesta cabe en el biohuerto padre.
 * Suma las áreas de las parcelas activas (excluyendo parcelaIdExcluida si se provee),
 * y compara contra el área total del biohuerto.
 * Requirements: 8.7, 11.1
 */
export async function validarAreaParcela(
  biohuertoId: string,
  areaMetrosCuadrados: number,
  parcelaIdExcluida?: string
): Promise<{ valido: boolean; disponible: number }> {
  // Query 1: suma de áreas de parcelas activas (excluyendo la parcela en edición)
  let sumaActivas: number;

  if (parcelaIdExcluida) {
    const sumaRows = await db.$queryRaw<AreaSumaRaw[]>`
      SELECT COALESCE(SUM(area_metros_cuadrados), 0)::text AS suma
      FROM parcela
      WHERE biohuerto_id = ${biohuertoId}::uuid
        AND activo = true
        AND id != ${parcelaIdExcluida}::uuid
    `;
    sumaActivas = parseFloat(sumaRows[0]?.suma ?? "0");
  } else {
    const sumaRows = await db.$queryRaw<AreaSumaRaw[]>`
      SELECT COALESCE(SUM(area_metros_cuadrados), 0)::text AS suma
      FROM parcela
      WHERE biohuerto_id = ${biohuertoId}::uuid
        AND activo = true
    `;
    sumaActivas = parseFloat(sumaRows[0]?.suma ?? "0");
  }

  // Query 2: área total del biohuerto
  const bioRows = await db.$queryRaw<AreaBiohuertoRaw[]>`
    SELECT area_metros_cuadrados
    FROM biohuerto
    WHERE id = ${biohuertoId}::uuid
  `;

  if (bioRows.length === 0) {
    return { valido: false, disponible: 0 };
  }

  const areaBiohuerto = toNumber(bioRows[0].area_metros_cuadrados);
  const disponible = areaBiohuerto - sumaActivas;
  const valido = sumaActivas + areaMetrosCuadrados <= areaBiohuerto;

  return { valido, disponible };
}

/**
 * Crea una nueva parcela usando raw SQL para los campos PostGIS opcionales.
 * Retorna el UUID de la parcela creada.
 * Requirements: 8.3
 */
export async function crearParcela(data: ParcelaFormPayload): Promise<string> {
  const { lat, lng, poligono } = data;
  const hasLocation = lat !== undefined && lng !== undefined;
  const hasPoligono = poligono !== undefined && poligono.length >= 3;

  let rows: { id: string }[];

  if (hasLocation && hasPoligono) {
    const geoJson = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          // GeoJSON expects [lng, lat]; close ring by repeating first vertex
          ...poligono!.map(([plat, plng]) => [plng, plat]),
          [poligono![0][1], poligono![0][0]],
        ],
      ],
    });
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO parcela (
        id, biohuerto_id, nombre_identificador,
        area_metros_cuadrados, tipo_suelo,
        ubicacion_geo, area_geografica,
        activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.biohuertoId}::uuid,
        ${data.nombreIdentificador},
        ${data.areaMetrosCuadrados},
        ${data.tipoSuelo ?? null},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ST_GeomFromGeoJSON(${geoJson}),
        true,
        NOW()
      )
      RETURNING id
    `;
  } else if (hasLocation) {
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO parcela (
        id, biohuerto_id, nombre_identificador,
        area_metros_cuadrados, tipo_suelo,
        ubicacion_geo,
        activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.biohuertoId}::uuid,
        ${data.nombreIdentificador},
        ${data.areaMetrosCuadrados},
        ${data.tipoSuelo ?? null},
        ST_SetSRID(ST_MakePoint(${lng!}, ${lat!}), 4326),
        true,
        NOW()
      )
      RETURNING id
    `;
  } else if (hasPoligono) {
    const geoJson = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          ...poligono!.map(([plat, plng]) => [plng, plat]),
          [poligono![0][1], poligono![0][0]],
        ],
      ],
    });
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO parcela (
        id, biohuerto_id, nombre_identificador,
        area_metros_cuadrados, tipo_suelo,
        area_geografica,
        activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.biohuertoId}::uuid,
        ${data.nombreIdentificador},
        ${data.areaMetrosCuadrados},
        ${data.tipoSuelo ?? null},
        ST_GeomFromGeoJSON(${geoJson}),
        true,
        NOW()
      )
      RETURNING id
    `;
  } else {
    // No geo data — insert only scalar fields
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO parcela (
        id, biohuerto_id, nombre_identificador,
        area_metros_cuadrados, tipo_suelo,
        activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.biohuertoId}::uuid,
        ${data.nombreIdentificador},
        ${data.areaMetrosCuadrados},
        ${data.tipoSuelo ?? null},
        true,
        NOW()
      )
      RETURNING id
    `;
  }

  if (!rows || rows.length === 0) {
    throw new Error("No se pudo crear la parcela: no se retornó el ID");
  }
  return rows[0].id;
}

/**
 * Edita una parcela existente.
 * Usa $executeRaw para campos geoespaciales opcionales;
 * para el resto de los campos usa el update de Prisma.
 * Requirements: 9.3
 */
export async function editarParcela(
  id: string,
  data: Partial<ParcelaFormPayload>
): Promise<void> {
  const { lat, lng, poligono, ...scalarFields } = data;
  const hasLocation = lat !== undefined && lng !== undefined;
  const hasPoligono = poligono !== undefined && poligono.length >= 3;

  // Update geo fields via raw SQL if present
  if (hasLocation && hasPoligono) {
    const geoJson = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          ...poligono!.map(([plat, plng]) => [plng, plat]),
          [poligono![0][1], poligono![0][0]],
        ],
      ],
    });
    await db.$executeRaw`
      UPDATE parcela
      SET ubicacion_geo   = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          area_geografica = ST_GeomFromGeoJSON(${geoJson})
      WHERE id = ${id}::uuid
    `;
  } else if (hasLocation) {
    await db.$executeRaw`
      UPDATE parcela
      SET ubicacion_geo = ST_SetSRID(ST_MakePoint(${lng!}, ${lat!}), 4326)
      WHERE id = ${id}::uuid
    `;
  } else if (hasPoligono) {
    const geoJson = JSON.stringify({
      type: "Polygon",
      coordinates: [
        [
          ...poligono!.map(([plat, plng]) => [plng, plat]),
          [poligono![0][1], poligono![0][0]],
        ],
      ],
    });
    await db.$executeRaw`
      UPDATE parcela
      SET area_geografica = ST_GeomFromGeoJSON(${geoJson})
      WHERE id = ${id}::uuid
    `;
  }

  // Update scalar fields via Prisma if any are provided
  const prismaData: Record<string, unknown> = {};
  if (scalarFields.nombreIdentificador !== undefined)
    prismaData.nombreIdentificador = scalarFields.nombreIdentificador;
  if (scalarFields.areaMetrosCuadrados !== undefined)
    prismaData.areaMetrosCuadrados = scalarFields.areaMetrosCuadrados;
  if (scalarFields.tipoSuelo !== undefined)
    prismaData.tipoSuelo = scalarFields.tipoSuelo;

  if (Object.keys(prismaData).length > 0) {
    await db.parcela.update({ where: { id }, data: prismaData });
  }
}

/**
 * Eliminación lógica de una parcela individual.
 * Establece activo=false y fechaEliminacion=now().
 * Requirements: 10.2
 */
export async function eliminarParcela(id: string): Promise<void> {
  const now = new Date();
  await db.parcela.update({
    where: { id },
    data: { activo: false, fechaEliminacion: now },
  });
}
