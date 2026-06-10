"use client";

import { useState } from "react";
import { crearBiohuertAction } from "@/actions/biohuertos";

export default function BiohuertosPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nombreHuerto: "",
    descripcion: "",
    direccionTexto: "",
    latitud: "-6.7349",
    longitud: "-79.8397",
    area: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await crearBiohuertAction({
        nombreHuerto: formData.nombreHuerto,
        descripcion: formData.descripcion,
        direccionTexto: formData.direccionTexto,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        area: parseFloat(formData.area),
      });

      if ("error" in result && result.error) {
        setMessage({ type: "error", text: result.error });
      } else if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.message || "Biohuerto creado exitosamente" });
        setFormData({
          nombreHuerto: "",
          descripcion: "",
          direccionTexto: "",
          latitud: "-6.7349",
          longitud: "-79.8397",
          area: "",
        });
        setTimeout(() => {
          setShowForm(false);
          // TODO: Recargar la lista de biohuertos
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error inesperado. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Biohuertos</h1>
          <p className="mt-1 text-slate-600">Gestiona los espacios donde cultivas tus plantas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition"
        >
          ➕ Nuevo Biohuerto
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">Crear Nuevo Biohuerto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre del Biohuerto</label>
                <input
                  type="text"
                  name="nombreHuerto"
                  value={formData.nombreHuerto}
                  onChange={handleInputChange}
                  placeholder="Ej: Huerto Las Brisas"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Área (m²)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Ej: 50"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Dirección</label>
              <input
                type="text"
                name="direccionTexto"
                value={formData.direccionTexto}
                onChange={handleInputChange}
                placeholder="Ej: Av. Principal 123, Chiclayo"
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe tu biohuerto..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Latitud</label>
                <input
                  type="number"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleInputChange}
                  step="0.0001"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Longitud</label>
                <input
                  type="number"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleInputChange}
                  step="0.0001"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear Biohuerto"}
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

      {/* Lista de Biohuertos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder: Biohuertos vacíos */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center">
          <span className="text-4xl">🌿</span>
          <p className="mt-2 text-slate-600">No tienes biohuertos aún</p>
          <p className="text-sm text-slate-500">Crea uno para empezar a cultivar</p>
        </div>
      </div>

      {/* TODO: Mostrar biohuertos en tarjetas con opciones para editar, ver parcelas, etc. */}
    </div>
  );
}

