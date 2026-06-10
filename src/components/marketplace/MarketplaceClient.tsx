"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import type { CosechaDTO, BiohuertoPrevioDTO } from "@/types";
import type { listarTodosBiohuertos } from "@/lib/services/biohuertos";

const FarmMap = dynamic(() => import("./FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[340px] w-full items-center justify-center rounded-[1.7rem] bg-emerald-50">
      <span className="text-sm text-emerald-600">Cargando mapa…</span>
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketplaceProps {
  cosechas: CosechaDTO[];
  biohuertos: BiohuertoPrevioDTO[];
}

// Keep this import for BiohuertoPreviw inference (used by FarmMap sidebar)
// type _BiohuertoPreviw = Awaited<ReturnType<typeof listarTodosBiohuertos>>[number];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketplaceProps {
  cosechas: CosechaDTO[];
  biohuertos: BiohuertoPrevioDTO[];
}

// interface Props extends MarketplaceProps {}

// ─── Tone palette por índice ──────────────────────────────────────────────────
const TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const CATEGORIES = ["Todo", "Verduras", "Frutas", "Leguminosas", "Tubérculos", "Medicinales"];

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm8.44 14.94-3.7-3.7"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M12 12.5a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-6.5 8a6.5 6.5 0 0 1 13 0"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}
function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3ZM9 3v15M15 6v15"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarketplaceClient({ cosechas, biohuertos }: MarketplaceProps) {
  const [mapView, setMapView] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  function increment(id: string) {
    setQuantities((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  }
  function decrement(id: string) {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) }));
  }

  const cartTotal = Object.values(quantities).reduce((a, b) => a + b, 0);

  // Filtrar cosechas por búsqueda
  const cosechasFiltradas = cosechas.filter((c) => {
    const nombre = c.cultivo.plantaUsuario.plantaMaestra?.nombreComun ?? c.titulo;
    return nombre.toLowerCase().includes(search.toLowerCase()) || 
           c.titulo.toLowerCase().includes(search.toLowerCase());
  });

  // Mapear biohuertos a FarmPin (coordenadas dummy ya que ubicacionGeo es Unsupported)
  // Los pins reales vendrán de /api/biohuertos/cercanos con PostGIS
  const farmPins = biohuertos.map((b, i) => ({
    name: b.nombreHuerto,
    distance: "Ver mapa",
    // Coordenadas aproximadas de Chiclayo con dispersión por índice
    lat: -6.77 + i * 0.01,
    lng: -79.84 + i * 0.015,
    image:
      b.fotoPortadaUrl ??
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_30%),linear-gradient(180deg,#f7fbf4_0%,#eef7ea_40%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="sticky top-0 z-9999 rounded-[1.75rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur xl:px-6">
          <div className="flex items-center gap-3">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/25">
              🌿
            </div> */}
            <img
              src="/Logo_BioNed.svg"
              alt="BioNed"
              className="h-8 w-auto"
            />
            <div className="mx-2 hidden min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-inner md:flex">
              <SearchIcon />
              <input
                aria-label="Buscar productos frescos"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Buscar productos frescos…"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button aria-label="Carrito" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700" type="button">
                <CartIcon />
                {cartTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {cartTotal}
                  </span>
                )}
              </button>
              <a href="/login" aria-label="Acceso productores" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                <UserIcon />
              </a>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Mercado público · USAT Chiclayo
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Compra cosechas frescas directamente de biohuertos cercanos.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Descubre productores locales del programa RSU Cultivando Salud en Casa, compara disponibilidad y contacta directo al productor.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#productos" className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
                Explorar mercado
              </a>
              <a href="#cercanos" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                Ver biohuertos cercanos
              </a>
            </div>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50 p-4">
                <dt className="text-sm text-emerald-700">Biohuertos activos</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">{biohuertos.length}</dd>
              </div>
              <div className="rounded-3xl bg-sky-50 p-4">
                <dt className="text-sm text-sky-700">Cosechas disponibles</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">{cosechas.length}</dd>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4">
                <dt className="text-sm text-amber-700">Contacto directo</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">WhatsApp</dd>
              </div>
            </dl>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(180deg,rgba(10,31,18,0.14),rgba(10,31,18,0.58)),url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80)" }} />
            <div className="relative flex h-full min-h-[320px] flex-col justify-between p-6 text-white sm:min-h-[380px] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">Programa RSU</span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">Hoy</span>
              </div>
              <div className="max-w-sm">
                <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                  Biohuertos urbanos con cosechas frescas sin intermediarios.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  Programa de Responsabilidad Social Universitaria — USAT Chiclayo. Compra directa, trazabilidad completa.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[["Zona", "Chiclayo y Pimentel"], ["Pago", "Transferencia / efectivo"], ["Contacto", "WhatsApp directo"]].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* ── Biohuertos con mapa ── */}
        <section id="cercanos">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Biohuertos destacados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {biohuertos.length} productores activos en el programa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-0.5">
                <button onClick={() => setMapView(true)} aria-pressed={mapView}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${mapView ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:text-emerald-700"}`} type="button">
                  <MapIcon /> Mapa
                </button>
                <button onClick={() => setMapView(false)} aria-pressed={!mapView}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${!mapView ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:text-emerald-700"}`} type="button">
                  <GridIcon /> Lista
                </button>
              </div>
            </div>
          </div>

          {mapView ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 shadow-[0_16px_30px_rgba(15,23,42,0.06)]" style={{ height: 420 }}>
                <FarmMap farms={farmPins} className="h-full w-full" />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto lg:max-h-[420px]">
                {biohuertos.map((b) => (
                  <Link key={b.id} href={`/biohuerto/${b.id}`}
                    className="flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center bg-emerald-100"
                      style={{ backgroundImage: b.fotoPortadaUrl ? `url(${b.fotoPortadaUrl})` : undefined }} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-950">{b.nombreHuerto}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <LocationIcon />{b.direccionTexto}
                      </p>
                      <span className="mt-1.5 inline-block text-xs font-semibold text-emerald-700">
                        Ver cosechas →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {biohuertos.map((b) => (
                <Link key={b.id} href={`/biohuerto/${b.id}`}
                  className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_45px_rgba(15,23,42,0.11)]">
                  <div className="h-36 overflow-hidden bg-cover bg-center bg-emerald-100 transition duration-500 group-hover:scale-[1.03]"
                    style={{ backgroundImage: b.fotoPortadaUrl ? `url(${b.fotoPortadaUrl})` : undefined }} />
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <LocationIcon /> Chiclayo
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-950">{b.nombreHuerto}</h3>
                    <p className="mt-1 text-sm text-slate-500">{b.direccionTexto}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Ver cosechas →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Categorías ── */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === cat ? "bg-emerald-600 text-white shadow-md" : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"}`}
                type="button">
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── Cosechas del día ── */}
        <section id="productos">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Cosechas frescas del día</h2>
              <p className="mt-1 text-sm text-slate-500">
                {cosechasFiltradas.length} productos disponibles para compra directa
              </p>
            </div>
          </div>

          {cosechasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-200 bg-slate-50 py-16">
              <p className="text-2xl">🌱</p>
              <p className="mt-2 text-sm text-slate-500">No hay cosechas disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cosechasFiltradas.map((product, i) => {
                const qty = quantities[product.id] ?? 0;
                const nombrePlanta =
                  product.cultivo.plantaUsuario.plantaMaestra?.nombreComun ?? product.titulo;
                const huerto = product.cultivo.parcela.biohuerto.nombreHuerto;
                const telefono = product.cultivo.parcela.biohuerto.dueno.telefono;
                const tone = TONES[i % TONES.length];
                const waUrl = telefono
                  ? buildWhatsAppUrl(telefono, `Hola! Quiero comprar "${product.titulo}" de ${huerto}. ¿Está disponible?`)
                  : null;

                return (
                  <article key={product.id} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.11)]">
                    <div className="relative h-36 bg-cover bg-center bg-emerald-50"
                      style={{ backgroundImage: product.imagenUrl ? `url(${product.imagenUrl})` : undefined }}>
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
                        Fresco
                      </span>
                    </div>
                    <div className="p-4 pb-3">
                      <h3 className="text-base font-semibold text-slate-950">{nombrePlanta}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {huerto} · {product.cantidadDisponible} kg disponibles
                      </p>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Precio / kg</p>
                          <p className="text-lg font-semibold text-emerald-700">
                            {formatCurrency(product.precioPorKg)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1.5">
                              <button aria-label={`Quitar ${nombrePlanta}`} onClick={() => decrement(product.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100" type="button">
                                <MinusIcon />
                              </button>
                              <span className="min-w-4 text-center text-sm font-semibold text-emerald-700">{qty}</span>
                              <button aria-label={`Agregar ${nombrePlanta}`} onClick={() => increment(product.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100" type="button">
                                <PlusIcon />
                              </button>
                            </div>
                          ) : (
                            <button aria-label={`Agregar ${nombrePlanta}`} onClick={() => increment(product.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white" type="button">
                              <PlusIcon />
                            </button>
                          )}

                          {waUrl && (
                            <a href={waUrl} target="_blank" rel="noopener noreferrer"
                              aria-label={`Contactar productor de ${nombrePlanta} por WhatsApp`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-green-400/30 transition hover:bg-[#1ebe5d]">
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
        </section>

        <footer className="mt-4 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">© 2026 BioNed · Programa RSU Cultivando Salud en Casa · USAT</p>
        </footer>
      </div>
    </main>
  );
}
