import { NextRequest, NextResponse } from "next/server";
import { validarCredenciales } from "@/lib/services/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const usuario = await validarCredenciales(email, password);

    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    return NextResponse.json({ data: usuario });
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
