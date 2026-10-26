'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  UserCheck,
  UserX,
  LogOut,
  LogIn,
  User as UserIcon,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || null);
        setUsers(data.availableUsers || []);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Error al cargar sesión:', e);
      setCurrentUser(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    fetchSession();

    const handleAuthChange = () => {
      fetchSession();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [pathname]);

  const handleSwitchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event('auth-change'));
        window.location.reload();
      }
    } catch (e) {
      console.error('Error al cambiar usuario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/login';
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthorized = currentUser?.id === 'usr_autorizado_01';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Class-Edtech Learning */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Class-Edtech Logo"
              className="w-10 h-10 object-contain hover:scale-105 transition duration-200"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="font-extrabold text-[#071D3F] text-xl tracking-tight leading-none">Class-</span>
              <span className="font-extrabold text-[#EB0202] text-xl tracking-tight leading-none">Edtech</span>
            </div>
            <span className="text-[9px] tracking-[0.25em] font-extrabold text-[#071D3F] uppercase leading-tight mt-0.5">
              LEARNING
            </span>
          </div>
        </Link>

        {/* User Session Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isCheckingSession ? (
            /* Placeholder mientras se verifica la sesión para evitar parpadeos */
            <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
          ) : currentUser ? (
            /* Vista con Sesión Iniciada: NUNCA muestra "Iniciar Sesión", muestra información y botón "Cerrar Sesión" */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Información del Alumno Activo */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-[#071D3F]">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    isAuthorized
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold leading-tight truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isAuthorized ? 'Acceso Autorizado' : 'Sin Matrícula'}
                  </span>
                </div>
              </div>

              {/* Conmutador de Perfiles para Evaluación Rápida */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                {users.map((u) => {
                  const active = currentUser.id === u.id;
                  const hasAccess = u.id === 'usr_autorizado_01';

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      disabled={isLoading || active}
                      title={`Cambiar a ${u.name}`}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? hasAccess
                            ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                            : 'bg-rose-600 text-white shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {hasAccess ? (
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <UserX className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="hidden sm:inline">
                        {hasAccess ? 'Con Acceso' : 'Sin Acceso'}
                      </span>
                      <span className="sm:hidden">
                        {hasAccess ? 'Ana' : 'Pedro'}
                      </span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botón Explícito de Cerrar Sesión */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                title="Cerrar Sesión"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#EB0202] border border-slate-200 hover:border-rose-200 text-xs font-semibold shadow-xs transition duration-150"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="whitespace-nowrap">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            /* Vista sin Sesión: Único estado donde se muestra "Iniciar Sesión" */
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071D3F] hover:bg-[#071D3F]/90 text-white font-medium text-xs shadow-sm transition"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
