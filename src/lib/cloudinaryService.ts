// src/lib/cloudinaryService.ts
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG, CLOUDINARY_FOLDERS } from './cloudinary'; // Ajusta la ruta según tu proyecto

// Inicializar la configuración global de Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloud_name,
  api_key: CLOUDINARY_CONFIG.api_key,
  api_secret: CLOUDINARY_CONFIG.api_secret,
  secure: true,
});

/**
 * Sube una imagen en formato Base64 o Buffer a una carpeta específica de BioNed.
 * @param fileStr - La imagen codificada en base64 o ruta temporal
 * @param folder - Carpeta destino (usar CLOUDINARY_FOLDERS)
 */
export async function uploadImageToCloudinary(fileStr: string, folder: string): Promise<string> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
      resource_type: 'image',
    });
    
    // Retorna la URL segura (https) lista para guardar en la base de datos
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    throw new Error("No se pudo subir la imagen");
  }
}