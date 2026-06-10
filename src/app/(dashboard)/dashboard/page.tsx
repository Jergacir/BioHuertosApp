import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { obtenerUsuarioPorId } from "@/lib/services/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("bioned_session")?.value;

  let usuario = null;
  let biohuerto = null;

  if (sessionId) {
    usuario = await obtenerUsuarioPorId(sessionId);
    
    // Obtener el primer biohuerto del usuario
    if (usuario) {
      biohuerto = await db.biohuerto.findFirst({
        where: { duenoId: usuario.id },
        include: {
          parcelas: {
            include: {
              cultivos: {
                include: {
                  plantaUsuario: {
                    include: { plantaMaestra: true },
                  },
                },
              },
            },
          },
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con Saludo */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">¡Hola, {usuario?.nombreCompleto?.split(" ")[0]}!</h1>
        <p className="mt-2 text-emerald-100">
          {biohuerto
            ? `Tu biohuerto "${biohuerto.nombreHuerto}" en ${biohuerto.direccionTexto} está en día. 🌤️`
            : "Bienvenido a tu panel de control. Crea tu primer biohuerto para empezar."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Neto */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500">Balance Neto</h3>
          <p className="mt-3 text-3xl font-bold text-slate-900">S/. 12,450.00</p>
          <p className="mt-2 text-xs text-slate-400">Ingresos - Gastos del mes</p>
        </div>

        {/* Ingresos del Mes */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-emerald-700">Ingresos del Mes</h3>
              <p className="mt-3 text-2xl font-bold text-emerald-600">S/. 8,200</p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-red-700">Gastos del Mes</h3>
              <p className="mt-3 text-2xl font-bold text-red-600">S/. 3,750</p>
            </div>
            <span className="text-3xl">📉</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex gap-4">
        <a
          href="/dashboard/biohuertos"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          ➕ Nuevo Biohuerto
        </a>
        <a
          href="/dashboard/cultivos"
          className="inline-flex items-center gap-2 rounded-full bg-slate-600 px-6 py-3 font-medium text-white hover:bg-slate-700 transition"
        >
          🌱 Nuevo Cultivo
        </a>
      </div>

      {/* Proyección de Cosecha */}
      {biohuerto && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Proyección de Cosecha</h3>
          <div className="flex h-40 items-end gap-2 bg-slate-50 p-4 rounded-lg">
            {[20, 30, 25, 45, 35, 28, 32].map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-lg ${
                  i === 3 ? "bg-emerald-600" : "bg-emerald-200"
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alertas Recientes */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">IA: Posible Tizón Tardío detectado en Tomate</h3>
            <p className="mt-1 text-sm text-yellow-700">
              Nivel de Confianza: 94%. Se recomienda inspección visual inmediata en la Cama #1.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-yellow-600 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition">
                Ignorar
              </button>
              <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
                Ver Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

