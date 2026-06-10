"use server";

import {
  listarBiohuertosDeUsuario,
  listarTodosBiohuertos,
  obtenerBiohuertoPorId,
  crearBiohuerto,
} from "@/lib/services/biohuertos";
export async function getBiohuertosAction(duenoId?: string) {
  try {
    const data = duenoId
      ? await listarBiohuertosDeUsuario(duenoId)
      : await listarTodosBiohuertos();
    // listarTodosBiohuertos always returns BiohuertoPreviw shape
    return { data: data as Awaited<ReturnType<typeof listarTodosBiohuertos>> };
  } catch {
    return { error: "No se pudieron obtener los biohuertos." };
  }
}

export async function getBiohuertoPorIdAction(id: string) {
  try {
    const data = await obtenerBiohuertoPorId(id);
    return { data };
  } catch {
    return { error: "No se pudo obtener el biohuerto." };
  }
}

export async function crearBiohuertAction(data: {
  duenoId: string;
  nombreHuerto: string;
  descripcion?: string;
  direccionTexto: string;
  lat: number;
  lng: number;
  areaMetrosCuadrados: number;
  fotoPortadaUrl?: string;
}) {
  try {
    await crearBiohuerto(data);
    return { data: true };
  } catch {
    return { error: "No se pudo crear el biohuerto." };
  }
}
