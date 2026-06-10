"use server";

import {
  listarDiagnosticos,
  guardarDiagnostico,
} from "@/lib/services/fitosanitario";

export async function getDiagnosticosAction(cultivoId: string) {
  try {
    const data = await listarDiagnosticos(cultivoId);
    return { data };
  } catch {
    return { error: "No se pudieron obtener los diagnósticos." };
  }
}

export async function guardarDiagnosticoAction(data: {
  cultivoId: string;
  imagenUrl: string;
  resultadoDiagnostico: string;
  nivelConfianza: number;
  tratamientoSugerido: string;
}) {
  try {
    const diagnostico = await guardarDiagnostico(data);
    return { data: diagnostico };
  } catch {
    return { error: "No se pudo guardar el diagnóstico." };
  }
}
