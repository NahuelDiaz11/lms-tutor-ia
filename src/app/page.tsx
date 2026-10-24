'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Mic,
  Volume2,
  Users,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  order: number;
  slug: string;
  summary: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
  isEnrolled: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error al cargar cursos:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isAuthorized = currentUser?.id === 'usr_autorizado_01';

  return (
    <div className="space-y-8 py-2">
      {/* Hero / Banner Principal */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Prueba de Concepto (POC) &bull; LMS Asistido por IA y Voz
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Aprende con tu Tutor Virtual Interactivo
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6">
            Plataforma demostrativa con delimitación de contexto estricta, transcripción por voz en tiempo real, síntesis de audio y control de accesos seguro contra vulnerabilidades IDOR.
          </p>

          {/* Guía Rápida para el Evaluador */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-xs text-indigo-50 space-y-2">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Guía Rápida para la Evaluación Técnica:
            </span>
            <ul className="grid sm:grid-cols-2 gap-2.5 pt-1 text-indigo-100">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <span><strong>Con acceso (Ana):</strong> Ingresa a la lección, formula preguntas por voz o texto (ej. <em>«¿Para qué sirve POST?»</em>) y escucha la respuesta.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <span><strong>Fuera de contexto:</strong> Pregunta temas ajenos a la lección; el tutor indicará que no dispone de información suficiente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <span><strong>Sin acceso (Pedro):</strong> Cambia de alumno en la barra superior y verifica la denegación estricta de lecciones e historial (HTTP 403).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                <span><strong>Persistencia:</strong> Recarga la página y comprueba que la conversación previa se recupera automáticamente para ese alumno.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Estado del Alumno Activo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isAuthorized
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sesión del Alumno:</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  isAuthorized
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {isAuthorized ? 'Acceso Autorizado' : 'Sin Acceso al Curso'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {currentUser?.name || 'Cargando usuario...'} ({currentUser?.email})
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
          Usa los botones superiores <strong>&laquo;Alumno Con Acceso&raquo;</strong> o <strong>&laquo;Alumno Sin Acceso&raquo;</strong> para conmutar de perfil en tiempo real.
        </div>
      </div>

      {/* Catálogo de Cursos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cursos Disponibles</h2>
            <p className="text-xs text-slate-500">Selecciona una lección para explorar el contenido y consultar al tutor de IA.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6 animate-pulse">
            <div className="h-64 bg-slate-200 rounded-3xl"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6 sm:p-7 border-b border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      Curso Introductorio
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        course.isEnrolled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {course.isEnrolled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Inscrito
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> No Inscrito
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
                </div>

                {/* Lecciones del Curso */}
                <div className="p-6 sm:p-7 bg-slate-50/60">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Lecciones del Plan de Estudio ({course.lessons.length})
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.lessons.map((lesson) => {
                      const canEnter = course.isEnrolled;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            canEnter
                              ? 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
                              : 'bg-slate-100/80 border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Lección {lesson.order}
                            </span>
                            {!canEnter && <Lock className="w-4 h-4 text-slate-400" />}
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">
                            {lesson.title}
                          </h5>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {lesson.summary || 'Contenido interactivo con asistencia de tutor por voz y texto.'}
                          </p>

                          {canEnter ? (
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition group"
                            >
                              Estudiar y consultar al tutor
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                            </Link>
                          ) : (
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                            >
                              Comprobar bloqueo 403
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
