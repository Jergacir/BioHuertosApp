import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { obtenerUsuarioPorId } from "@/lib/services/auth";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subColor = "text-slate-400",
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{value}</p>
      {sub && <p className={`mt-1 text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("bioned_session")?.value;

  let usuario = null;
  let stats = { cultivos: 0, cosechas: 0, alertas: 0 };
  let alertasRecientes: { id: string; titulo: string; tipoAlerta: string; descripcion: string | null; fechaProgramada: Date }[] = [];
  let alertasTareas: { id: string; titulo: string; completada: boolean; tipoAlerta: string; parcela?: string }[] = [];
  let finanzasMeses: { mes: string; ingresos: number; costos: number }[] = [];
  let monitoreo: {
    humedadSuelo: { toString(): string } | null;
    temperaturaAmbiente: { toString(): string } | null;
    luminosidadPorcentaje: { toString(): string } | null;
    incidenciasRelevantes: string | null;
    fechaRegistro: Date;
  } | null = null;

  if (sessionId) {
    usuario = await obtenerUsuarioPorId(sessionId);

    if (usuario) {
      const [cultivosCount, alertasCount, alertasData, finanzasData, ultimoMonitoreo] = await Promise.all([
        db.cultivo.count({
          where: { parcela: { biohuerto: { duenoId: usuario.id } } },
        }),
        db.alertaRecordatorio.count({
          where: { biohuerto: { duenoId: usuario.id }, completada: false },
        }),
        db.alertaRecordatorio.findMany({
          where: { biohuerto: { duenoId: usuario.id } },
          orderBy: { fechaCreacion: "desc" },
          take: 8,
        }),
        db.registroFinanciero.findMany({
          where: { biohuerto: { duenoId: usuario.id } },
          orderBy: { fechaTransaccion: "desc" },
          take: 100,
        }),
        db.monitoreoCultivo.findFirst({
          where: { cultivo: { parcela: { biohuerto: { duenoId: usuario.id } } } },
          orderBy: { fechaRegistro: "desc" },
          select: {
            humedadSuelo: true,
            temperaturaAmbiente: true,
            luminosidadPorcentaje: true,
            incidenciasRelevantes: true,
            fechaRegistro: true,
          },
        }),
      ]);

      monitoreo = ultimoMonitoreo;

      const cosechasCount = await db.cultivo.count({
        where: {
          parcela: { biohuerto: { duenoId: usuario.id } },
          etapaActual: "Cosecha",
        },
      });

      stats = { cultivos: cultivosCount, cosechas: cosechasCount, alertas: alertasCount };
      alertasRecientes = alertasData.slice(0, 3);
      alertasTareas = alertasData.slice(0, 3).map((a) => ({
        id: a.id,
        titulo: a.titulo,
        completada: a.completada,
        tipoAlerta: a.tipoAlerta,
      }));

      // Agrupar finanzas por mes (últimos 6 meses)
      const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const now = new Date();
      finanzasMeses = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const mes = meses[d.getMonth()];
        const registrosMes = finanzasData.filter((r) => {
          const rd = new Date(r.fechaTransaccion);
          return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
        });
        return {
          mes,
          ingresos: registrosMes.filter((r) => r.tipoTransaccion === "INGRESO").reduce((a, r) => a + Number(r.monto), 0),
          costos: registrosMes.filter((r) => r.tipoTransaccion === "EGRESO").reduce((a, r) => a + Number(r.monto), 0),
        };
      });
    }
  }

  const nombre = usuario?.nombreCompleto?.split(" ")[0] ?? "Productor";
  const maxFinanza = Math.max(...finanzasMeses.map((m) => Math.max(m.ingresos, m.costos)), 1);

  const alertaIconos: Record<string, { bg: string; icon: string }> = {
    Riego: { bg: "bg-blue-50", icon: "💧" },
    Fertilización: { bg: "bg-amber-50", icon: "🌿" },
    Cosecha: { bg: "bg-emerald-50", icon: "🌾" },
    Prevención: { bg: "bg-orange-50", icon: "⚠️" },
    default: { bg: "bg-slate-50", icon: "🔔" },
  };

  return (
    <div className="space-y-6">

      {/* ── Saludo ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Hola, {nombre}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Aquí tienes el resumen de tu producción hoy.
        </p>
      </div>

      {/* ── Stats + Alertas lado a lado ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* Izquierda */}
        <div className="space-y-6">

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Cultivos Activos"
              value={stats.cultivos.toString().padStart(2, "0")}
              sub="+2 este mes"
              subColor="text-emerald-600"
              iconBg="bg-emerald-50"
              icon={
                <svg viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="1.6" className="h-5 w-5">
                  <path d="M10 17V8" strokeLinecap="round" />
                  <path d="M10 12c-2-2-5-2-6-1M10 9c2-3 5-3 6-1" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              label="Próximas Cosechas"
              value={stats.cosechas.toString().padStart(2, "0")}
              sub="En los próximos 7 días"
              subColor="text-slate-400"
              iconBg="bg-orange-50"
              icon={
                <svg viewBox="0 0 20 20" fill="none" stroke="#f97316" strokeWidth="1.6" className="h-5 w-5">
                  <rect x="3" y="4" width="14" height="13" rx="2" />
                  <path d="M3 8h14M7 2v4M13 2v4" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              label="Alertas Pendientes"
              value={stats.alertas.toString().padStart(2, "0")}
              sub={stats.alertas > 0 ? "Requiere atención hoy" : "Todo en orden"}
              subColor={stats.alertas > 0 ? "text-red-500" : "text-emerald-600"}
              iconBg="bg-red-50"
              icon={
                <svg viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.6" className="h-5 w-5">
                  <path d="M10 3L2 16h16L10 3Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 9v3M10 14h.01" strokeLinecap="round" />
                </svg>
              }
            />
          </div>

          {/* Mapa / foto de campo */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div
              className="h-72 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* Badges */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Vista General
                </span>
                <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                  Parcelas Activas
                </span>
              </div>
              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white" type="button">+</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white" type="button">−</button>
              </div>
            </div>
          </div>

          {/* Gráfico Costos vs Ingresos */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Costos vs Ingresos (Mensual)</h3>
                <p className="mt-0.5 text-xs text-slate-400">Rendimiento financiero del último semestre</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  Costos
                </span>
              </div>
            </div>

            {finanzasMeses.length > 0 ? (
              <div className="mt-6 flex items-end gap-3 px-2" style={{ height: 160 }}>
                {finanzasMeses.map((m) => (
                  <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end gap-1" style={{ height: 130 }}>
                      <div
                        className="flex-1 rounded-t-lg bg-emerald-600 transition-all"
                        style={{ height: `${Math.max(4, (m.ingresos / maxFinanza) * 100)}%` }}
                      />
                      <div
                        className="flex-1 rounded-t-lg bg-slate-200 transition-all"
                        style={{ height: `${Math.max(4, (m.costos / maxFinanza) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{m.mes}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-slate-50">
                <p className="text-sm text-slate-400">Sin registros financieros aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Derecha */}
        <div className="space-y-4">

          {/* Clima */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Clima Actual</span>
              <span className="text-xs text-slate-400">Chiclayo, PE</span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-4xl">☀️</span>
              <div>
                <p className="text-3xl font-bold text-slate-900">26°C</p>
                <p className="text-xs text-slate-400">Soleado</p>
              </div>
              <div className="ml-auto text-right text-xs text-slate-400 space-y-0.5">
                <p>Humedad: 68%</p>
                <p>Viento: 14km/h</p>
              </div>
            </div>
          </div>

          {/* Alertas Recientes */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Alertas Recientes</h3>
              <Link href="/dashboard/alertas" className="text-xs font-semibold text-emerald-700 hover:underline">
                Ver todas
              </Link>
            </div>

            {alertasRecientes.length === 0 ? (
              <p className="text-xs text-slate-400">Sin alertas recientes</p>
            ) : (
              <div className="space-y-2">
                {alertasRecientes.map((alerta) => {
                  const { bg, icon } = alertaIconos[alerta.tipoAlerta] ?? alertaIconos.default;
                  return (
                    <div key={alerta.id}
                      className={`flex items-start gap-3 rounded-xl ${bg} px-3 py-3`}>
                      <span className="mt-0.5 text-base">{icon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">{alerta.titulo}</p>
                        <p className="text-[10px] text-slate-400">
                          {alerta.tipoAlerta} • {alerta.descripcion?.slice(0, 30) ?? "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tareas Prioritarias */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Tareas Prioritarias</h3>

            {alertasTareas.length === 0 ? (
              <p className="text-xs text-slate-400">Sin tareas pendientes</p>
            ) : (
              <div className="space-y-2">
                {alertasTareas.map((tarea) => (
                  <div key={tarea.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 transition hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          tarea.completada ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {tarea.completada ? "Completado" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">{tarea.titulo}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>📍</span> {tarea.tipoAlerta}
                      </p>
                    </div>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0 text-slate-300">
                      <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            <Link href="/dashboard/alertas"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800">
              Nueva Tarea
            </Link>
          </div>

          {/* Últimos monitoreos */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Monitoreo de Suelo
              </h3>
              <Link href="/dashboard/cultivos" className="text-xs font-semibold text-emerald-700 hover:underline">
                Ver cultivos
              </Link>
            </div>

            {monitoreo ? (
              <div className="space-y-4">
                {/* Humedad */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">Humedad</span>
                    <span className={`text-sm font-bold ${
                      Number(monitoreo.humedadSuelo) < 40 ? "text-red-500" :
                      Number(monitoreo.humedadSuelo) > 80 ? "text-blue-500" : "text-emerald-600"
                    }`}>
                      {Number(monitoreo.humedadSuelo).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${Math.min(Number(monitoreo.humedadSuelo), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Temperatura */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">Temperatura</span>
                    <span className={`text-sm font-bold ${
                      Number(monitoreo.temperaturaAmbiente) > 35 ? "text-red-500" :
                      Number(monitoreo.temperaturaAmbiente) < 10 ? "text-blue-500" : "text-amber-600"
                    }`}>
                      {Number(monitoreo.temperaturaAmbiente).toFixed(1)}°C
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${Math.min((Number(monitoreo.temperaturaAmbiente) / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Luminosidad */}
                {monitoreo.luminosidadPorcentaje && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">Luminosidad</span>
                      <span className="text-sm font-bold text-sky-600">
                        {Number(monitoreo.luminosidadPorcentaje).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-400 transition-all"
                        style={{ width: `${Math.min(Number(monitoreo.luminosidadPorcentaje), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {monitoreo.incidenciasRelevantes && monitoreo.incidenciasRelevantes !== "Ninguna" && (
                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    ⚠️ {monitoreo.incidenciasRelevantes}
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  Último registro: {new Date(monitoreo.fechaRegistro).toLocaleString("es-PE", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-3xl">🌱</span>
                <p className="mt-2 text-xs text-slate-400">Sin registros de monitoreo aún</p>
                <Link href="/dashboard/cultivos"
                  className="mt-3 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Registrar monitoreo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
