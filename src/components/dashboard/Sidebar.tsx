"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/biohuertos", label: "Biohuertos", icon: "🌿" },
  { href: "/dashboard/cultivos", label: "Cultivos", icon: "🌱" },
  { href: "/dashboard/fitosanitario", label: "Diagnóstico", icon: "🔬" },
  { href: "/dashboard/catalogo", label: "Catálogo", icon: "📚" },
  { href: "/dashboard/finanzas", label: "Finanzas", icon: "💰" },
  { href: "/dashboard/alertas", label: "Alertas", icon: "🔔" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-emerald-50 to-white border-r border-emerald-200 shadow-lg pt-6">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-emerald-700">🌾 AgroSystem</h1>
      </div>

      <nav className="space-y-2 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-700 hover:bg-emerald-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 border-t border-emerald-200 pt-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
