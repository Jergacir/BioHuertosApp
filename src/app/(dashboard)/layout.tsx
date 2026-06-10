import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { obtenerUsuarioPorId } from "@/lib/services/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("bioned_session");

  if (!session) redirect("/login");

  const usuario = await obtenerUsuarioPorId(session.value);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Sidebar />
      <div className="ml-60 flex flex-1 flex-col">
        <DashboardNavbar usuario={usuario} />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
