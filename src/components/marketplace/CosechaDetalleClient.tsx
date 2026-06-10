"use client";

import Link from "next/link";
import { useState } from "react";
import { buildWhatsAppUrl, formatCurrency, formatDate } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { CosechaDetalleDTO } from "@/types";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M19 12H5M12 5l-7 7 7 7" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M3.5 4.5h2l1.8 9.1a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6l1.3-6.4H7"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M5 12h14" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  cosecha: CosechaDetalleDTO;
}

export default function CosechaDetalleClient({ cosecha }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem, totalItems } = useCart();

  const { cultivo } = cosecha;
  const pm = cultivo.plantaUsuario.plantaMaestra;
  const biohuerto = cultivo.parcela.biohuerto;
  const nombrePlanta = pm?.nombreComun ?? cultivo.plantaUsuario.nombrePersonalizado ?? cosecha.titulo;
  const familia = pm?.familiaBotanica ?? "—";
  const cientifico = pm?.nombreCientifico;

  const waUrl = biohuerto.dueno.telefono
    ? buildWhatsAppUrl(
        biohuerto.dueno.telefono,
        `Hola ${biohuerto.dueno.nombreCompleto}! Vi "${cosecha.titulo}" en BioNed y quisiera ${qty} kg. ¿Está disponible?`
      )
    : null;

  const etapaBadge: Record<string, string> = {
    Cosecha: "bg-emerald-100 text-emerald-700",
    Crecimiento: "bg-sky-100 text-sky-700",
    Siembra: "bg-amber-100 text-amber-700",
    Finalizado: "bg-slate-100 text-slate-500",
  };
  const etapaCls = etapaBadge[cultivo.etapaActual] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf4_0%,#ffffff_60%)] text-slate-900">

              {/* Sticky nav ── */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
            <ArrowLeftIcon />
            Volver al mercado
          </Link>
          <Link href={`/biohuerto/${biohuerto.id}`}
            className="text-sm text-slate-500 transition hover:text-emerald-700">
            {biohuerto.nombreHuerto} →
          </Link>
          <div className="ml-auto">
            <Link href="/carrito"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Layout principal 2 columnas ── */}
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">

          {/* ── Imagen ── */}
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-emerald-50 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            {cosecha.imagenUrl ? (
              <img
                src={cosecha.imagenUrl}
                alt={cosecha.titulo}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-6xl opacity-20">
                🌿
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-5">

            {/* Familia + etapa */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                🌿 {nombrePlanta} — Familia {familia}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${etapaCls}`}>
                {cultivo.etapaActual}
              </span>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {cosecha.titulo}
              </h1>
              {cientifico && (
                <p className="mt-1 text-sm italic text-slate-400">{cientifico}</p>
              )}
            </div>

            {/* Biohuerto origen */}
            <Link href={`/biohuerto/${biohuerto.id}`}
              className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-800">
              <LocationIcon />
              Sembramos en: {biohuerto.nombreHuerto}
            </Link>

            {/* Precio + disponibilidad */}
            <div className="flex items-end gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Precio por kilogramo
                </p>
                <p className="mt-1 text-5xl font-bold text-emerald-700">
                  {formatCurrency(cosecha.precioPorKg)}
                </p>
              </div>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {cosecha.cantidadDisponible} kg disponibles
              </span>
            </div>

            {/* Frescura */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="text-lg">🌱</span>
              <p className="text-sm italic text-slate-600">
                Recién cosechado — Máxima frescura y sabor garantizados.
              </p>
            </div>

            {/* Descripción */}
            {cosecha.descripcion && (
              <div>
                <h2 className="text-base font-semibold text-slate-900">Detalles del Producto</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {cosecha.descripcion}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Selector cantidad + CTA */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Contador */}
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                  type="button"
                >
                  <MinusIcon />
                </button>
                <span className="min-w-[2rem] text-center text-base font-semibold text-slate-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(q + 1, Math.floor(cosecha.cantidadDisponible)))}
                  aria-label="Aumentar cantidad"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                  type="button"
                >
                  <PlusIcon />
                </button>
              </div>

              {/* Añadir al carrito */}
              <button
                type="button"
                onClick={() => {
                  addItem({
                    id: cosecha.id,
                    titulo: cosecha.titulo,
                    nombrePlanta,
                    biohuerto: biohuerto.nombreHuerto,
                    telefono: biohuerto.dueno.telefono,
                    precioPorKg: cosecha.precioPorKg,
                    imagenUrl: cosecha.imagenUrl,
                  }, qty);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 active:scale-[0.98]"
              >
                <CartIcon />
                Añadir al Carrito
              </button>

              {/* WhatsApp */}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Pedir por WhatsApp"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-400/30 transition hover:bg-[#1ebe5d]">
                  <WhatsAppIcon />
                </a>
              )}
            </div>

            {/* Total estimado */}
            <p className="text-sm text-slate-400">
              Total estimado:{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(cosecha.precioPorKg * qty)}
              </span>{" "}
              por {qty} kg
            </p>
          </div>
        </div>

        {/* ── Detalles técnicos ── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Parcela", value: cultivo.parcela.nombreIdentificador, icon: "🌱" },
            { label: "Tipo de suelo", value: cultivo.parcela.tipoSuelo ?? "No especificado", icon: "🪴" },
            { label: "Método de siembra", value: cultivo.metodoSiembra ?? "No especificado", icon: "🌾" },
            { label: "Fecha de siembra", value: formatDate(cultivo.fechaSiembra), icon: "📅" },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              <p className="text-xl">{icon}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Card del productor ── */}
        <div className="mt-8 flex items-center gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          {biohuerto.dueno.fotoPerfilUrl ? (
            <img src={biohuerto.dueno.fotoPerfilUrl} alt={biohuerto.dueno.nombreCompleto}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-emerald-100" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white ring-2 ring-emerald-100">
              {biohuerto.dueno.nombreCompleto.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productor</p>
            <p className="mt-0.5 truncate text-base font-semibold text-slate-900">
              {biohuerto.dueno.nombreCompleto}
            </p>
            <Link href={`/biohuerto/${biohuerto.id}`}
              className="text-xs font-medium text-emerald-700 hover:underline">
              Ver biohuerto →
            </Link>
          </div>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1ebe5d]">
              <WhatsAppIcon />
              Contactar
            </a>
          )}
        </div>

      </main>
    </div>
  );
}
