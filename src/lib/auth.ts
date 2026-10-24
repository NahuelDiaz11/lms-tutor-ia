import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';

export const SESSION_COOKIE_NAME = 'poc_lms_user_id';
export const DEFAULT_USER_ID = 'usr_autorizado_01';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Obtiene el usuario autenticado a partir de las cookies o el header 'x-user-id'.
 * Si no hay sesión explícita, por defecto toma al alumno autorizado para facilitar la prueba inicial.
 */
export async function getSessionUser(req?: NextRequest): Promise<AuthUser | null> {
  let userId: string | undefined;

  if (req) {
    userId = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.headers.get('x-user-id') || undefined;
  }

  if (!userId) {
    userId = DEFAULT_USER_ID;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
}

/**
 * Verifica si el usuario tiene acceso/inscripción activa al curso dado.
 * Previene IDOR y acceso no autorizado.
 */
export async function checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  return Boolean(enrollment);
}

/**
 * Verifica si el usuario tiene acceso a una lección específica a través del curso asociado.
 */
export async function checkLessonAccess(userId: string, lessonId: string): Promise<{
  hasAccess: boolean;
  lesson?: { id: string; courseId: string; title: string; content: string; order: number };
}> {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      courseId: true,
      title: true,
      content: true,
      order: true,
    },
  });

  if (!lesson) {
    return { hasAccess: false };
  }

  const hasAccess = await checkCourseAccess(userId, lesson.courseId);
  return { hasAccess, lesson };
}
