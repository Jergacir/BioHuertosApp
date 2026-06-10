"use server";

import {
  listarCultivos,
  obtenerCultivoPorId,
  crearCultivo,
  actualizarEtapaCultivo,
  registrarMonitoreo,
} from "@/lib/services/cultivos";
import type { CultivoFormData } from "@/types";

export async function getCultivosAction(filters?: {
  biohuertoId?: string;
  etapa?: string;
}) {
  try {
    const data = await listarCultivos(filters);
    return { data };
  } catch {
    return { error: "No se pudieron obtener los cultivos." };
  }
}

export async function getCultivoAction(id: string) {
  try {
    const data = await obtenerCultivoPorId(id);
    return { data };
  } catch {
    return { error: "No se pudo obtener el cultivo." };
  }
}

export async function crearCultivoAction(data: CultivoFormData) {
  try {
    const cultivo = await crearCultivo(data);
    return { data: cultivo };
  } catch {
    return { error: "No se pudo crear el cultivo." };
  }
}

export async function actualizarEtapaAction(id: string, nuevaEtapa: string) {
  try {
    const data = await actualizarEtapaCultivo(id, nuevaEtapa);
    return { data };
  } catch {
    return { error: "No se pudo actualizar la etapa." };
  }
}

export async function registrarMonitoreoAction(
  cultivoId: string,
  monitoreo: {
    humedadSuelo?: number;
    temperaturaAmbiente?: number;
    luminosidadPorcentaje?: number;
    incidenciasRelevantes?: string;
    observaciones?: string;
  }
) {
  try {
    const data = await registrarMonitoreo(cultivoId, monitoreo);
    return { data };
  } catch {
    return { error: "No se pudo registrar el monitoreo." };
  }
}
