"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { FarmPin } from "@/components/marketplace/FarmMap";

// Leaflet must be loaded client-side only
const FarmMap = dynamic(() => import("@/components/marketplace/FarmMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[340px] w-full items-center justify-center rounded-[1.7rem] bg-emerald-50">
      <span className="text-sm text-emerald-600">Cargando mapa…</span>
    </div>
  ),
});

// ─── Data ──────────────────────────────────────────────────────────────────────

const nearbyFarms: FarmPin[] = [
  {
    name: "Biohuerto La Esperanza",
    distance: "1.2 km",
    lat: -12.038,
    lng: -77.053,
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rancho Verde",
    distance: "3.3 km",
    lat: -12.061,
    lng: -77.037,
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Suelo Fértil",
    distance: "4.6 km",
    lat: -12.075,
    lng: -77.062,
    image:
      "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Huerto Urbano Central",
    distance: "6.2 km",
    lat: -12.025,
    lng: -77.02,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
  },
];

const freshHarvests = [
  {
    name: "Tomate Cherry",
    farm: "La Esperanza · 1.1 kg",
    price: "S/. 4.50",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80",
    tone: "bg-rose-50 text-rose-700",
    badge: "bg-rose-100 text-rose-700",
    quantity: 1,
  },
  {
    name: "Lechuga Hidropónica",
    farm: "Rancho Verde · 1 pz",
    price: "S/. 2.50",
    image:
      "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4b9?auto=format&fit=crop&w=900&q=80",
    tone: "bg-emerald-50 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    quantity: null,
  },
  {
    name: "Zanahoria Arcoíris",
    farm: "Suelo Fértil · 1 kg",
    price: "S/. 3.20",
    image:
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=900&q=80",
    tone: "bg-sky-50 text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    quantity: null,
  },
  {
    name: "Pimientos Mixtos",
    farm: "Huerto Urbano · 1 kg",
    price: "S/. 6.00",
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=900&q=80",
    tone: "bg-amber-50 text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    quantity: null,
  },
];

const categories = [
  "Todo",
  "Verduras",
  "Frutas",
  "Leguminosas",
  "Tubérculos",
  "Medicinales",
];

// ─── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm8.44 14.94-3.7-3.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3.5 4.5h2l1.8 9.1a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6l1.3-6.4H7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 12.5a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-6.5 8a6.5 6.5 0 0 1 13 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 3v15M15 6v15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [mapView, setMapView] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      freshHarvests.map((p) => [p.name, p.quantity ?? 0])
    )
  );

  function increment(name: string) {
    setQuantities((q) => ({ ...q, [name]: (q[name] ?? 0) + 1 }));
  }
  function decrement(name: string) {
    setQuantities((q) => ({ ...q, [name]: Math.max(0, (q[name] ?? 0) - 1) }));
  }

  const cartTotal = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_30%),linear-gradient(180deg,_#f7fbf4_0%,_#eef7ea_40%,_#ffffff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 rounded-[1.75rem] border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur xl:px-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/25">
              🌿
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-slate-900">
                BioNed
              </p>
              <p className="text-xs text-slate-500">
                Mercado público de biohuertos
              </p>
            </div>

            {/* Search */}
            <div className="mx-2 hidden min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-inner shadow-white/60 md:flex">
              <SearchIcon />
              <input
                aria-label="Buscar productos frescos"
                className="ml-2 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Buscar productos frescos…"
                type="search"
              />
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label="Carrito de compras"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                type="button"
              >
                <CartIcon />
                {cartTotal > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {cartTotal}
                  </span>
                )}
              </button>
              <button
                aria-label="Perfil de usuario"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                type="button"
              >
                <UserIcon />
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Mercado público
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Compra cosechas frescas directamente de biohuertos cercanos.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base lg:text-lg">
              Descubre productores locales, compara disponibilidad en tiempo
              real y arma tu pedido con una experiencia clara, rápida y
              confiable.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                href="#productos"
              >
                Explorar mercado
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                href="#cercanos"
              >
                Ver biohuertos cercanos
              </a>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-emerald-50 p-4">
                <dt className="text-sm text-emerald-700">Productores activos</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">128</dd>
              </div>
              <div className="rounded-3xl bg-sky-50 p-4">
                <dt className="text-sm text-sky-700">Pedidos entregados</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">2.4k</dd>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4">
                <dt className="text-sm text-amber-700">Tiempo promedio</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-950">35 min</dd>
              </div>
            </dl>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(10,31,18,0.14), rgba(10,31,18,0.58)), url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80)",
              }}
            />
            <div className="relative flex h-full min-h-[320px] flex-col justify-between p-6 text-white sm:min-h-[380px] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
                  Producto destacado
                </span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                  Nuevo hoy
                </span>
              </div>

              <div className="max-w-sm">
                <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
                  Biohuertos con entrega fresca en menos de una hora.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/90 sm:text-base">
                  Publica tu cosecha, gestiona inventario y activa la compra
                  pública con una interfaz pensada para conversión.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Entrega", "08:00 - 18:00"],
                  ["Cobertura", "Zona urbana + periferia"],
                  ["Pago", "Transferencia / billeteras"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* ── Biohuertos cercanos: mapa + grid ── */}
        <section id="cercanos">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                Biohuertos destacados por cercanía
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecciona productores locales con trazabilidad simple y compra
                directa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle map / grid */}
              <div className="flex overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-0.5">
                <button
                  onClick={() => setMapView(true)}
                  aria-pressed={mapView}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    mapView
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-600 hover:text-emerald-700"
                  }`}
                  type="button"
                >
                  <MapIcon />
                  Mapa
                </button>
                <button
                  onClick={() => setMapView(false)}
                  aria-pressed={!mapView}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                    !mapView
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-600 hover:text-emerald-700"
                  }`}
                  type="button"
                >
                  <GridIcon />
                  Lista
                </button>
              </div>

              <a
                className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                href="#productos"
              >
                Ver todo →
              </a>
            </div>
          </div>

          {mapView ? (
            /* ── MAP VIEW ── */
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              {/* Map */}
              <div className="overflow-hidden rounded-[1.7rem] border border-slate-200 shadow-[0_16px_30px_rgba(15,23,42,0.06)]" style={{ height: 420 }}>
                <FarmMap farms={nearbyFarms} className="h-full w-full" />
              </div>

              {/* Sidebar list */}
              <div className="flex flex-col gap-3 overflow-y-auto lg:max-h-[420px]">
                {nearbyFarms.map((farm) => (
                  <article
                    key={farm.name}
                    className="flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.09)]"
                  >
                    <div
                      className="h-16 w-16 flex-shrink-0 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${farm.image})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {farm.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <LocationIcon />
                        {farm.distance}
                      </p>
                      <a
                        href="#productos"
                        className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Ver cosechas →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            /* ── GRID VIEW ── */
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {nearbyFarms.map((farm) => (
                <article
                  key={farm.name}
                  className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.11)]"
                >
                  <div
                    className="h-36 overflow-hidden bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url(${farm.image})` }}
                  />
                  <div className="p-4">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <LocationIcon />
                      Cercanía
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-950">
                      {farm.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{farm.distance}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Categories ── */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* ── Fresh Harvests ── */}
        <section id="productos">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                Cosechas frescas del día
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Productos destacados listos para venta rápida y compra al por
                menor.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {freshHarvests.map((product) => {
              const qty = quantities[product.name] ?? 0;
              return (
                <article
                  key={product.name}
                  className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(15,23,42,0.11)]"
                >
                  <div
                    className="relative h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.image})` }}
                  >
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${product.badge}`}
                    >
                      Fresco
                    </span>
                  </div>
                  <div className="p-4 pb-3">
                    <h3 className="text-base font-semibold text-slate-950">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{product.farm}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          Precio
                        </p>
                        <p className="text-lg font-semibold text-emerald-700">
                          {product.price}
                        </p>
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-emerald-700">
                          <button
                            aria-label={`Disminuir ${product.name}`}
                            onClick={() => decrement(product.name)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                            type="button"
                          >
                            <MinusIcon />
                          </button>
                          <span className="min-w-4 text-center text-sm font-semibold leading-none">
                            {qty}
                          </span>
                          <button
                            aria-label={`Aumentar ${product.name}`}
                            onClick={() => increment(product.name)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                            type="button"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      ) : (
                        <button
                          aria-label={`Agregar ${product.name}`}
                          onClick={() => increment(product.name)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                          type="button"
                        >
                          <PlusIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-4 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            © 2026 BioNed · Mercado público de biohuertos urbanos
          </p>
        </footer>
      </div>
    </main>
  );
}
