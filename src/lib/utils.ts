/**
 * Formatea un número como moneda peruana (S/.)
 * Ej: formatCurrency(4.5) → "S/. 4.50"
 */
export function formatCurrency(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}

/**
 * Formatea una fecha a string legible en español
 * Ej: formatDate(new Date()) → "10 de junio de 2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formatea una distancia en metros o kilómetros
 * Ej: formatDistance(800) → "800 m"  /  formatDistance(1500) → "1.5 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Genera la URL de redirección a WhatsApp con mensaje predefinido
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
