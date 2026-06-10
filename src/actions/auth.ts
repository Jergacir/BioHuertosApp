"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validarCredenciales, crearUsuario } from "@/lib/services/auth";
import type { LoginFormData, RegisterFormData } from "@/types";

export async function loginAction(data: LoginFormData) {
  const usuario = await validarCredenciales(data.email, data.password);
  if (!usuario) return { error: "Credenciales inválidas." };

  const cookieStore = await cookies();
  cookieStore.set("bioned_session", usuario.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function registerAction(data: RegisterFormData) {
  try {
    await crearUsuario(data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al registrar." };
  }
  redirect("/login");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bioned_session");
  redirect("/login");
}
