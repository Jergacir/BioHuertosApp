"use client";

import { useState } from "react";

export default function FinanzasPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Finanzas</h1>
          <p className="mt-1 text-slate-600">Gestiona gastos, ingresos y rentabilidad</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          ➕ Registrar Movimiento
        </button>
      </div>

      {/* Resumen Financiero */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-500">Balance Total</h3>
          <p className="mt-3 text-2xl font-bold text-slate-900">S/. 12,450.00</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">+5.2% vs mes anterior</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="text-sm font-semibold text-emerald-700">Ingresos</h3>
          <p className="mt-3 text-2xl font-bold text-emerald-600">S/. 25,800.00</p>
          <p className="mt-1 text-xs text-emerald-600">De ventas en marketplace</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-sm font-semibold text-red-700">Gastos</h3>
          <p className="mt-3 text-2xl font-bold text-red-600">S/. 13,350.00</p>
          <p className="mt-1 text-xs text-red-600">Insumos y mantenimiento</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-sm font-semibold text-blue-700">Rentabilidad</h3>
          <p className="mt-3 text-2xl font-bold text-blue-600">48.2%</p>
          <p className="mt-1 text-xs text-blue-600">Este mes</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">Registrar Movimiento</h2>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo de Movimiento</label>
                <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                  <option value="">Selecciona...</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Categoría</label>
                <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
                  <option value="">Selecciona...</option>
                  <option value="insumos">Insumos</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="venta">Venta de Cosecha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <input
                type="text"
                placeholder="Ej: Compra de semillas"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Monto (S/.)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Fecha</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 transition"
              >
                Guardar Movimiento
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

      {/* Historial de Movimientos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Movimientos Recientes</h2>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Descripción</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Categoría</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-700">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay movimientos registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
