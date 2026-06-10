"use server";

import {
  listarBiohuertosDeUsuario,
  listarTodosBiohuertos,
  obtenerPerfilBiohuerto,
  crearBiohuerto,
} from "@/lib/services/biohuertos";

export async function getBiohuertosAction(duenoId?: string) {
  try {
    const data = duenoId
      ? await listarBiohuertosDeUsuario(duenoId)
      : await listarTodosBiohuertos();
    return { data: data as Awaited<ReturnType<typeof listarTodosBiohuertos>> };
  } catch {
    return { error: "No se pudieron obtener los biohuertos." };
  }
}

export async function getPerfilBiohuertAction(id: string) {
  try {
    const data = await obtenerPerfilBiohuerto(id);
    return { data };
  } catch {
    return { error: "No se pudo obtener el perfil del biohuerto." };
  }
}
