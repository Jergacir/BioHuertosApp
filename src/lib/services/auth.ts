import { db } from "@/lib/db";
import { createHash } from "crypto";
import type { RegisterFormData, SessionUser } from "@/types";

function hashPassword(password: string): string {
  // TODO: reemplazar por bcrypt en producción
  return createHash("sha256").update(password).digest("hex");
}

export async function validarCredenciales(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const passwordHash = hashPassword(password);

  const usuario = await db.usuario.findFirst({
    where: { email, passwordHash },
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

export async function crearUsuario(data: RegisterFormData) {
  const existing = await db.usuario.findFirst({ where: { email: data.email } });
  if (existing) throw new Error("Ya existe una cuenta con ese correo.");

  const rol = await db.rol.findFirst({ where: { nombre: data.rol } });
  if (!rol) throw new Error("Rol no válido.");

  return db.usuario.create({
    data: {
      rolId: rol.id,
      nombreCompleto: data.nombreCompleto,
      email: data.email,
      telefono: data.telefono ?? null,
      passwordHash: hashPassword(data.password),
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
