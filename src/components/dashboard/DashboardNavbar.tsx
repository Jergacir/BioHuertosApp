"use client";

import Link from "next/link";
import type { SessionUser } from "@/types";

interface Props {
  usuario: SessionUser | null;
}

export default function DashboardNavbar({ usuario }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-slate-100 bg-white px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Campana */}
        <Link
          href="/dashboard/alertas"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
            <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1 5 1 5H3s1-1.5 1-5a6 6 0 0 1 6-6Z" />
            <path d="M8.5 17.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Nombre + Avatar */}
        <div className="flex items-center gap-2">
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-600/20">
            {usuario?.nombreCompleto?.charAt(0) ?? "U"}
          </div>
          {usuario?.nombreCompleto && (
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              {usuario.nombreCompleto.split(" ")[0]}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
