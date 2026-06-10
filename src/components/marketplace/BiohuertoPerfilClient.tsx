"use client";

import Link from "next/link";
import { useState } from "react";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import type { BiohuertoPerfilDTO } from "@/types";

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

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 0 0 5 21c8-3 11-8 11-8s-1 4-6 6c6-1 9-5 9-10a6 6 0 0 0-2-9Z"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h14" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

// ─── Tone palette ─────────────────────────────────────────────────────────────
const TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  perfil: BiohuertoPerfilDTO;
}

export default function BiohuertoPerfilClient({ perfil }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  function increment(id: string) {
    setQuantities((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }
  function decrement(id: string) {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) }));
  }

  const waBase = perfil.dueno.telefono
    ? buildWhatsAppUrl(
        perfil.dueno.telefono,
        `Hola! Vi tu biohuerto "${perfil.nombreHuerto}" en BioNed y me gustaría hacer un pedido.`
      )
    : null;

  const añoFundacion = new Date(perfil.fechaCreacion).getFullYear();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf4_0%,#ffffff_100%)] text-slate-900">

      {/* ── Hero con portada ── */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        {perfil.fotoPortadaUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(10,31,18,0.1) 0%,rgba(10,31,18,0.65) 100%),url(${perfil.fotoPortadaUrl})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900" />
        )}

        {/* Botón volver */}
        <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <ArrowLeftIcon />
            Volver al mercado
          </Link>
        </div>

        {/* Nombre del biohuerto sobre la foto */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="mx-auto max-w-5xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200 backdrop-blur">
              <LeafIcon />
              Biohuerto certificado
            </span>
            <h1 className="mt-2 text-3xl font-bold text-white drop-shadow-sm sm:text-4xl">
              {perfil.nombreHuerto}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
              <LocationIcon />
              {perfil.direccionTexto}
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* ── Card de productor + stats ── */}
        <div className="-mt-8 mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">

          {/* Productor */}
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
            {/* Avatar */}
            <div className="relative shrink-0">
              {perfil.dueno.fotoPerfilUrl ? (
                <img
                  src={perfil.dueno.fotoPerfilUrl}
                  alt={perfil.dueno.nombreCompleto}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white ring-2 ring-emerald-100">
                  {perfil.dueno.nombreCompleto.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white">
                  <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Productor
              </p>
              <p className="mt-0.5 truncate text-base font-semibold text-slate-900">
                {perfil.dueno.nombreCompleto}
              </p>
              {perfil.descripcion && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {perfil.descripcion}
                </p>
              )}
            </div>

            {/* CTA WhatsApp */}
            {waBase && (
              <a
                href={waBase}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-400/30 transition hover:bg-[#1ebe5d] sm:flex"
              >
                <WhatsAppIcon />
                Contactar
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:grid-cols-1 sm:gap-4">
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-emerald-700">{perfil.areaMetrosCuadrados}<span className="text-sm font-normal text-slate-400"> m²</span></p>
              <p className="text-xs text-slate-500">Área total</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-emerald-700">{perfil.totalCultivos}</p>
              <p className="text-xs text-slate-500">Cultivos activos</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-emerald-700">{añoFundacion}</p>
              <p className="text-xs text-slate-500">Desde</p>
            </div>
          </div>
        </div>

        {/* ── WhatsApp móvil ── */}
        {waBase && (
          <a
            href={waBase}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-400/20 transition hover:bg-[#1ebe5d] sm:hidden"
          >
            <WhatsAppIcon />
            Contactar por WhatsApp
          </a>
        )}

        {/* ── Cosechas disponibles ── */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                Cosechas disponibles
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {perfil.cosechas.length > 0
                  ? `${perfil.cosechas.length} producto${perfil.cosechas.length > 1 ? "s" : ""} listo${perfil.cosechas.length > 1 ? "s" : ""} para compra directa`
                  : "Sin publicaciones activas en este momento"}
              </p>
            </div>
          </div>

          {perfil.cosechas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-200 bg-slate-50 py-20">
              <span className="text-4xl">🌱</span>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Este productor no tiene cosechas publicadas aún.
              </p>
              {waBase && (
                <a
                  href={waBase}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <WhatsAppIcon />
                  Consultar disponibilidad
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {perfil.cosechas.map((cosecha, i) => {
                const qty = quantities[cosecha.id] ?? 0;
                const tone = TONES[i % TONES.length];
                const waUrl = perfil.dueno.telefono
                  ? buildWhatsAppUrl(
                      perfil.dueno.telefono,
                      `Hola! Me interesa "${cosecha.titulo}" de ${perfil.nombreHuerto}. ¿Está disponible?`
                    )
                  : null;

                return (
                  <article
                    key={cosecha.id}
                    className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.10)]"
                  >
                    {/* Imagen */}
                    <div
                      className="relative h-40 bg-cover bg-center bg-emerald-50"
                      style={{ backgroundImage: cosecha.imagenUrl ? `url(${cosecha.imagenUrl})` : undefined }}
                    >
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                        {cosecha.etapaActual}
                      </span>
                      {!cosecha.imagenUrl && (
                        <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-30">🌿</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs font-medium text-emerald-700">{cosecha.nombrePlanta}</p>
                      <h3 className="mt-0.5 text-base font-semibold text-slate-950 leading-snug">
                        {cosecha.titulo}
                      </h3>
                      {cosecha.descripcion && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {cosecha.descripcion}
                        </p>
                      )}

                      <div className="mt-4 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Precio / kg</p>
                          <p className="text-lg font-bold text-emerald-700">
                            {formatCurrency(cosecha.precioPorKg)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {cosecha.cantidadDisponible} kg disponibles
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1.5">
                              <button
                                onClick={() => decrement(cosecha.id)}
                                aria-label="Quitar"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm hover:bg-emerald-100"
                                type="button"
                              >
                                <MinusIcon />
                              </button>
                              <span className="min-w-[1rem] text-center text-sm font-semibold text-emerald-700">
                                {qty}
                              </span>
                              <button
                                onClick={() => increment(cosecha.id)}
                                aria-label="Agregar"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm hover:bg-emerald-100"
                                type="button"
                              >
                                <PlusIcon />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => increment(cosecha.id)}
                              aria-label={`Agregar ${cosecha.titulo}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                              type="button"
                            >
                              <PlusIcon />
                            </button>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Pedir por WhatsApp"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-green-400/30 transition hover:bg-[#1ebe5d]"
                            >
                              <WhatsAppIcon />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Parcelas info ── */}
        <div className="mt-10 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Sobre este biohuerto
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                🌱
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{perfil.totalParcelas} parcela{perfil.totalParcelas !== 1 ? "s" : ""}</p>
                <p className="text-xs text-slate-500">Espacios de cultivo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                📍
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">{perfil.direccionTexto}</p>
                <p className="text-xs text-slate-500">Ubicación</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                🤝
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Compra directa</p>
                <p className="text-xs text-slate-500">Sin intermediarios</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
