import { db } from "@/lib/db";

export async function listarDiagnosticos(cultivoId: string) {
  return db.diagnosticoPlaga.findMany({
    where: { cultivoId },
    orderBy: { fechaAnalisis: "desc" },
  });
}

export async function guardarDiagnostico(data: {
  cultivoId: string;
  imagenUrl: string;
  resultadoDiagnostico: string;
  nivelConfianza: number;
  tratamientoSugerido: string;
}) {
  return db.diagnosticoPlaga.create({ data });
}
