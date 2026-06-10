"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M19 12H5M12 5l-7 7 7 7" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path d="M3.5 4.5h2l1.8 9.1a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6l1.3-6.4H7"
        fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CarritoClient() {
  const { items, subtotal, updateCantidad, removeItem, buildWhatsAppMessage } = useCart();

  const waUrl = buildWhatsAppMessage();
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbf4_0%,#ffffff_60%)] text-slate-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
            <ArrowLeftIcon />
            Mi Carrito
          </Link>
          <CartIcon />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">

          {/* ── Columna izquierda: productos ── */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Productos seleccionados</h2>

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                <span className="text-4xl">🛒</span>
                <p className="mt-3 text-sm font-medium text-slate-500">Tu carrito está vacío</p>
                <Link href="/"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700">
                  Explorar cosechas
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">

                    {/* Imagen */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-emerald-50 bg-cover bg-center"
                      style={{ backgroundImage: item.imagenUrl ? `url(${item.imagenUrl})` : undefined }}>
                      {!item.imagenUrl && (
                        <div className="flex h-full w-full items-center justify-center text-2xl opacity-30">🌿</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.titulo}</p>
                      <p className="text-xs text-slate-500">{item.biohuerto}</p>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {formatCurrency(item.precioPorKg * item.cantidad)}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Contador */}
                      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
                        <button
                          onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                          aria-label="Disminuir"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
                          type="button"
                        >
                          <MinusIcon />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold text-slate-900">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                          aria-label="Aumentar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:shadow-sm"
                          type="button"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Eliminar ${item.titulo}`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                        type="button"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Conexión directa info */}
            {!isEmpty && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <span className="mt-0.5 text-lg">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Conexión Directa</p>
                  <p className="mt-0.5 text-sm text-emerald-700">
                    Al confirmar, abrirás un chat de WhatsApp con el productor para coordinar la entrega y el pago (Efectivo, Yape o Plin).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Columna derecha: resumen ── */}
          {!isEmpty && (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.07)] lg:sticky lg:top-24">
              <h3 className="text-base font-semibold text-slate-900">Resumen del Pedido</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Envío</span>
                  <span className="font-medium italic text-emerald-600">Por coordinar</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Total estimado</span>
                  <span className="text-2xl font-bold text-emerald-700">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-400/25 transition hover:bg-[#1ebe5d] active:scale-[0.98]"
                >
                  <WhatsAppIcon />
                  Confirmar y Pedir por WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-full bg-slate-200 py-3.5 text-sm font-semibold text-slate-400"
                  type="button"
                >
                  Sin teléfono de productor
                </button>
              )}

              <p className="mt-3 text-center text-xs text-slate-400">
                Apoya a los productores locales directamente.
              </p>
            </div>
          )}
        </div>

        {/* Conexión directa en mobile (debajo del resumen) ya está arriba */}
      </main>
    </div>
  );
}
