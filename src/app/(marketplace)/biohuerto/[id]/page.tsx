import { notFound } from "next/navigation";
import { getPerfilBiohuertAction } from "@/actions/biohuertos";
import BiohuertoPerfilClient from "@/components/marketplace/BiohuertoPerfilClient";
import type { BiohuertoPerfilDTO } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BiohuertoPerfilPage({ params }: Props) {
  const { id } = await params;
  const result = await getPerfilBiohuertAction(id);

  if (!result.data) return notFound();

  const raw = result.data;

  // Aplanar el árbol parcelas → cultivos → publicaciones
  const cosechas: BiohuertoPerfilDTO["cosechas"] = raw.parcelas.flatMap((p) =>
    p.cultivos.flatMap((c) =>
      c.publicaciones.map((pub) => ({
        id: pub.id,
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        precioPorKg: Number(pub.precioPorKg),
        cantidadDisponible: Number(pub.cantidadDisponible),
        imagenUrl: pub.imagenUrl,
        etapaActual: pub.cultivo.etapaActual,
        nombrePlanta:
          pub.cultivo.plantaUsuario.plantaMaestra?.nombreComun ??
          pub.cultivo.plantaUsuario.nombrePersonalizado ??
          pub.titulo,
      }))
    )
  );

  const totalCultivos = raw.parcelas.reduce(
    (acc, p) => acc + p._count.cultivos,
    0
  );

  const perfil: BiohuertoPerfilDTO = {
    id: raw.id,
    nombreHuerto: raw.nombreHuerto,
    descripcion: raw.descripcion,
    direccionTexto: raw.direccionTexto,
    fotoPortadaUrl: raw.fotoPortadaUrl,
    areaMetrosCuadrados: Number(raw.areaMetrosCuadrados),
    fechaCreacion: raw.fechaCreacion.toISOString(),
    dueno: {
      nombreCompleto: raw.dueno.nombreCompleto,
      telefono: raw.dueno.telefono,
      fotoPerfilUrl: raw.dueno.fotoPerfilUrl,
    },
    totalParcelas: raw.parcelas.length,
    totalCultivos,
    cosechas,
  };

  return <BiohuertoPerfilClient perfil={perfil} />;
}
