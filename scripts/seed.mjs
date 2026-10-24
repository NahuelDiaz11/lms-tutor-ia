import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Semilla de Base de Datos LMS ---');

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
      email: 'alumno.autorizado@lms.poc',
      name: 'Ana Silva (Con Acceso)',
      role: 'STUDENT',
    },
  });

  const alumnoSinAcceso = await prisma.user.create({
    data: {
      id: 'usr_noautorizado_02',
      email: 'alumno.noautorizado@lms.poc',
      name: 'Pedro Gómez (Sin Acceso)',
      role: 'STUDENT',
    },
  });

  console.log('Alumnos creados:');
  console.log(`- ${alumnoAutorizado.name} (${alumnoAutorizado.email})`);
  console.log(`- ${alumnoSinAcceso.name} (${alumnoSinAcceso.email})`);

  // 2. Crear 1 Curso
  const curso = await prisma.course.create({
    data: {
      id: 'curso_apis_web_101',
      title: 'Fundamentos de APIs Web y Protocolo HTTP',
      slug: 'fundamentos-apis-web-http',
      description: 'Aprende los pilares esenciales de la comunicación cliente-servidor en la web moderna, verbos HTTP y arquitectura REST.',
    },
  });

  // 3. Crear las 2 Lecciones requeridas
  const leccion1 = await prisma.lesson.create({
    data: {
      id: 'lec_http_metodos_01',
      courseId: curso.id,
      order: 1,
      title: 'Lección 1: Métodos HTTP y Arquitectura Cliente-Servidor',
      slug: 'metodos-http-y-cliente-servidor',
      summary: 'Comprende el rol de los métodos HTTP principales, con énfasis en GET y POST, y la noción de idempotencia.',
      content: `
# Métodos HTTP y Arquitectura Cliente-Servidor

El protocolo HTTP (Hypertext Transfer Protocol) es el estándar fundamental que permite la comunicación entre clientes (como navegadores web o aplicaciones móviles) y servidores.

## ¿Qué es una petición HTTP?
Cuando un cliente necesita interactuar con un servidor, envía una solicitud o petición HTTP que contiene:
- Un **Método o Verbo HTTP**: indica la acción que se desea realizar.
- Una **URL (Uniform Resource Locator)**: especifica el recurso de destino.
- **Cabeceras (Headers)**: metadatos sobre la petición (tipo de contenido, autenticación, etc.).
- **Cuerpo (Body)**: datos enviados al servidor (opcional, típico en solicitudes de creación o actualización).

## Métodos HTTP Principales

### 1. GET
El método GET se utiliza exclusivamente para **consultar y recuperar información** de un recurso sin modificar el estado del servidor.
- **Seguro e Idempotente**: Realizar una petición GET varias veces siempre produce el mismo resultado y no produce efectos secundarios en el servidor.
- No debe llevar cuerpo en la petición; los parámetros se envían en la cadena de consulta (query string).

### 2. ¿Para qué sirve POST?
El método POST se utiliza para **enviar datos al servidor con el propósito de crear un nuevo recurso** o procesar información que genera cambios en el sistema.
- Por ejemplo: registrar un nuevo usuario, crear una orden de compra o publicar un comentario.
- Los datos viajan en el **cuerpo (body)** de la petición, habitualmente en formato JSON.
- **No es idempotente**: si envías la misma petición POST dos veces consecutivas, el servidor creará dos recursos independientes (por ejemplo, dos usuarios duplicados o dos cobros).

### 3. PUT vs PATCH
- **PUT**: Reemplaza completamente un recurso existente con los nuevos datos suministrados.
- **PATCH**: Aplica modificaciones parciales sobre un recurso sin sobrescribirlo por completo.

### 4. DELETE
Se utiliza para eliminar el recurso especificado en la URL. Es un método idempotente.

## Resumen de Idempotencia
Una operación es idempotente si la ejecución repetida de la misma no altera el resultado final en el servidor respecto a haberla ejecutado una sola vez. GET, PUT y DELETE son idempotentes; POST **no** lo es.
      `.trim(),
    },
  });

  const leccion2 = await prisma.lesson.create({
    data: {
      id: 'lec_http_estados_02',
      courseId: curso.id,
      order: 2,
      title: 'Lección 2: Códigos de Estado y Principios REST',
      slug: 'codigos-de-estado-y-rest',
      summary: 'Descubre el significado de las respuestas HTTP según su familia numérica y las reglas básicas de diseño de APIs REST.',
      content: `
# Códigos de Estado HTTP y Principios REST

Cuando un servidor responde a una solicitud HTTP, incluye un código numérico de 3 dígitos denominado **HTTP Status Code**, que comunica de forma estandarizada el resultado de la operación.

## Familias de Códigos de Estado

### 1xx: Informativos
Indican que la petición fue recibida y el proceso continúa. Ejemplo: \`100 Continue\`.

### 2xx: Éxito (Success)
Indican que la solicitud fue recibida, comprendida y aceptada satisfactoriamente.
- **200 OK**: Solicitud exitosa genérica (habitual en GET o PUT).
- **201 Created**: El recurso ha sido creado con éxito (respuesta estándar tras un POST exitoso).
- **204 No Content**: La petición fue exitosa pero no hay contenido que devolver (frecuente en DELETE).

### 3xx: Redirecciones
Indican que el cliente debe tomar una acción adicional para completar la solicitud.
- **301 Moved Permanently**: El recurso cambió de ubicación de forma definitiva.
- **304 Not Modified**: Indica que el recurso no ha cambiado desde la última consulta en caché.

### 4xx: Errores del Cliente
Indican que la solicitud contiene un error imputable al cliente.
- **400 Bad Request**: La sintaxis de la petición es inválida o faltan parámetros requeridos.
- **401 Unauthorized**: Se requiere autenticación y no fue provista o es inválida.
- **403 Forbidden**: El cliente está autenticado pero no tiene permisos para acceder al recurso.
- **404 Not Found**: El recurso solicitado no existe en el servidor.
- **422 Unprocessable Entity**: La sintaxis es correcta pero las reglas de negocio fallaron.

### 5xx: Errores del Servidor
Indican que el servidor falló al intentar procesar una solicitud aparentemente válida.
- **500 Internal Server Error**: Error genérico inesperado en la aplicación del servidor.
- **502 Bad Gateway**: El servidor actuando como proxy recibió una respuesta inválida del servidor aguas arriba.
- **503 Service Unavailable**: El servidor no está disponible temporalmente por sobrecarga o mantenimiento.
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

  console.log(`Inscripción realizada: solo ${alumnoAutorizado.name} tiene acceso al curso.`);
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
        content: '¿Para qué sirve POST?',
        audioInputUsed: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        conversationId: conversacionInicial.id,
        role: 'assistant',
        content: 'Según el material de esta lección, el método POST se utiliza para enviar datos al servidor con el propósito de crear un nuevo recurso o procesar información que genere cambios en el sistema (como registrar un usuario o publicar un comentario). A diferencia de GET, los datos viajan en el cuerpo (body) de la petición y no es idempotente.',
        audioInputUsed: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 29),
      },
    ],
  });

  console.log('Conversación de prueba precargada con éxito para verificar la continuidad.');
  console.log('--- Semilla completada satisfactoriamente ---');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
