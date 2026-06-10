import { db } from "@/lib/db";
import type { BiohuertoPrevioDTO } from "@/types";

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

export async function obtenerBiohuertoPorId(id: string) {
  return db.biohuerto.findUnique({
    where: { id },
    include: {
      parcelas: { include: { cultivos: true } },
      alertas: { where: { completada: false }, orderBy: { fechaProgramada: "asc" } },
    },
  });
}

export async function crearBiohuerto(data: {
  duenoId: string;
  nombreHuerto: string;
  descripcion?: string;
  direccionTexto: string;
  lat: number;
  lng: number;
  areaMetrosCuadrados: number;
  fotoPortadaUrl?: string;
}) {
  // ubicacionGeo usa raw SQL para insertar el tipo PostGIS
  return db.$executeRaw`
    INSERT INTO biohuerto (
      id, dueno_id, nombre_huerto, descripcion,
      direccion_texto, ubicacion_geo,
      area_metros_cuadrados, foto_portada_url, fecha_creacion
    ) VALUES (
      gen_random_uuid(),
      ${data.duenoId}::uuid,
      ${data.nombreHuerto},
      ${data.descripcion ?? null},
      ${data.direccionTexto},
      ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326),
      ${data.areaMetrosCuadrados},
      ${data.fotoPortadaUrl ?? null},
      NOW()
    )
  `;
}

// Resultado de la query PostGIS — columnas en snake_case como las devuelve pg
export interface BiohuertoCercanoRaw {
  id: string;
  nombre_huerto: string;
  direccion_texto: string;
  foto_portada_url: string | null;
  distancia_km: number;
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
