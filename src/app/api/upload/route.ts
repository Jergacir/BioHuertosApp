import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinaryService";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { image?: string; tipo?: string };
    const { image, tipo } = body;

    if (!image || !tipo) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: image y tipo." }, 
        { status: 400 }
      );
    }

    // Identificar a qué carpeta mapeada pertenece en tu configuración
    let folderDestino: string = CLOUDINARY_FOLDERS.biohuertos; // Por defecto
    
    if (tipo === 'perfil') folderDestino = CLOUDINARY_FOLDERS.perfiles;
    else if (tipo === 'parcela') folderDestino = CLOUDINARY_FOLDERS.parcelas;
    else if (tipo === 'plaga') folderDestino = CLOUDINARY_FOLDERS.plagas;
    else if (tipo === 'cosecha') folderDestino = CLOUDINARY_FOLDERS.cosechas;

    // Subir imagen a tu cuenta real de Cloudinary
    const urlSegura = await uploadImageToCloudinary(image, folderDestino);

    // Retornar la URL lista para ser guardada en la base de datos de Neon
    return NextResponse.json({ url: urlSegura }, { status: 200 });

  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Error al procesar la imagen." }, { status: 500 });
  }
}