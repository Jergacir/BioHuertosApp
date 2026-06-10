import { notFound } from "next/navigation";
import { getCosechaAction } from "@/actions/marketplace";
import CosechaDetalleClient from "@/components/marketplace/CosechaDetalleClient";
import type { CosechaDetalleDTO } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getCosechaAction(id);

  if (!result.data) return notFound();

  const raw = result.data;

  // Mapeo tipado: Decimal → number, Date → ISO string
  const cosecha: CosechaDetalleDTO = {
    id: raw.id,
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    precioPorKg: Number(raw.precioPorKg),
    cantidadDisponible: Number(raw.cantidadDisponible),
    imagenUrl: raw.imagenUrl,
    fechaPublicacion: raw.fechaPublicacion.toISOString(),
    cultivo: {
      etapaActual: raw.cultivo.etapaActual,
      fechaSiembra: raw.cultivo.fechaSiembra.toISOString(),
      metodoSiembra: raw.cultivo.metodoSiembra,
      plantaUsuario: {
        nombrePersonalizado: raw.cultivo.plantaUsuario.nombrePersonalizado,
        plantaMaestra: raw.cultivo.plantaUsuario.plantaMaestra
          ? {
              nombreComun: raw.cultivo.plantaUsuario.plantaMaestra.nombreComun,
              nombreCientifico: raw.cultivo.plantaUsuario.plantaMaestra.nombreCientifico,
              familiaBotanica: raw.cultivo.plantaUsuario.plantaMaestra.familiaBotanica,
              tiempoEstimadoCosechaDias: raw.cultivo.plantaUsuario.plantaMaestra.tiempoEstimadoCosechaDias,
              iconoUrl: raw.cultivo.plantaUsuario.plantaMaestra.iconoUrl,
            }
          : null,
      },
      parcela: {
        nombreIdentificador: raw.cultivo.parcela.nombreIdentificador,
        tipoSuelo: raw.cultivo.parcela.tipoSuelo,
        biohuerto: {
          id: raw.cultivo.parcela.biohuerto.id,
          nombreHuerto: raw.cultivo.parcela.biohuerto.nombreHuerto,
          direccionTexto: raw.cultivo.parcela.biohuerto.direccionTexto,
          fotoPortadaUrl: raw.cultivo.parcela.biohuerto.fotoPortadaUrl,
          dueno: {
            nombreCompleto: raw.cultivo.parcela.biohuerto.dueno.nombreCompleto,
            telefono: raw.cultivo.parcela.biohuerto.dueno.telefono,
            fotoPerfilUrl: raw.cultivo.parcela.biohuerto.dueno.fotoPerfilUrl,
          },
        },
      },
    },
  };

  return <CosechaDetalleClient cosecha={cosecha} />;
}
