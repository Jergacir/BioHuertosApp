import type { ReactNode } from "react";

// TODO: proteger con middleware — redirige a /login si no hay sesión activa
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar irá aquí: src/components/dashboard/sidebar.tsx */}
      <aside className="hidden w-60 border-r border-slate-100 bg-white md:block" />
      <div className="flex flex-1 flex-col">
        {/* Navbar irá aquí: src/components/dashboard/navbar.tsx */}
        <header className="h-14 border-b border-slate-100 bg-white" />
        <main className="flex-1 bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}
