"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { LoginFormData } from "@/types";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body: LoginFormData = { email, password };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Credenciales inválidas.");
        setLoading(false);
        return;
      }

      const setRes = await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: json.data.id }),
      });

      if (!setRes.ok) {
        const setJson = await setRes.json();
        setError(setJson.error ?? "Error al crear sesión.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="ejemplo@agro.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span />
        <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700">¿Olvidaste tu contraseña?</a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(37,99,58,0.22)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Ingresando..." : "Entrar a mi Huerto"}
      </button>

      {/* Removed social sign-in buttons (Google) per request - only classic login remains */}
    </form>
  );
}
