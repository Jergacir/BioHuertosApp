import { db } from "@/lib/db";
import type { RegisterFormData, SessionUser } from "@/types";

export async function validarCredenciales(
  email: string,
  password: string
): Promise<SessionUser | null> {
  // SOLO PARA ENTORNO DE PRUEBAS: validación sin encriptación
  const usuarioRecord = await db.usuario.findFirst({
    where: { email },
    select: {
      id: true,
      nombreCompleto: true,
      email: true,
      fotoPerfilUrl: true,
      passwordHash: true,
      rol: { select: { nombre: true } },
    },
  });

  if (!usuarioRecord) return null;

  // Validar contraseña en texto plano (SOLO DESARROLLO)
  if (usuarioRecord.passwordHash !== password) return null;

  return {
    id: usuarioRecord.id,
    nombreCompleto: usuarioRecord.nombreCompleto,
    email: usuarioRecord.email,
    fotoPerfilUrl: usuarioRecord.fotoPerfilUrl,
    rol: usuarioRecord.rol.nombre as SessionUser["rol"],
  };
}

export async function crearUsuario(data: RegisterFormData) {
  const existing = await db.usuario.findFirst({ where: { email: data.email } });
  if (existing) throw new Error("Ya existe una cuenta con ese correo.");

  const rol = await db.rol.findFirst({ where: { nombre: data.rol } });
  if (!rol) throw new Error("Rol no válido.");

  // SOLO PARA ENTORNO DE PRUEBAS: guardar contraseña sin encriptación
  return db.usuario.create({
    data: {
      rolId: rol.id,
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      telefono: data.telefono ?? null,
      passwordHash: data.password,
    },
    select: { id: true, nombreCompleto: true, email: true },
  });
}

export async function obtenerUsuarioPorId(id: string): Promise<SessionUser | null> {
  const usuario = await db.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombreCompleto: true,
      email: true,
      fotoPerfilUrl: true,
      rol: { select: { nombre: true } },
    },
  });

  if (!usuario) return null;

  return {
    id: usuario.id,
    nombreCompleto: usuario.nombreCompleto,
    email: usuario.email,
    fotoPerfilUrl: usuario.fotoPerfilUrl,
    rol: usuario.rol.nombre as SessionUser["rol"],
  };
}
