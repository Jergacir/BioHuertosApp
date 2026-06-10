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
