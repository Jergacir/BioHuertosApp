"use server";

import {
  listarBiohuertosDeUsuario,
  listarTodosBiohuertos,
  obtenerPerfilBiohuerto,
  crearBiohuerto,
} from "@/lib/services/biohuertos";
import { obtenerUsuarioPorId } from "@/lib/services/auth";
import { cookies } from "next/headers";

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

export async function crearBiohuertAction(formData: {
  nombreHuerto: string;
  descripcion?: string;
  direccionTexto: string;
  latitud: number;
  longitud: number;
  area: number;
}) {
  try {
    // Obtener el usuario autenticado desde la cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("bioned_session")?.value;

    if (!sessionId) {
      return { error: "No autenticado" };
    }

    const usuario = await obtenerUsuarioPorId(sessionId);
    if (!usuario) {
      return { error: "Usuario no encontrado" };
    }

    // Crear el biohuerto
    await crearBiohuerto({
      duenoId: usuario.id,
      nombreHuerto: formData.nombreHuerto,
      descripcion: formData.descripcion,
      direccionTexto: formData.direccionTexto,
      lat: formData.latitud,
      lng: formData.longitud,
      areaMetrosCuadrados: formData.area,
    });

    return { success: true, message: "Biohuerto creado exitosamente" };
  } catch (error) {
    console.error("Error al crear biohuerto:", error);
    return { error: "Error al crear el biohuerto. Intenta nuevamente." };
  }
}
