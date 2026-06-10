/**
 * Tipos globales personalizados para BioNed.
 * Los tipos de los modelos de BD se generan automáticamente por Prisma.
 */

// ─── Auth ──────────────────────────────────────────────────────────────────────

export type RolNombre = "PRODUCTOR" | "COMPRADOR" | "ADMIN";

export interface SessionUser {
  id: string;
  nombreCompleto: string;
  email: string;
  rol: RolNombre;
  fotoPerfilUrl?: string | null;
}

// ─── Marketplace DTOs (datos ya serializados para Client Components) ──────────
// Estos tipos representan exactamente lo que llega al cliente después de
// pasar por la frontera Server→Client: sin Decimal, sin Date como objetos.

export interface CosechaDTO {
  id: string;
  titulo: string;
  descripcion: string | null;
  precioPorKg: number;          // Decimal → number
  cantidadDisponible: number;   // Decimal → number
  imagenUrl: string | null;
  activa: boolean;
  fechaPublicacion: string;     // Date → string ISO
  cultivo: {
    id: string;
    etapaActual: string;
    plantaUsuario: {
      nombrePersonalizado: string | null;
      plantaMaestra: {
        nombreComun: string;
        iconoUrl: string | null;
      } | null;
    };
    parcela: {
      nombreIdentificador: string;
      biohuerto: {
        nombreHuerto: string;
        direccionTexto: string;
        fotoPortadaUrl: string | null;
        dueno: {
          telefono: string | null;
        };
      };
    };
  };
}

export interface BiohuertoPrevioDTO {
  id: string;
  nombreHuerto: string;
  descripcion: string | null;
  direccionTexto: string;
  fotoPortadaUrl: string | null;
  areaMetrosCuadrados: number;  // Decimal → number
  dueno: {
    nombreCompleto: string;
    telefono: string | null;
  };
  parcelas: { _count: unknown }[];
}

// ─── Perfil público del biohuerto (página "tiendita") ─────────────────────────

export interface CosechaPerfilDTO {
  id: string;
  titulo: string;
  descripcion: string | null;
  precioPorKg: number;
  cantidadDisponible: number;
  imagenUrl: string | null;
  etapaActual: string;
  nombrePlanta: string;
}

export interface BiohuertoPerfilDTO {
  id: string;
  nombreHuerto: string;
  descripcion: string | null;
  direccionTexto: string;
  fotoPortadaUrl: string | null;
  areaMetrosCuadrados: number;
  fechaCreacion: string;           // Date → ISO string
  dueno: {
    nombreCompleto: string;
    telefono: string | null;
    fotoPerfilUrl: string | null;
  };
  totalParcelas: number;
  totalCultivos: number;
  cosechas: CosechaPerfilDTO[];
}

// ─── Formularios ──────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  nombreCompleto: string;
  email: string;
  telefono?: string;
  password: string;
  rol: RolNombre;
}

export interface CultivoFormData {
  parcelaId: string;
  plantaUsuarioId: string;
  fechaSiembra: string;
  cantidadSembrada: string;
  metodoSiembra?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ─── Gestión de Biohuertos y Parcelas ─────────────────────────────────────────
// DTOs y payloads del módulo GestorBiohuertos.
// Todos los valores Decimal se serializan como number y los Date como string ISO
// antes de cruzar la frontera Server→Client.

/** DTO para la card de listado de biohuertos */
export interface BiohuertoDashboardDTO {
  id: string;
  nombreHuerto: string;
  descripcion: string | null;
  direccionTexto: string;
  fotoPortadaUrl: string | null;
  areaMetrosCuadrados: number;        // Decimal → number
  fechaCreacion: string;              // Date → ISO string
  lat: number | null;                 // extraído de ubicacionGeo
  lng: number | null;                 // extraído de ubicacionGeo
  nParcelasActivas: number;           // count(parcelas activas)
}

/** DTO para la vista de detalle de un biohuerto */
export interface BiohuertDetalleDTO extends BiohuertoDashboardDTO {
  parcelas: ParcelaDashboardDTO[];
  poligono: [number, number][] | null; // vértices del area_geografica
}

/** DTO para un elemento de la lista de parcelas */
export interface ParcelaDashboardDTO {
  id: string;
  biohuertoId: string;
  nombreIdentificador: string;
  areaMetrosCuadrados: number;        // Decimal → number
  tipoSuelo: string | null;
  fechaCreacion: string;              // Date → ISO string
  lat: number | null;
  lng: number | null;
  poligono: [number, number][] | null;
  nCultivosActivos: number;
}

/** Payload para crear/editar biohuerto (Server Action) */
export interface BiohuertFormPayload {
  nombreHuerto: string;
  descripcion?: string;
  direccionTexto: string;
  areaMetrosCuadrados: number;
  lat?: number;
  lng?: number;
  poligono?: [number, number][];
  fotoPortadaUrl?: string;
}

/** Payload para crear/editar parcela (Server Action) */
export interface ParcelaFormPayload {
  biohuertoId: string;
  nombreIdentificador: string;
  areaMetrosCuadrados: number;
  tipoSuelo?: string;
  lat?: number;
  lng?: number;
  poligono?: [number, number][];
}
