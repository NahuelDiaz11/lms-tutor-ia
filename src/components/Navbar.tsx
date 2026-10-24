'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  UserX,
  GraduationCap,
  Sparkles,
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
      router.push('/login');
      router.refresh();
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
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
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
                      <span className="truncate max-w-[110px] sm:max-w-none">
                        {hasAccess ? 'Con Acceso' : 'Sin Acceso'}
                      </span>
                      {active && (
                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Botón Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                title="Cerrar Sesión"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
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
