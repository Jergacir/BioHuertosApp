"use client";

import { useState } from "react";

export default function FitosanitarioPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Diagnóstico Fitosanitario</h1>
          <p className="mt-1 text-slate-600">Monitorea la salud de tus plantas y detecta plagas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          📸 Registrar Diagnóstico
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">Registrar Nuevo Diagnóstico</h2>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Cultivo Afectado</label>
                <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                  <option value="">Selecciona un cultivo...</option>
                  <option value="tomate">Tomates (Cama #3)</option>
                  <option value="lechuga">Lechugas (Cama #1)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Problema</label>
                <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                  <option value="">Selecciona...</option>
                  <option value="plaga">Plaga</option>
                  <option value="enfermedad">Enfermedad</option>
                  <option value="deficiencia">Deficiencia Nutricional</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción de Síntomas</label>
              <textarea
                placeholder="Describe lo que observas..."
                rows={4}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Fotografía (opcional)</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 transition"
              >
                Analizar con IA
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de Diagnósticos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Historial de Diagnósticos</h2>

        <div className="space-y-4">
          {/* Diagnóstico 1 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🦠</span>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Mildiu Polvoso</h3>
                    <p className="text-sm text-slate-600 mt-1">Tomates (Cama #3)</p>
                  </div>
                  <span className="inline-block rounded-full bg-red-200 px-3 py-1 text-xs font-semibold text-red-700">
                    CRÍTICO
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Presencia de polvo blanco en las hojas. Nivel de infección: 40% de la planta.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="text-sm font-medium text-red-700 hover:text-red-900 underline">
                    Ver Recomendaciones
                  </button>
                  <span className="text-sm text-slate-500">•</span>
                  <button className="text-sm font-medium text-red-700 hover:text-red-900 underline">
                    Registrar Tratamiento
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnóstico 2 */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🐛</span>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Ácaros Tetranychus</h3>
                    <p className="text-sm text-slate-600 mt-1">Lechugas (Cama #1)</p>
                  </div>
                  <span className="inline-block rounded-full bg-yellow-200 px-3 py-1 text-xs font-semibold text-yellow-700">
                    MODERADO
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Manchas amarillas en las hojas. Presencia de telaraña fina en envés de hojas.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="text-sm font-medium text-yellow-700 hover:text-yellow-900 underline">
                    Ver Recomendaciones
                  </button>
                  <span className="text-sm text-slate-500">•</span>
                  <button className="text-sm font-medium text-yellow-700 hover:text-yellow-900 underline">
                    Registrar Tratamiento
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vacío */}
        <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center mt-4">
          <p className="text-slate-600">
            Carga de diagnósticos completada. Total de registros: 2
          </p>
        </div>
      </div>
    </div>
  );
}
