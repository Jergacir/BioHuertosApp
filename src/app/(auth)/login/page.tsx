import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(58,149,96,0.18),_transparent_35%),_linear-gradient(180deg,_#ebf9ed_0%,_#f8fcf7_100%)]">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl overflow-hidden rounded-[36px] border border-emerald-100 bg-white/95 shadow-[0_30px_80px_rgba(14,68,38,0.12)] backdrop-blur-xl">
          <div className="bg-emerald-50 px-8 py-8 sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm shadow-emerald-200/50">
              <span className="text-emerald-600">🌿</span>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">AgroSystem</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Iniciar Sesión</h1>
              <p className="mt-2 text-sm text-slate-500">Accede a tu huerto y controla tus cultivos</p>
            </div>
          </div>

          <div className="px-8 pb-10 pt-6 sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
