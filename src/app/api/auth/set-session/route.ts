import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string };
    if (!body?.id) {
      return NextResponse.json({ error: "Falta id del usuario." }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("bioned_session", body.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("[POST /api/auth/set-session]", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
