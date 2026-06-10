import { getCosechasAction } from "@/actions/marketplace";
import { getBiohuertosAction } from "@/actions/biohuertos";
import MarketplaceClient from "@/components/marketplace/MarketplaceClient";
import type { CosechaDTO, BiohuertoPrevioDTO } from "@/types";

export default async function MarketplacePage() {
  const [cosechasResult, biohuertosResult] = await Promise.all([
    getCosechasAction(),
    getBiohuertosAction(),
  ]);

  // Mapeo explícito y tipado: convierte Decimal→number y Date→string
  // para que los datos sean plain objects serializables entre Server y Client.
  const cosechas: CosechaDTO[] = (cosechasResult.data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    precioPorKg: Number(c.precioPorKg),
    cantidadDisponible: Number(c.cantidadDisponible),
    imagenUrl: c.imagenUrl,
    activa: c.activa,
    fechaPublicacion: c.fechaPublicacion.toISOString(),
    cultivo: {
      id: c.cultivo.id,
      etapaActual: c.cultivo.etapaActual,
      plantaUsuario: {
        nombrePersonalizado: c.cultivo.plantaUsuario.nombrePersonalizado,
        plantaMaestra: c.cultivo.plantaUsuario.plantaMaestra
          ? {
              nombreComun: c.cultivo.plantaUsuario.plantaMaestra.nombreComun,
              iconoUrl: c.cultivo.plantaUsuario.plantaMaestra.iconoUrl,
            }
          : null,
      },
      parcela: {
        nombreIdentificador: c.cultivo.parcela.nombreIdentificador,
        biohuerto: {
          nombreHuerto: c.cultivo.parcela.biohuerto.nombreHuerto,
          direccionTexto: c.cultivo.parcela.biohuerto.direccionTexto,
          fotoPortadaUrl: c.cultivo.parcela.biohuerto.fotoPortadaUrl,
          dueno: {
            telefono: c.cultivo.parcela.biohuerto.dueno.telefono,
          },
        },
      },
    },
  }));

  const biohuertos: BiohuertoPrevioDTO[] = (biohuertosResult.data ?? []).map((b) => ({
    id: b.id,
    nombreHuerto: b.nombreHuerto,
    descripcion: b.descripcion,
    direccionTexto: b.direccionTexto,
    fotoPortadaUrl: b.fotoPortadaUrl,
    areaMetrosCuadrados: Number(b.areaMetrosCuadrados),
    dueno: {
      nombreCompleto: b.dueno.nombreCompleto,
      telefono: b.dueno.telefono,
    },
    parcelas: b.parcelas,
  }));

  return <MarketplaceClient cosechas={cosechas} biohuertos={biohuertos} />;
}
