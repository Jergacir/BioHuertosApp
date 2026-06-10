import { NextRequest, NextResponse } from "next/server";
import { listarBiohuertoCercanos } from "@/lib/services/biohuertos";
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radioKm = parseFloat(searchParams.get("radio") ?? "20");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Parámetros lat y lng son requeridos." },
      { status: 400 }
    );
  }

  try {
    const data = await listarBiohuertoCercanos(lat, lng, radioKm);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/biohuertos/cercanos]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
