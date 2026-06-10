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

// ─── Marketplace ──────────────────────────────────────────────────────────────

export interface BiohuertoCercano {
  id: string;
  nombre_huerto: string;
  direccion_texto: string;
  foto_portada_url: string | null;
  distancia_km: number;
}

export interface CosechaPublica {
  id: string;
  titulo: string;
  descripcion?: string | null;
  precioPorKg: number;
  cantidadDisponible: number;
  imagenUrl?: string | null;
  biohuerto: {
    nombreHuerto: string;
    distanciaKm?: number;
    telefonoProductor?: string;
  };
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
