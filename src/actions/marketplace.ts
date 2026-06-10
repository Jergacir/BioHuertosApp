"use server";

import {
  listarCosechasActivas,
  obtenerCosechaPorId,
  publicarCosecha,
  toggleEstadoCosecha,
} from "@/lib/services/marketplace";

export async function getCosechasAction() {
  try {
    const data = await listarCosechasActivas();
    return { data };
  } catch {
    return { error: "No se pudieron obtener las cosechas." };
  }
}

export async function getCosechaAction(id: string) {
  try {
    const data = await obtenerCosechaPorId(id);
    return { data };
  } catch {
    return { error: "No se pudo obtener la cosecha." };
  }
}

export async function publicarCosechaAction(data: {
  cultivoId: string;
  titulo: string;
  descripcion?: string;
  precioPorKg: number;
  cantidadDisponible: number;
  imagenUrl?: string;
}) {
  try {
    const cosecha = await publicarCosecha(data);
    return { data: cosecha };
  } catch {
    return { error: "No se pudo publicar la cosecha." };
  }
}

export async function toggleEstadoCosechaAction(id: string, activa: boolean) {
  try {
    const data = await toggleEstadoCosecha(id, activa);
    return { data };
  } catch {
    return { error: "No se pudo actualizar el estado." };
  }
}
