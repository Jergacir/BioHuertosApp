"use server";

import {
  resumenFinanciero,
  listarRegistros,
  registrarTransaccion,
} from "@/lib/services/finanzas";

export async function getResumenFinancieroAction(biohuertoId: string) {
  try {
    const data = await resumenFinanciero(biohuertoId);
    return { data };
  } catch {
    return { error: "No se pudo obtener el resumen financiero." };
  }
}

export async function getRegistrosAction(biohuertoId: string) {
  try {
    const data = await listarRegistros(biohuertoId);
    return { data };
  } catch {
    return { error: "No se pudieron obtener los registros." };
  }
}

export async function registrarTransaccionAction(data: {
  biohuertoId: string;
  cultivoId?: string;
  tipoTransaccion: "INGRESO" | "EGRESO";
  categoria: string;
  monto: number;
  descripcion?: string;
}) {
  try {
    const registro = await registrarTransaccion(data);
    return { data: registro };
  } catch {
    return { error: "No se pudo registrar la transacción." };
  }
}
