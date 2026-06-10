import { NextRequest, NextResponse } from "next/server";
import { listarCultivos, crearCultivo } from "@/lib/services/cultivos";
import type { CultivoFormData } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const biohuertoId = searchParams.get("biohuertoId") ?? undefined;
  const etapa = searchParams.get("etapa") ?? undefined;

  try {
    const data = await listarCultivos({ biohuertoId, etapa });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/cultivos]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CultivoFormData;
    const data = await crearCultivo(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cultivos]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
