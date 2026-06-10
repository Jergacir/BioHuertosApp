/**
 * Configuración del SDK de Cloudinary para subida de fotos.
 * Instalar cuando se necesite: pnpm add cloudinary
 *
 * Variables de entorno requeridas en .env:
 *   CLOUDINARY_CLOUD_NAME=
 *   CLOUDINARY_API_KEY=
 *   CLOUDINARY_API_SECRET=
 */

export const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
};

/**
 * Carpetas por tipo de imagen para mantener organización en Cloudinary
 */
export const CLOUDINARY_FOLDERS = {
  perfiles: "bioned/perfiles",
  biohuertos: "bioned/biohuertos",
  parcelas: "bioned/parcelas",
  plagas: "bioned/plagas",
  cosechas: "bioned/cosechas",
} as const;
