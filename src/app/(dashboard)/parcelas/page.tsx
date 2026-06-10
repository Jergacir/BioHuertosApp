"use client";

import { useState } from "react";

export default function ParcelasPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedBiohuerto, setSelectedBiohuerto] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parcelas</h1>
          <p className="mt-1 text-slate-600">Gestiona las subdivisiones de tus biohuertos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          ➕ Nueva Parcela
        </button>
      </div>

      {/* Filtro por Biohuerto */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Selecciona un Biohuerto</label>
        <select
          value={selectedBiohuerto}
          onChange={(e) => setSelectedBiohuerto(e.target.value)}
          className="block w-full md:w-96 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Todos los biohuertos</option>
          <option value="1">Huerto Las Brisas</option>
          <option value="2">Huerto Principal</option>
        </select>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">Crear Nueva Parcela</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Biohuerto</label>
              <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                <option value="">Selecciona un biohuerto...</option>
                <option value="1">Huerto Las Brisas</option>
                <option value="2">Huerto Principal</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre de la Parcela</label>
                <input
                  type="text"
                  placeholder="Ej: Cama #1"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Área (m²)</label>
                <input
                  type="number"
                  placeholder="Ej: 10"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Tipo de Suelo</label>
              <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                <option value="">Selecciona...</option>
                <option value="arcilloso">Arcilloso</option>
                <option value="arenoso">Arenoso</option>
                <option value="franco">Franco</option>
                <option value="turba">Turba/Sustrato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción (opcional)</label>
              <textarea
                placeholder="Notas adicionales..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 transition"
              >
                Crear Parcela
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

      {/* Lista de Parcelas */}
      <div className="grid gap-4">
        {/* Placeholder */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <span className="text-5xl">🌾</span>
          <p className="mt-4 text-lg font-medium text-slate-900">No hay parcelas creadas</p>
          <p className="mt-1 text-slate-600">Crea tu primera parcela para organizar tus cultivos</p>
        </div>
      </div>

      {/* Tabla de Parcelas (si las hay) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Parcelas</h2>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Parcela</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Biohuerto</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Área</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Tipo Suelo</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Cultivos</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No hay parcelas registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
