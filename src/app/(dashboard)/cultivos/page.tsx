"use client";

import { useState } from "react";
import Link from "next/link";

export default function CultivosPage() {
  const [activeTab, setActiveTab] = useState("activos");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Cultivos</h1>
          <p className="mt-1 text-slate-600">Monitorea el ciclo de vida de tus plantas</p>
        </div>
        <Link
          href="/dashboard/cultivos"
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          ➕ Nuevo Cultivo
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("activos")}
          className={`px-4 py-3 font-medium transition ${
            activeTab === "activos"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🌱 Activos
        </button>
        <button
          onClick={() => setActiveTab("listos")}
          className={`px-4 py-3 font-medium transition ${
            activeTab === "listos"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🌾 Listos para Cosechar
        </button>
        <button
          onClick={() => setActiveTab("finalizados")}
          className={`px-4 py-3 font-medium transition ${
            activeTab === "finalizados"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ✅ Finalizados
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "activos" && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <span className="text-5xl">🌱</span>
          <p className="mt-4 text-lg font-medium text-slate-900">No hay cultivos activos</p>
          <p className="mt-1 text-slate-600">Crea tu primer cultivo para empezar a monitorear</p>
        </div>
      )}

      {activeTab === "listos" && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <span className="text-5xl">🌾</span>
          <p className="mt-4 text-lg font-medium text-slate-900">No hay cultivos listos</p>
          <p className="mt-1 text-slate-600">Cuando tus cultivos estén maduros aparecerán aquí</p>
        </div>
      )}

      {activeTab === "finalizados" && (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
          <span className="text-5xl">✅</span>
          <p className="mt-4 text-lg font-medium text-slate-900">No hay cultivos finalizados</p>
          <p className="mt-1 text-slate-600">Completa tu primer ciclo para verlo aquí</p>
        </div>
      )}
    </div>
  );
}
