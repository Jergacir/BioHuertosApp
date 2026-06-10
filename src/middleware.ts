import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de protección de rutas.
 * Redirige al login si no existe la cookie de sesión activa.
 *
 * NOTA: La lógica de validación del token (JWT / cookie firmada) se
 * implementará en src/actions/auth.ts. Aquí sólo verificamos su existencia.
 */

const PROTECTED_PATHS = ["/dashboard", "/biohuertos", "/cultivos", "/finanzas", "/fitosanitario", "/alertas", "/parcelas"];
const AUTH_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("bioned_session")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirigir al login si intenta acceder a ruta protegida sin sesión
  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya tiene sesión y va a login/register, redirigir al dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
