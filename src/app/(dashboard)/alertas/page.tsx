"use client";

export default function AlertasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Alertas y Recordatorios</h1>
        <p className="mt-1 text-slate-600">Tareas pendientes y notificaciones importantes</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition">
          📋 Todas
        </button>
        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
          ⚠️ Urgentes
        </button>
        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
          🔔 Por Vencer
        </button>
      </div>

      {/* Alertas Críticas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Alertas Críticas</h2>
        
        <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-6">
          <div className="flex gap-4">
            <span className="text-2xl">🦠</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Posible Enfermedad Detectada</h3>
              <p className="mt-1 text-sm text-red-700">
                Se detectó posible Mildiu polvoso en la Cama #3 (Tomates). Confianza: 87%
              </p>
              <p className="mt-2 text-xs text-red-600 font-medium">Hace 2 horas</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition">
                  Ver Diagnóstico
                </button>
                <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                  Descartar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recordatorios Programados */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Recordatorios</h2>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex gap-4">
            <span className="text-2xl">💧</span>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Riego - Lechugas (Cama #1)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Próximo riego programado en 2 horas. Humedad del suelo: 65%
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Hoy a las 4:30 PM</p>
            </div>
            <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-4">
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Abonado - Tomates (Cama #3)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Es hora de aplicar el fertilizante según el plan de nutrición
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Mañana a las 8:00 AM</p>
            </div>
            <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
          <div className="flex gap-4">
            <span className="text-2xl">✂️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Cosecha - Lechugas (Cama #1)</h3>
              <p className="mt-1 text-sm text-slate-600">
                Las lechugas están listas para cosechar. Temperatura óptima confirmada.
              </p>
              <p className="mt-2 text-xs text-slate-500 font-medium">Esta semana</p>
              <div className="mt-3">
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
                  Registrar Cosecha
                </button>
              </div>
            </div>
            <input type="checkbox" className="mt-1 h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Tareas Completadas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Completadas Recientemente</h2>
        
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 opacity-60">
          <div className="flex gap-4">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-700">Riego - Pimientos (Cama #2)</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium">Completado hace 4 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
