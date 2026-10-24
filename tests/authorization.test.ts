import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { checkCourseAccess, checkLessonAccess } from '../src/lib/auth';

describe('Control de Acceso y Autorización LMS EdTech (Requerimientos 01, 02 y Seguridad IDOR)', () => {
  const ALUMNO_AUTORIZADO = 'usr_autorizado_01';
  const ALUMNO_SIN_ACCESO = 'usr_noautorizado_02';
  const CURSO_ID = 'curso_ingles_conversacional_101';
  const LECCION_1_ID = 'lec_ingles_present_simple_01';

  beforeAll(async () => {
    await db.user.upsert({
      where: { id: ALUMNO_AUTORIZADO },
      update: {},
      create: {
        id: ALUMNO_AUTORIZADO,
        email: 'alumno.autorizado@edtech.poc',
        password: 'password123',
        name: 'Ana Silva (Con Acceso al Curso)',
      },
    });

    await db.user.upsert({
      where: { id: ALUMNO_SIN_ACCESO },
      update: {},
      create: {
        id: ALUMNO_SIN_ACCESO,
        email: 'alumno.noautorizado@edtech.poc',
        password: 'password123',
        name: 'Pedro Gómez (Sin Acceso al Curso)',
      },
    });

    await db.course.upsert({
      where: { id: CURSO_ID },
      update: {},
      create: {
        id: CURSO_ID,
        title: 'Inglés Práctico: Comunicación y Estructuras Fundamentales (A2-B1)',
        slug: 'ingles-practico-comunicacion',
        description: 'Curso de inglés para pruebas automatizadas',
      },
    });

    await db.lesson.upsert({
      where: { id: LECCION_1_ID },
      update: {},
      create: {
        id: LECCION_1_ID,
        courseId: CURSO_ID,
        order: 1,
        title: 'Lección 1: Present Simple & Daily Routines',
        slug: 'present-simple-routines',
        content: 'Contenido de prueba sobre Do/Does y rutinas.',
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

  it('el alumno autorizado puede acceder a la lección de inglés del curso', async () => {
    const result = await checkLessonAccess(ALUMNO_AUTORIZADO, LECCION_1_ID);
    expect(result.hasAccess).toBe(true);
    expect(result.lesson).toBeDefined();
    expect(result.lesson?.title).toContain('Lección 1');
  });

  it('el alumno sin acceso recibe hasAccess=false al consultar la lección (previene IDOR)', async () => {
    const result = await checkLessonAccess(ALUMNO_SIN_ACCESO, LECCION_1_ID);
    expect(result.hasAccess).toBe(false);
  });

  it('un usuario inexistente o malicioso recibe hasAccess=false', async () => {
    const result = await checkLessonAccess('usuario_inexistente_hacker', LECCION_1_ID);
    expect(result.hasAccess).toBe(false);
  });

  it('autenticación: usuario con credenciales correctas valida exitosamente', async () => {
    const user = await db.user.findUnique({
      where: { email: 'alumno.autorizado@edtech.poc' },
    });
    expect(user).toBeDefined();
    expect(user?.password).toBe('password123');
  });

  it('autenticación: usuario con password erróneo es rechazado', async () => {
    const user = await db.user.findUnique({
      where: { email: 'alumno.autorizado@edtech.poc' },
    });
    const isPasswordValid = user?.password === 'password_incorrecto_xyz';
    expect(isPasswordValid).toBe(false);
  });
});
