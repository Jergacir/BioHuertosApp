import { NextRequest, NextResponse } from "next/server";
import { listarDiagnosticos, guardarDiagnostico } from "@/lib/services/fitosanitario";

export async function GET(req: NextRequest) {
  const cultivoId = req.nextUrl.searchParams.get("cultivoId");

  if (!cultivoId) {
    return NextResponse.json(
      { error: "cultivoId es requerido." },
      { status: 400 }
    );
  }

  try {
    const data = await listarDiagnosticos(cultivoId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/fitosanitario]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await guardarDiagnostico(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/fitosanitario]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
