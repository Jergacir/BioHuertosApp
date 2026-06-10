/**
 * Módulo de validación pura para Biohuertos y Parcelas.
 * Todas las funciones son puras (sin efectos secundarios ni I/O).
 *
 * Valida: Requirements 3.7, 3.8, 8.4, 8.5, 11.1, 11.2, 13.1, 13.4
 */

export interface ValidationResult {
  valido: boolean;
  error?: string;
}

/**
 * Valida el nombre de un biohuerto o parcela.
 *
 * Regla: el nombre (después de recortar espacios) debe tener al menos 1
 * carácter y no más de 100 caracteres.
 *
 * Valida: Requirements 3.7, 8.4
 */
export function validarNombre(nombre: string): ValidationResult {
  const trimmed = nombre.trim();

  if (trimmed.length === 0) {
    return {
      valido: false,
      error: "El nombre es obligatorio y no puede estar vacío.",
    };
  }

  if (trimmed.length > 100) {
    return {
      valido: false,
      error: `El nombre no puede superar los 100 caracteres (actualmente tiene ${trimmed.length}).`,
    };
  }

  return { valido: true };
}

/**
 * Valida el área en metros cuadrados de un biohuerto o parcela.
 *
 * Regla: el área debe ser un número finito positivo mayor a 0.
 *
 * Valida: Requirements 3.8, 8.5
 */
export function validarArea(area: number): ValidationResult {
  if (isNaN(area)) {
    return {
      valido: false,
      error: "El área debe ser un número válido.",
    };
  }

  if (!isFinite(area)) {
    return {
      valido: false,
      error: "El área debe ser un número finito.",
    };
  }

  if (area <= 0) {
    return {
      valido: false,
      error: "El área debe ser un valor positivo mayor a 0.",
    };
  }

  return { valido: true };
}

/** Tipos MIME de imagen permitidos para la foto de portada. */
const TIPOS_IMAGEN_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Tamaño máximo de archivo de imagen: 5 MB en bytes. */
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

/**
 * Valida un archivo de imagen por tipo MIME y tamaño.
 *
 * Regla: el tipo debe ser image/jpeg, image/png o image/webp,
 * y el tamaño no debe superar 5 MB (5 * 1024 * 1024 bytes).
 *
 * Valida: Requirements 13.1, 13.4
 */
export function validarImagenArchivo(
  tipo: string,
  tamanioBytes: number
): ValidationResult {
  if (!TIPOS_IMAGEN_PERMITIDOS.has(tipo)) {
    return {
      valido: false,
      error:
        "El archivo debe ser una imagen en formato JPEG, PNG o WebP.",
    };
  }

  if (tamanioBytes > TAMANO_MAXIMO_BYTES) {
    const tamanoMB = (tamanioBytes / (1024 * 1024)).toFixed(2);
    return {
      valido: false,
      error: `El archivo pesa ${tamanoMB} MB y supera el límite máximo de 5 MB.`,
    };
  }

  return { valido: true };
}

/**
 * Calcula el área disponible en el biohuerto y valida si una nueva parcela
 * cabe dentro del espacio restante.
 *
 * Disponible = areaBiohuerto - suma(areasParcelasActivas)
 * Válido     = (suma(areasParcelasActivas) + areaNueva) <= areaBiohuerto
 *
 * Valida: Requirements 8.2, 9.2, 11.1, 11.2
 */
export function calcularDisponibilidadArea(
  areaBiohuerto: number,
  areasParcelasActivas: number[],
  areaNueva: number
): { valido: boolean; disponible: number } {
  const sumaExistentes = areasParcelasActivas.reduce(
    (acum, area) => acum + area,
    0
  );

  const disponible = areaBiohuerto - sumaExistentes;
  const valido = sumaExistentes + areaNueva <= areaBiohuerto;

  return { valido, disponible };
}
