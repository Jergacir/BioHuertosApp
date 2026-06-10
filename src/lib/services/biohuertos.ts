import { db } from "@/lib/db";
import type {
  BiohuertoDashboardDTO,
  BiohuertDetalleDTO,
  ParcelaDashboardDTO,
  BiohuertFormPayload,
} from "@/types";

// ─── Raw query result shapes ───────────────────────────────────────────────────

interface BiohuertoDashboardRaw {
  id: string;
  nombre_huerto: string;
  descripcion: string | null;
  direccion_texto: string;
  foto_portada_url: string | null;
  area_metros_cuadrados: number | string;
  fecha_creacion: Date | string;
  lat: number | null;
  lng: number | null;
  n_parcelas_activas: bigint | number;
}

interface BiohuertDetalleRaw {
  id: string;
  nombre_huerto: string;
  descripcion: string | null;
  direccion_texto: string;
  foto_portada_url: string | null;
  area_metros_cuadrados: number | string;
  fecha_creacion: Date | string;
  lat: number | null;
  lng: number | null;
  n_parcelas_activas: bigint | number;
  poligono_geojson: string | null;
}

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

// Resultado de la query PostGIS — columnas en snake_case como las devuelve pg
export interface BiohuertoCercanoRaw {
  id: string;
  nombre_huerto: string;
  direccion_texto: string;
  foto_portada_url: string | null;
  distancia_km: number;
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

// ─── Existing functions (preserved) ───────────────────────────────────────────

/**
 * @deprecated Use `listarBiohuertosActivosDeUsuario` for the new dashboard.
 * Kept for backward compatibility with existing actions.
 */
export async function listarBiohuertosDeUsuario(duenoId: string) {
  return db.biohuerto.findMany({
    where: { duenoId },
    include: { parcelas: { include: { cultivos: true } } },
    orderBy: { fechaCreacion: "desc" },
  });
}

export async function listarTodosBiohuertos() {
  return db.biohuerto.findMany({
    select: {
      id: true,
      nombreHuerto: true,
      descripcion: true,
      direccionTexto: true,
      fotoPortadaUrl: true,
      areaMetrosCuadrados: true,
      dueno: { select: { nombreCompleto: true, telefono: true } },
      parcelas: { select: { _count: true } },
    },
    orderBy: { fechaCreacion: "desc" },
  });
}

export async function obtenerPerfilBiohuerto(id: string) {
  return db.biohuerto.findUnique({
    where: { id },
    select: {
      id: true,
      nombreHuerto: true,
      descripcion: true,
      direccionTexto: true,
      fotoPortadaUrl: true,
      areaMetrosCuadrados: true,
      fechaCreacion: true,
      dueno: {
        select: {
          nombreCompleto: true,
          telefono: true,
          fotoPerfilUrl: true,
        },
      },
      parcelas: {
        select: {
          _count: { select: { cultivos: true } },
          cultivos: {
            select: {
              publicaciones: {
                where: { activa: true },
                select: {
                  id: true,
                  titulo: true,
                  descripcion: true,
                  precioPorKg: true,
                  cantidadDisponible: true,
                  imagenUrl: true,
                  cultivo: {
                    select: {
                      etapaActual: true,
                      plantaUsuario: {
                        select: {
                          nombrePersonalizado: true,
                          plantaMaestra: { select: { nombreComun: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function listarBiohuertoCercanos(
  lat: number,
  lng: number,
  radioKm: number = 20
): Promise<BiohuertoCercanoRaw[]> {
  return db.$queryRaw<BiohuertoCercanoRaw[]>`
    SELECT
      b.id,
      b.nombre_huerto,
      b.direccion_texto,
      b.foto_portada_url,
      ROUND(
        (ST_Distance(
          b.ubicacion_geo::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) / 1000)::numeric, 2
      ) AS distancia_km
    FROM biohuerto b
    WHERE ST_DWithin(
      b.ubicacion_geo::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ${radioKm * 1000}
    )
    ORDER BY distancia_km ASC
    LIMIT 20
  `;
}

// ─── New functions ─────────────────────────────────────────────────────────────

/**
 * Lista los biohuertos activos de un usuario, ordenados por fecha_creacion DESC.
 * Extrae lat/lng de ubicacion_geo via PostGIS y cuenta parcelas activas.
 */
export async function listarBiohuertosActivosDeUsuario(
  duenoId: string
): Promise<BiohuertoDashboardDTO[]> {
  const rows = await db.$queryRaw<BiohuertoDashboardRaw[]>`
    SELECT
      b.id,
      b.nombre_huerto,
      b.descripcion,
      b.direccion_texto,
      b.foto_portada_url,
      b.area_metros_cuadrados,
      b.fecha_creacion,
      ST_X(b.ubicacion_geo::geometry)  AS lat,
      ST_Y(b.ubicacion_geo::geometry)  AS lng,
      COUNT(p.id) FILTER (WHERE p.activo = true) AS n_parcelas_activas
    FROM biohuerto b
    LEFT JOIN parcela p ON p.biohuerto_id = b.id
    WHERE b.dueno_id = ${duenoId}::uuid
      AND b.activo = true
    GROUP BY b.id
    ORDER BY b.fecha_creacion DESC
  `;

  return rows.map(
    (r): BiohuertoDashboardDTO => ({
      id: r.id,
      nombreHuerto: r.nombre_huerto,
      descripcion: r.descripcion,
      direccionTexto: r.direccion_texto,
      fotoPortadaUrl: r.foto_portada_url,
      areaMetrosCuadrados: toNumber(r.area_metros_cuadrados),
      fechaCreacion: toISOString(r.fecha_creacion),
      lat: r.lat !== null ? Number(r.lat) : null,
      lng: r.lng !== null ? Number(r.lng) : null,
      nParcelasActivas: toNumber(r.n_parcelas_activas),
    })
  );
}

/**
 * Obtiene el detalle completo de un biohuerto activo que pertenece al usuario.
 * Incluye parcelas activas con sus coordenadas y el polígono del biohuerto.
 */
export async function obtenerDetallesBiohuerto(
  id: string,
  duenoId: string
): Promise<BiohuertDetalleDTO | null> {
  // Query principal del biohuerto
  const rows = await db.$queryRaw<BiohuertDetalleRaw[]>`
    SELECT
      b.id,
      b.nombre_huerto,
      b.descripcion,
      b.direccion_texto,
      b.foto_portada_url,
      b.area_metros_cuadrados,
      b.fecha_creacion,
      ST_X(b.ubicacion_geo::geometry)      AS lat,
      ST_Y(b.ubicacion_geo::geometry)      AS lng,
      ST_AsGeoJSON(b.area_geografica)      AS poligono_geojson,
      COUNT(p.id) FILTER (WHERE p.activo = true) AS n_parcelas_activas
    FROM biohuerto b
    LEFT JOIN parcela p ON p.biohuerto_id = b.id
    WHERE b.id = ${id}::uuid
      AND b.dueno_id = ${duenoId}::uuid
      AND b.activo = true
    GROUP BY b.id
  `;

  if (rows.length === 0) return null;
  const r = rows[0];

  // Query de parcelas activas con sus datos geoespaciales
  const parcelasRaw = await db.$queryRaw<ParcelaRaw[]>`
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
    WHERE p.biohuerto_id = ${id}::uuid
      AND p.activo = true
    GROUP BY p.id
    ORDER BY p.fecha_creacion DESC
  `;

  return {
    id: r.id,
    nombreHuerto: r.nombre_huerto,
    descripcion: r.descripcion,
    direccionTexto: r.direccion_texto,
    fotoPortadaUrl: r.foto_portada_url,
    areaMetrosCuadrados: toNumber(r.area_metros_cuadrados),
    fechaCreacion: toISOString(r.fecha_creacion),
    lat: r.lat !== null ? Number(r.lat) : null,
    lng: r.lng !== null ? Number(r.lng) : null,
    nParcelasActivas: toNumber(r.n_parcelas_activas),
    poligono: parsePoligonoGeoJSON(r.poligono_geojson),
    parcelas: parcelasRaw.map(mapParcelaRaw),
  };
}

/**
 * Crea un nuevo biohuerto usando raw SQL para los campos PostGIS.
 * Retorna el UUID del biohuerto creado.
 */
export async function crearBiohuerto(data: {
  duenoId: string;
  nombreHuerto: string;
  descripcion?: string;
  direccionTexto: string;
  areaMetrosCuadrados: number;
  lat?: number;
  lng?: number;
  poligono?: [number, number][];
  fotoPortadaUrl?: string;
}): Promise<string> {
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
      INSERT INTO biohuerto (
        id, dueno_id, nombre_huerto, descripcion,
        direccion_texto, ubicacion_geo, area_geografica,
        area_metros_cuadrados, foto_portada_url, activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.duenoId}::uuid,
        ${data.nombreHuerto},
        ${data.descripcion ?? null},
        ${data.direccionTexto},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ST_GeomFromGeoJSON(${geoJson}),
        ${data.areaMetrosCuadrados},
        ${data.fotoPortadaUrl ?? null},
        true,
        NOW()
      )
      RETURNING id
    `;
  } else if (hasLocation) {
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO biohuerto (
        id, dueno_id, nombre_huerto, descripcion,
        direccion_texto, ubicacion_geo,
        area_metros_cuadrados, foto_portada_url, activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.duenoId}::uuid,
        ${data.nombreHuerto},
        ${data.descripcion ?? null},
        ${data.direccionTexto},
        ST_SetSRID(ST_MakePoint(${lng!}, ${lat!}), 4326),
        ${data.areaMetrosCuadrados},
        ${data.fotoPortadaUrl ?? null},
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
      INSERT INTO biohuerto (
        id, dueno_id, nombre_huerto, descripcion,
        direccion_texto, area_geografica,
        area_metros_cuadrados, foto_portada_url, activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.duenoId}::uuid,
        ${data.nombreHuerto},
        ${data.descripcion ?? null},
        ${data.direccionTexto},
        ST_GeomFromGeoJSON(${geoJson}),
        ${data.areaMetrosCuadrados},
        ${data.fotoPortadaUrl ?? null},
        true,
        NOW()
      )
      RETURNING id
    `;
  } else {
    // No location data — insert without geo columns
    // ubicacion_geo is NOT NULL in schema, so we use a default null-island point
    // when no location is provided
    rows = await db.$queryRaw<{ id: string }[]>`
      INSERT INTO biohuerto (
        id, dueno_id, nombre_huerto, descripcion,
        direccion_texto, ubicacion_geo,
        area_metros_cuadrados, foto_portada_url, activo, fecha_creacion
      ) VALUES (
        gen_random_uuid(),
        ${data.duenoId}::uuid,
        ${data.nombreHuerto},
        ${data.descripcion ?? null},
        ${data.direccionTexto},
        ST_SetSRID(ST_MakePoint(0, 0), 4326),
        ${data.areaMetrosCuadrados},
        ${data.fotoPortadaUrl ?? null},
        true,
        NOW()
      )
      RETURNING id
    `;
  }

  if (!rows || rows.length === 0) {
    throw new Error("No se pudo crear el biohuerto: no se retornó el ID");
  }
  return rows[0].id;
}

/**
 * Edita un biohuerto existente.
 * Usa $executeRaw para campos geoespaciales cuando estén presentes;
 * para el resto de los campos usa el update de Prisma.
 */
export async function editarBiohuerto(
  id: string,
  data: Partial<BiohuertFormPayload>
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
      UPDATE biohuerto
      SET ubicacion_geo   = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          area_geografica = ST_GeomFromGeoJSON(${geoJson})
      WHERE id = ${id}::uuid
    `;
  } else if (hasLocation) {
    await db.$executeRaw`
      UPDATE biohuerto
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
      UPDATE biohuerto
      SET area_geografica = ST_GeomFromGeoJSON(${geoJson})
      WHERE id = ${id}::uuid
    `;
  }

  // Update scalar fields via Prisma if any are provided
  const prismaData: Record<string, unknown> = {};
  if (scalarFields.nombreHuerto !== undefined)
    prismaData.nombreHuerto = scalarFields.nombreHuerto;
  if (scalarFields.descripcion !== undefined)
    prismaData.descripcion = scalarFields.descripcion;
  if (scalarFields.direccionTexto !== undefined)
    prismaData.direccionTexto = scalarFields.direccionTexto;
  if (scalarFields.areaMetrosCuadrados !== undefined)
    prismaData.areaMetrosCuadrados = scalarFields.areaMetrosCuadrados;
  if (scalarFields.fotoPortadaUrl !== undefined)
    prismaData.fotoPortadaUrl = scalarFields.fotoPortadaUrl;

  if (Object.keys(prismaData).length > 0) {
    await db.biohuerto.update({ where: { id }, data: prismaData });
  }
}

/**
 * Eliminación lógica de un biohuerto y sus parcelas activas en una transacción.
 * Sets activo=false and fechaEliminacion=now() on the biohuerto and all its active parcelas.
 */
export async function eliminarBiohuerto(id: string): Promise<void> {
  const now = new Date();
  await db.$transaction([
    db.parcela.updateMany({
      where: { biohuertoId: id, activo: true },
      data: { activo: false, fechaEliminacion: now },
    }),
    db.biohuerto.update({
      where: { id },
      data: { activo: false, fechaEliminacion: now },
    }),
  ]);
}
