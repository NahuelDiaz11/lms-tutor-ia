import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Semilla de Base de Datos EdTech LMS (Inglés) ---');

  // Limpiar datos existentes en orden
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear los 2 alumnos requeridos por el enunciado
  const alumnoAutorizado = await prisma.user.create({
    data: {
      id: 'usr_autorizado_01',
      email: 'alumno.autorizado@edtech.poc',
      name: 'Ana Silva (Con Acceso al Curso)',
      role: 'STUDENT',
    },
  });

  const alumnoSinAcceso = await prisma.user.create({
    data: {
      id: 'usr_noautorizado_02',
      email: 'alumno.noautorizado@edtech.poc',
      name: 'Pedro Gómez (Sin Acceso al Curso)',
      role: 'STUDENT',
    },
  });

  console.log('Alumnos creados:');
  console.log(`- ${alumnoAutorizado.name} (${alumnoAutorizado.email})`);
  console.log(`- ${alumnoSinAcceso.name} (${alumnoSinAcceso.email})`);

  // 2. Crear 1 Curso EdTech de Inglés
  const curso = await prisma.course.create({
    data: {
      id: 'curso_ingles_conversacional_101',
      title: 'Inglés Práctico: Comunicación y Estructuras Fundamentales (A2-B1)',
      slug: 'ingles-practico-comunicacion',
      description: 'Desarrolla fluidez conversacional, domina el presente y el pasado, y practica tu comprensión oral y pronunciación con el tutor de IA por voz.',
    },
  });

  // 3. Crear las 2 Lecciones requeridas
  const leccion1 = await prisma.lesson.create({
    data: {
      id: 'lec_ingles_present_simple_01',
      courseId: curso.id,
      order: 1,
      title: 'Lección 1: Present Simple & Daily Routines (Rutinas y Hábitos)',
      slug: 'present-simple-and-daily-routines',
      summary: 'Aprende a describir hábitos, formular preguntas con Do/Does, y aplicar correctamente la tercera persona singular (-s/-es).',
      content: `
# Present Simple & Daily Routines

El **Present Simple** (presente simple) es el tiempo verbal fundamental en inglés para hablar sobre **hábitos, rutinas diarias, hechos generales y verdades universales**.

## 1. Usos Principales
- **Rutinas y hábitos:** *I drink coffee every morning.* (Bebo café todas las mañanas).
- **Hechos permanentes:** *The sun rises in the east.* (El sol sale por el este).
- **Horarios y programas:** *The train leaves at 8:00 AM.* (El tren sale a las 8:00 AM).

## 2. Regla de la Tercera Persona Singular (He, She, It)
En oraciones afirmativas, cuando el sujeto es **he**, **she** o **it**, el verbo principal debe modificarse:
- Se añade **-s** a la mayoría de verbos: *work -> works*, *live -> lives*.
- Si el verbo termina en *-ch, -sh, -ss, -x, -o*, se añade **-es**: *watch -> watches*, *go -> goes*, *do -> does*.
- Si termina en consonante + *y*, cambia a **-ies**: *study -> studies*. Con vocal + *y*, solo se añade -s: *play -> plays*.

## 3. Preguntas con los Auxiliares DO y DOES
Para formular preguntas en Present Simple, se utiliza el verbo auxiliar al inicio de la estructura:
- **DO**: Se usa con los pronombres **I**, **you**, **we**, **they**.
  - Ejemplo: *Do you speak English?* (¿Hablas inglés?)
  - Ejemplo: *Where do you work?* (¿Dónde trabajas?)
- **DOES**: Se usa exclusivamente con la tercera persona singular (**he**, **she**, **it**).
  - Al usar *does*, el verbo principal vuelve a su **forma base (infinitivo sin to)**, sin agregarle 's'.
  - Ejemplo: *Does she live in Madrid?* (¿Ella vive en Madrid?) — *Incorrecto: Does she lives...*

## 4. Preguntas Frecuentes en Conversación
- **«What do you do?»**: Significa *"¿A qué te dedicas?"* o *"¿Cuál es tu profesión?"*. Se responde: *I am a software engineer* o *I work as a teacher*. (No confundir con *What are you doing?* que significa "¿Qué estás haciendo ahora mismo?").
- **«Where do you come from?»**: Significa *"¿De dónde eres?"*. Se responde: *I come from Spain* o *I am from Mexico*.
      `.trim(),
    },
  });

  const leccion2 = await prisma.lesson.create({
    data: {
      id: 'lec_ingles_past_vs_perfect_02',
      courseId: curso.id,
      order: 2,
      title: 'Lección 2: Past Simple vs Present Perfect (Experiencias y Eventos Pasados)',
      slug: 'past-simple-vs-present-perfect',
      summary: 'Diferencia acciones concluidas en un tiempo definido (Past Simple) de experiencias de vida o acciones con relevancia presente (Present Perfect).',
      content: `
# Past Simple vs Present Perfect

Uno de los desafíos más importantes para los hispanohablantes al aprender inglés es distinguir cuándo usar el **Past Simple** y cuándo el **Present Perfect**.

## 1. Past Simple: Acciones Terminadas en Tiempo Específico
Se utiliza para acciones que **empezaron y terminaron en el pasado**, en un momento específico o conocido.
- **Marcadores temporales típicos:** *yesterday*, *last week*, *in 2021*, *two days ago*, *when I was a child*.
- **Estructura afirmativa:** Sujeto + Verbo en Pasado (*regular con -ed o irregular*).
  - Regular: *I visited London in 2022.* (Visité Londres en 2022).
  - Irregular: *She bought a new car yesterday.* (Ella compró un auto nuevo ayer).
- **Negación y Pregunta con auxiliar DID:**
  - *Did you go to the party?* (¿Fuiste a la fiesta?)
  - *I did not (didn't) see that movie.* (No vi esa película).

## 2. Present Perfect: Experiencias de Vida y Conexión con el Presente
Se utiliza para hablar de **experiencias a lo largo de la vida**, acciones en un tiempo no específico, o acciones pasadas cuyos resultados tienen impacto en el presente.
- **Estructura:** Sujeto + **have / has** + Verbo en **Past Participle** (participio pasado).
  - *I have visited London three times.* (He visitado Londres tres veces — a lo largo de mi vida, no importa el año exacto).
  - *She has lost her keys.* (Ha perdido sus llaves — y por eso ahora no puede entrar).
- **Palabras clave:**
  - **Ever:** Usado en preguntas para decir "¿Alguna vez...?": *Have you ever been to Japan?*
  - **Never:** Para decir "Nunca": *I have never eaten sushi.*
  - **Already:** Para acciones ya completadas antes de lo esperado: *I have already finished my homework.*
  - **Yet:** En preguntas y negativas: *Have you called him yet?* / *I haven't called yet.*
  - **Since / For:** *Since* indica el punto de inicio en el tiempo (*since 2018*), mientras que *for* indica la duración del período (*for five years*).

## 3. Regla de Oro para Decidir:
Pregúntate: **¿Se menciona o importa el momento exacto en que ocurrió?**
- Si **SÍ** se especifica cuándo ocurrió (*yesterday, in May, last year*): usa **Past Simple**.
- Si **NO** se especifica cuándo o se habla de una experiencia de vida en general: usa **Present Perfect**.
      `.trim(),
    },
  });

  console.log(`Curso creado: "${curso.title}" con 2 lecciones:`);
  console.log(`- ${leccion1.title}`);
  console.log(`- ${leccion2.title}`);

  // 4. Inscribir ÚNICAMENTE al alumno autorizado en el curso
  await prisma.enrollment.create({
    data: {
      userId: alumnoAutorizado.id,
      courseId: curso.id,
    },
  });

  console.log(`Inscripción realizada: solo ${alumnoAutorizado.name} tiene acceso.`);
  console.log(`El usuario ${alumnoSinAcceso.name} NO posee inscripción (debe recibir 403 Forbidden).`);

  // 5. Crear una conversación previa de demostración para el alumno autorizado
  const conversacionInicial = await prisma.conversation.create({
    data: {
      userId: alumnoAutorizado.id,
      lessonId: leccion1.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversacionInicial.id,
        role: 'user',
        content: '¿Cuándo debo usar "do" y cuándo "does" para hacer preguntas?',
        audioInputUsed: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        conversationId: conversacionInicial.id,
        role: 'assistant',
        content: 'En Present Simple, la regla es la siguiente:\n\n- Usas **DO** con los pronombres **I**, **you**, **we**, y **they** (por ejemplo: *"Do you speak English?"* o *"Where do you work?"*).\n- Usas **DOES** exclusivamente para la tercera persona singular (**he**, **she**, **it**) (por ejemplo: *"Does she live in Madrid?"*).\n\nUn detalle clave del material: cuando utilizas el auxiliar *does*, el verbo principal vuelve a su forma base sin la letra "s" final.',
        audioInputUsed: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 29),
      },
    ],
  });

  console.log('Conversación de prueba precargada con éxito para verificar la continuidad.');
  console.log('--- Semilla EdTech completada satisfactoriamente ---');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
