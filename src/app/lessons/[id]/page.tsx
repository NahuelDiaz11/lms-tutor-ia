'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Lock,
  UserCheck,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import TutorChat from '@/components/TutorChat';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  slug: string;
  content: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  lessons: { id: string; title: string; order: number }[];
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLesson() {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data.lesson);
          setCourse(data.course);
        } else {
          setErrorStatus(res.status);
          const errData = await res.json().catch(() => ({}));
          setErrorMessage(errData.error || 'No se pudo acceder a la lección.');
        }
      } catch (e) {
        console.error('Error al cargar lección:', e);
        setErrorStatus(500);
        setErrorMessage('Fallo de conexión al cargar la lección.');
      } finally {
        setIsLoading(false);
      }
    }

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleSwitchToAuthorized = async () => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr_autorizado_01' }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Verificando autorizaciones y cargando lección...</p>
      </div>
    );
  }

  // PANTALLA 403 FORBIDDEN - CONTROL DE ACCESOS Y PREVENCIÓN IDOR (Requerimiento 01 y 02)
  if (errorStatus === 403) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider border border-rose-200/60">
          Código HTTP 403 &bull; Acceso Denegado
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-3 mb-2">
          Matrícula Requerida
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {errorMessage}
          <br />
          <span className="text-xs text-slate-500 mt-2 block">
            El sistema ha bloqueado la lectura del material y la interacción con el tutor para garantizar el aislamiento de datos (prevención IDOR y desarrollo seguro).
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSwitchToAuthorized}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition"
          >
            <UserCheck className="w-4 h-4" /> Cambiar a Alumno Con Acceso (Ana Silva)
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus || !lesson) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Lección no disponible</h2>
        <p className="text-xs text-slate-500 mb-6">{errorMessage || 'No fue posible cargar el recurso.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#071D3F] hover:bg-[#071D3F]/90 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo de cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#EB0202] font-medium flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#071D3F] font-medium truncate max-w-[200px]">{course?.title}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#EB0202] font-bold">{lesson.title}</span>
        </div>

        {/* Lecciones hermanas para navegación rápida */}
        <div className="flex items-center gap-2">
          {course?.lessons.map((l) => (
            <Link
              key={l.id}
              href={`/lessons/${l.id}`}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                l.id === lesson.id
                  ? 'bg-[#071D3F] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-[#071D3F] hover:border-[#EB0202]'
              }`}
            >
              Lección {l.order}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid Principal: Contenido a la Izquierda | Tutor IA a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contenido de la Lección (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-[#EB0202] border border-[#EB0202]/30 uppercase tracking-wide">
              Lección {lesson.order}
            </span>
            <span className="text-xs text-slate-400">&bull; Material Oficial de Class-Edtech</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071D3F] tracking-tight mb-6">
            {lesson.title}
          </h1>

          {/* Renderizado de Markdown rico con estilos Class-Edtech */}
          <div className="mt-4">
            <MarkdownRenderer content={lesson.content} />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Puedes hacer preguntas por voz o texto sobre este contenido usando el panel lateral.</span>
          </div>
        </div>

        {/* Panel del Tutor IA con Voz (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <TutorChat lessonId={lesson.id} lessonTitle={lesson.title} />
        </div>
      </div>
    </div>
  );
}
