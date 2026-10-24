import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { checkCourseAccess, checkLessonAccess } from '../src/lib/auth';

describe('Control de Acceso y Autorización LMS (Requerimientos 01, 02 y Seguridad IDOR)', () => {
  const ALUMNO_AUTORIZADO = 'usr_autorizado_01';
  const ALUMNO_SIN_ACCESO = 'usr_noautorizado_02';
  const CURSO_ID = 'curso_apis_web_101';
  const LECCION_1_ID = 'lec_http_metodos_01';

  beforeAll(async () => {
    // Garantizar que la base de datos de pruebas cuente con los usuarios y matrícula inicial
    await db.user.upsert({
      where: { id: ALUMNO_AUTORIZADO },
      update: {},
      create: {
        id: ALUMNO_AUTORIZADO,
        email: 'alumno.autorizado@lms.poc',
        name: 'Ana Silva (Con Acceso)',
      },
    });

    await db.user.upsert({
      where: { id: ALUMNO_SIN_ACCESO },
      update: {},
      create: {
        id: ALUMNO_SIN_ACCESO,
        email: 'alumno.noautorizado@lms.poc',
        name: 'Pedro Gómez (Sin Acceso)',
      },
    });

    await db.course.upsert({
      where: { id: CURSO_ID },
      update: {},
      create: {
        id: CURSO_ID,
        title: 'Fundamentos de APIs Web',
        slug: 'fundamentos-apis-web-test',
        description: 'Curso de pruebas automatizadas',
      },
    });

    await db.lesson.upsert({
      where: { id: LECCION_1_ID },
      update: {},
      create: {
        id: LECCION_1_ID,
        courseId: CURSO_ID,
        order: 1,
        title: 'Lección 1: Métodos HTTP',
        slug: 'leccion-1-metodos',
        content: 'Contenido de prueba sobre POST y GET.',
      },
    });

    // Asegurar inscripción únicamente del alumno autorizado
    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: ALUMNO_AUTORIZADO,
          courseId: CURSO_ID,
        },
      },
      update: {},
      create: {
        userId: ALUMNO_AUTORIZADO,
        courseId: CURSO_ID,
      },
    });

    // Asegurar que el alumno sin acceso NO tenga matrícula
    await db.enrollment.deleteMany({
      where: {
        userId: ALUMNO_SIN_ACCESO,
        courseId: CURSO_ID,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('el alumno autorizado debe poseer acceso al curso (checkCourseAccess = true)', async () => {
    const hasAccess = await checkCourseAccess(ALUMNO_AUTORIZADO, CURSO_ID);
    expect(hasAccess).toBe(true);
  });

  it('el alumno sin acceso NO debe poseer acceso al curso (checkCourseAccess = false)', async () => {
    const hasAccess = await checkCourseAccess(ALUMNO_SIN_ACCESO, CURSO_ID);
    expect(hasAccess).toBe(false);
  });

  it('el alumno autorizado puede acceder a la lección del curso', async () => {
    const result = await checkLessonAccess(ALUMNO_AUTORIZADO, LECCION_1_ID);
    expect(result.hasAccess).toBe(true);
    expect(result.lesson).toBeDefined();
    expect(result.lesson?.title).toContain('Lección 1: Métodos HTTP');
  });

  it('el alumno sin acceso recibe hasAccess=false al consultar la lección (previene IDOR)', async () => {
    const result = await checkLessonAccess(ALUMNO_SIN_ACCESO, LECCION_1_ID);
    expect(result.hasAccess).toBe(false);
  });

  it('un usuario inexistente o malicioso recibe hasAccess=false', async () => {
    const result = await checkLessonAccess('usuario_inexistente_hacker', LECCION_1_ID);
    expect(result.hasAccess).toBe(false);
  });
});
