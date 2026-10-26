'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  UserX,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      // Notificar cambio de autenticación y redirigir al inicio tras login exitoso
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/';
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (emailPreset: string, passwordPreset: string) => {
    setEmail(emailPreset);
    setPassword(passwordPreset);
    handleSubmit(undefined, emailPreset, passwordPreset);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Class-Edtech Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-extrabold text-[#071D3F] tracking-tight">Class-</span>
            <span className="text-3xl font-extrabold text-[#EB0202] tracking-tight">Edtech</span>
          </div>
          <span className="text-xs tracking-[0.25em] font-extrabold text-[#071D3F] block uppercase mt-0.5">
            LEARNING
          </span>
          <p className="text-xs text-slate-500 mt-2">
            Plataforma EdTech de Aprendizaje con Tutor de Voz
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-[#EB0202] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#EB0202] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario Tradicional */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#071D3F] mb-1">
              Correo Electrónico del Alumno
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno.autorizado@classedtech.com.co"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EB0202]/20 focus:border-[#071D3F] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#071D3F] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EB0202]/20 focus:border-[#071D3F] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#071D3F] hover:bg-[#071D3F]/90 text-white font-medium text-sm rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Cuentas de Prueba Preconfiguradas para Evaluación Rápida */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#071D3F] mb-3">
            <ShieldCheck className="w-4 h-4 text-[#EB0202]" />
            <span>Accesos de Prueba para Evaluación Rápida:</span>
          </div>

          <div className="space-y-2.5">
            {/* Alumno Con Acceso */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">Ana Silva</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
                    Con Acceso
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                  alumno.autorizado@classedtech.com.co
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleQuickLogin('alumno.autorizado@classedtech.com.co', 'password123')
                }
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg transition shrink-0"
              >
                Entrar
              </button>
            </div>

            {/* Alumno Sin Acceso */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-xs font-bold text-rose-950">Pedro Gómez</span>
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">
                    Sin Acceso (403)
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mt-0.5 font-mono">
                  alumno.noautorizado@classedtech.com.co
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleQuickLogin('alumno.noautorizado@classedtech.com.co', 'password123')
                }
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium px-3 py-1.5 rounded-lg transition shrink-0"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
