'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCheck, UserX, GraduationCap, Sparkles, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setUsers(data.availableUsers || []);
      }
    } catch (e) {
      console.error('Error al cargar sesión:', e);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSwitchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        // Recargar la página actual para reflejar permisos y nuevo estado de autenticación
        window.location.reload();
      }
    } catch (e) {
      console.error('Error al cambiar usuario:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthorized = currentUser?.id === 'usr_autorizado_01';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">LinguaLearn AI</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> EdTech Inglés
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Plataforma de Aprendizaje de Inglés con Tutor de Voz</p>
          </div>
        </Link>

        {/* User Switcher Bar (Requerimiento 02: 2 alumnos con y sin acceso) */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-slate-500 font-medium">Evaluación de Accesos:</span>
            <span className="text-xs font-semibold text-slate-700">
              {currentUser?.name || 'Cargando...'}
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {users.map((u) => {
              const active = currentUser?.id === u.id;
              const hasAccess = u.id === 'usr_autorizado_01';

              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUser(u.id)}
                  disabled={isLoading || active}
                  title={`Cambiar a ${u.name}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? hasAccess
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {hasAccess ? (
                    <UserCheck className="w-3.5 h-3.5" />
                  ) : (
                    <UserX className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {hasAccess ? 'Alumno Con Acceso' : 'Alumno Sin Acceso'}
                  </span>
                  {active && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-white/90 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
