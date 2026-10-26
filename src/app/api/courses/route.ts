import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const userId = user?.id;

    const courses = await db.course.findMany({
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
            slug: true,
            summary: true,
          },
          orderBy: { order: 'asc' },
        },
        enrollments: userId
          ? {
              where: { userId },
            }
          : false,
      },
    });

    const coursesWithAccess = courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      lessons: course.lessons,
      isEnrolled: Array.isArray(course.enrollments) && course.enrollments.length > 0,
    }));

    const res = NextResponse.json({
      courses: coursesWithAccess,
      user,
    });

    if (!user && req.cookies.has('poc_lms_user_id')) {
      res.cookies.delete('poc_lms_user_id');
    }

    return res;
  } catch (error) {
    console.error('Error al listar cursos:', error);
    return NextResponse.json({ error: 'Error al consultar cursos' }, { status: 500 });
  }
}
