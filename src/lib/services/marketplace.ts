import { db } from "@/lib/db";

export async function listarCosechasActivas() {
  return db.publicacionCosecha.findMany({
    where: { activa: true },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      precioPorKg: true,
      cantidadDisponible: true,
      imagenUrl: true,
      activa: true,
      fechaPublicacion: true,
      cultivo: {
        select: {
          id: true,
          etapaActual: true,
          plantaUsuario: {
            select: {
              nombrePersonalizado: true,
              plantaMaestra: {
                select: { nombreComun: true, iconoUrl: true },
              },
            },
          },
          parcela: {
            select: {
              nombreIdentificador: true,
              biohuerto: {
                select: {
                  nombreHuerto: true,
                  direccionTexto: true,
                  fotoPortadaUrl: true,
                  dueno: { select: { telefono: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { fechaPublicacion: "desc" },
  });
}

export async function obtenerCosechaPorId(id: string) {
  return db.publicacionCosecha.findUnique({
    where: { id },
    include: {
      cultivo: {
        include: {
          plantaUsuario: { include: { plantaMaestra: true } },
          parcela: {
            include: {
              biohuerto: {
                include: {
                  dueno: { select: { nombreCompleto: true, telefono: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function publicarCosecha(data: {
  cultivoId: string;
  titulo: string;
  descripcion?: string;
  precioPorKg: number;
  cantidadDisponible: number;
  imagenUrl?: string;
}) {
  return db.publicacionCosecha.create({
    data: {
      cultivoId: data.cultivoId,
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      precioPorKg: data.precioPorKg,
      cantidadDisponible: data.cantidadDisponible,
      imagenUrl: data.imagenUrl ?? null,
      activa: true,
    },
  });
}

export async function toggleEstadoCosecha(id: string, activa: boolean) {
  return db.publicacionCosecha.update({
    where: { id },
    data: { activa },
  });
}
