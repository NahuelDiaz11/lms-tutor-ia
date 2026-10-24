import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, checkLessonAccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicie sesión para continuar.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const lessonId = params.id;
    const { hasAccess, lesson } = await checkLessonAccess(user.id, lessonId);

    if (!lesson) {
      return NextResponse.json(
        { error: 'La lección solicitada no existe.', code: 'LESSON_NOT_FOUND' },
        { status: 404 }
      );
    }

    // CONTROL DE ACCESO ESTRICTO (02 Alumnos y acceso del enunciado)
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. Tu cuenta no dispone de inscripción activa para acceder al contenido de este curso ni a su tutor.',
          code: 'FORBIDDEN_COURSE_ACCESS',
          userId: user.id,
          userEmail: user.email,
        },
        { status: 403 }
      );
    }

    // Obtener detalles del curso y lecciones hermanas para navegación
    const course = await db.course.findUnique({
      where: { id: lesson.courseId },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            slug: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      lesson,
      course,
      user,
    });
  } catch (error) {
    console.error('Error al obtener lección:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la lección.' },
      { status: 500 }
    );
  }
}
