"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import Image from "next/image";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10Zm9-5v5.382l3.553 1.776-.894 1.789L9 12V5h2Z" />
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/biohuertos",
    label: "Biohuertos",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M10 3C6 3 3 6 3 10c0 3.5 2.5 6 7 8 4.5-2 7-4.5 7-8 0-4-3-7-7-7Z" />
        <path d="M10 3v15" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/cultivos",
    label: "Cultivos",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M10 17V8" strokeLinecap="round" />
        <path d="M10 12c-2-2-5-2-6-1M10 9c2-3 5-3 6-1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/fitosanitario",
    label: "Diagnóstico",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <circle cx="10" cy="10" r="7" />
        <path d="M7 10h2l1.5-3 2 6 1.5-3H16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/finanzas",
    label: "Finanzas",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <rect x="2" y="5" width="16" height="12" rx="2" />
        <path d="M6 5V3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V5" strokeLinecap="round" />
        <circle cx="10" cy="11" r="2" />
      </svg>
    ),
  },
  {
    href: "/dashboard/alertas",
    label: "Alertas",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1 5 1 5H3s1-1.5 1-5a6 6 0 0 1 6-6Z" />
        <path d="M8.5 17.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/parcelas",
    label: "Parcelas",
    iconSimple: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <rect x="2" y="2" width="16" height="16" rx="2" />
        <path d="M2 10h16M10 2v16" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-slate-100 bg-white">
      {/* Logo — ícono solo + texto SVG al lado */}
      <div className="flex h-16 justify-center items-center gap-2 border-b border-slate-100 px-5">
        {/* <Image
          src="/Logo_BioNed.svg"
          alt="BioNed logo"
          width={30}
          height={30}
          className="shrink-0"
        /> */}
        <Image
          src="/LogoTexto_BioNed.svg"
          alt="BioNed"
          width={145}
          height={26}
          className="shrink-0"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {item.iconSimple}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
              <path d="M13 15l3-5-3-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 10H7" strokeLinecap="round" />
              <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" strokeLinecap="round" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
