import { db } from "@/lib/db";

export async function listarRegistros(biohuertoId: string) {
  return db.registroFinanciero.findMany({
    where: { biohuertoId },
    orderBy: { fechaTransaccion: "desc" },
  });
}

export async function resumenFinanciero(biohuertoId: string) {
  const registros = await listarRegistros(biohuertoId);

  const ingresos = registros
    .filter((r) => r.tipoTransaccion === "INGRESO")
    .reduce((acc, r) => acc + Number(r.monto), 0);

  const egresos = registros
    .filter((r) => r.tipoTransaccion === "EGRESO")
    .reduce((acc, r) => acc + Number(r.monto), 0);

  return { registros, ingresos, egresos, balance: ingresos - egresos };
}

export async function registrarTransaccion(data: {
  biohuertoId: string;
  cultivoId?: string;
  tipoTransaccion: "INGRESO" | "EGRESO";
  categoria: string;
  monto: number;
  descripcion?: string;
}) {
  return db.registroFinanciero.create({
    data: {
      biohuertoId: data.biohuertoId,
      cultivoId: data.cultivoId ?? null,
      tipoTransaccion: data.tipoTransaccion,
      categoria: data.categoria,
      monto: data.monto,
      descripcion: data.descripcion ?? null,
    },
  });
}
