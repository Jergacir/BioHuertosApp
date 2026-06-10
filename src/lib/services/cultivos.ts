import { db } from "@/lib/db";
import type { CultivoFormData } from "@/types";

export async function listarCultivos(filters?: {
  biohuertoId?: string;
  etapa?: string;
}) {
  return db.cultivo.findMany({
    where: {
      ...(filters?.etapa ? { etapaActual: filters.etapa } : {}),
      ...(filters?.biohuertoId
        ? { parcela: { biohuertoId: filters.biohuertoId } }
        : {}),
    },
    select: {
      id: true,
      etapaActual: true,
      fechaSiembra: true,
      fechaEstimadaCosecha: true,
      cantidadSembrada: true,
      plantaUsuario: {
        select: {
          nombrePersonalizado: true,
          plantaMaestra: { select: { nombreComun: true } },
        },
      },
      parcela: {
        select: {
          nombreIdentificador: true,
          biohuerto: { select: { nombreHuerto: true } },
        },
      },
    },
    orderBy: { fechaSiembra: "desc" },
    take: 50,
  });
}

export async function obtenerCultivoPorId(id: string) {
  return db.cultivo.findUnique({
    where: { id },
    include: {
      monitoreos: { orderBy: { fechaRegistro: "desc" }, take: 10 },
      diagnosticos: { orderBy: { fechaAnalisis: "desc" }, take: 5 },
      publicaciones: { where: { activa: true } },
      plantaUsuario: { include: { plantaMaestra: true } },
      parcela: { include: { biohuerto: true } },
    },
  });
}

export async function crearCultivo(data: CultivoFormData) {
  return db.cultivo.create({
    data: {
      parcelaId: data.parcelaId,
      plantaUsuarioId: data.plantaUsuarioId,
      fechaSiembra: new Date(data.fechaSiembra),
      cantidadSembrada: data.cantidadSembrada,
      metodoSiembra: data.metodoSiembra ?? "Al voleo",
      etapaActual: "Siembra",
    },
  });
}

export async function actualizarEtapaCultivo(id: string, nuevaEtapa: string) {
  return db.cultivo.update({
    where: { id },
    data: { etapaActual: nuevaEtapa },
  });
}

export async function registrarMonitoreo(
  cultivoId: string,
  monitoreo: {
    humedadSuelo?: number;
    temperaturaAmbiente?: number;
    luminosidadPorcentaje?: number;
    incidenciasRelevantes?: string;
    observaciones?: string;
  }
) {
  return db.monitoreoCultivo.create({ data: { cultivoId, ...monitoreo } });
}
