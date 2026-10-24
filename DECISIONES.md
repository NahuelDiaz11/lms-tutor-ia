# Decisiones Técnicas, Arquitectura y Límites de la POC

Este documento sintetiza las decisiones de diseño, consideraciones de seguridad, resiliencia y límites adoptados durante el desarrollo de la prueba de concepto (**POC**) para el **Tutor Virtual de Aprendizaje con IA e Interacción por Voz**.

---

## 1. Contexto y Objetivos de la Solución

El propósito de la POC es validar de forma demostrable, comprensible y acotada la experiencia de un alumno que interactúa mediante texto y voz con un tutor de IA restringido al contenido de una lección, garantizando la seguridad de accesos y la continuidad pedagógica.

---

## 2. Decisiones Arquitectónicas Relevantes

### 2.1. Framework y Arquitectura: Next.js (App Router, TypeScript)
* **Decisión:** Se optó por una arquitectura basada en **Next.js 14+ con App Router**.
* **Justificación:** 
  * Unifica la interfaz de usuario reactiva y los endpoints backend en un único repositorio ejecutable.
  * Facilita al evaluador la puesta en marcha con un solo comando (`npm run dev` o `docker compose up`), eliminando la complejidad de levantar servidores separados de backend y frontend o resolver problemas de CORS.
  * El uso estricto de TypeScript en todo el ciclo (frontend, API routes, servicios y base de datos) minimiza errores en tiempo de ejecución.

### 2.2. Base de Datos y Modelo Relacional Eficiente: SQLite + Prisma ORM
* **Decisión:** Modelado relacional normalizado con tabla de enlace de matrículas:
  * `User`: Información del alumno (`id`, `email`, `password`, `name`, `role`).
  * `Course`: Catálogo de cursos (`id`, `title`, `slug`, `description`).
  * `Enrollment`: Tabla intermedia que relaciona `User` N:M `Course` mediante clave única compuesta `@@unique([userId, courseId])`.
  * `Lesson`: Lecciones pertenecientes a un curso (`courseId`).
  * `Conversation` y `Message`: Diálogos persistidos por alumno y lección (`userId`, `lessonId`).
* **Justificación de Eficiencia:**
  * **Relación N:M Escalable:** En plataformas EdTech, vincular usuarios directamente a cursos mediante una tabla `Enrollment` es el estándar de la industria. Permite que un alumno se inscriba en múltiples cursos y que un curso tenga miles de estudiantes sin redundancia de datos.
  * **Verificación de Acceso en Tiempo Constante O(1):** La clave compuesta `userId_courseId` crea un índice B-tree único en SQLite, permitiendo comprobar si un usuario tiene acceso al curso en microsegundos y blindando el sistema contra ataques IDOR (*Insecure Direct Object References*).
  * **Cero Configuración para el Evaluador:** Mediante SQLite y el script `seed.mjs`, la base de datos se inicializa automáticamente sin necesidad de instalar servicios externos pesados (PostgreSQL/MySQL/Redis).

### 2.3. Sistema de Login y Autenticación de Dos Alumnos
* **Decisión:** Pantalla de Login dedicada (`/login`) con autenticación por credenciales (email + contraseña) y tarjetas de acceso rápido demostrativo.
* **Perfiles de Prueba:**
  * **Ana Silva (Con Acceso):** `alumno.autorizado@edtech.poc` / `password123` (inscrita en el curso de inglés).
  * **Pedro Gómez (Sin Acceso):** `alumno.noautorizado@edtech.poc` / `password123` (sin matrícula en el curso, para validar el bloqueo HTTP 403 Forbidden).
* **Sesiones Seguras:**
  * Al autenticarse, el servidor expide una cookie HTTP-Only segura (`poc_lms_user_id`) con política `SameSite: Lax`, protegiendo la sesión contra robo de tokens por scripts del lado del cliente (XSS).
  * El usuario dispone de opción de *Cerrar Sesión* (Logout) y conmutación de cuentas en tiempo real en la barra de navegación para agilizar la revisión.

### 2.3. Interacción por Voz (STT y TTS): Web Speech API Nativa
* **Decisión:** Implementación mediante la **Web Speech API** del navegador (`SpeechRecognition` para Speech-to-Text y `SpeechSynthesis` para Text-to-Speech).
* **Justificación:**
  * **Cero costo y máxima accesibilidad:** Respeta de forma estricta la directiva del enunciado: *"No se requiere contratar servicios de pago y no deben compartirse credenciales o secretos"*.
  * **Transcripción antes del envío:** El alumno puede ver en tiempo real cómo se transcribe su voz al campo de texto, dándole la oportunidad de revisar o corregir la redacción antes de remitirla al tutor.
  * **Retroalimentación auditiva:** Permite escuchar la explicación generada con controles de inicio, pausa y detención.

### 2.4. Motor del Tutor de IA: Estrategia Híbrida y Fallback Seguro
* **Decisión:** Arquitectura de proveedor desacoplado (`MockAIProvider`, `GeminiAIProvider`, `OpenAIAIProvider`) con inyección estricta de contexto y fallback automático.
* **Justificación:**
  * **Mock Inteligente Offline (por defecto):** Permite ejecutar y evaluar toda la suite de pruebas y la aplicación web de inmediato, sin requerir una conexión a internet ni una API key activa. Responde fielmente a preguntas del contenido (por ejemplo: *"¿Para qué sirve POST?"*) y activa de forma determinista la respuesta de insuficiencia ante preguntas ajenas.
  * **Compatibilidad con LLMs Reales:** Si se define `AI_PROVIDER="gemini"` o `AI_PROVIDER="openai"` junto con su clave en `.env`, el sistema utiliza el modelo de producción con delimitador de prompt estricto. Si la API externa fallara o agotara cuotas, el sistema degrada con gracia (*graceful degradation*) hacia el proveedor local sin romper la experiencia del alumno.

---

## 3. Desarrollo Seguro y Protección IDOR

En cumplimiento con el apartado de buenas prácticas del enunciado, se incorporaron las siguientes medidas de seguridad:

1. **Control de Acceso Estricto (RBAC / Matrícula):**
   * En cada solicitud a `/api/lessons/[id]` y `/api/lessons/[id]/conversation`, el servidor valida en base de datos si el `userId` en sesión posee un registro en la tabla `Enrollment` para el curso correspondiente.
   * Si el alumno no está matriculado, el servidor retorna inmediatamente un código **HTTP 403 Forbidden** y bloquea la entrega de contenidos.
2. **Prevención de Insecure Direct Object References (IDOR):**
   * Las consultas de conversaciones filtran inequívocamente por la clave compuesta `(userId, lessonId)`. Un usuario autenticado no puede consultar ni adulterar el historial de mensajes de otro alumno, incluso si altera los parámetros de la URL o los identificadores en la petición.
3. **Validación de Datos de Entrada:**
   * Uso de esquemas **Zod** para validar formatos, tipos y longitudes máximas en todas las rutas de API.
4. **Protección contra Cross-Site Scripting (XSS):**
   * El renderizado en React escapa por defecto cualquier inyección de código malicioso en los mensajes y el visor de lecciones.

---

## 4. Experiencia de Uso y Resiliencia ante Incidencias

El sistema contempla y señaliza de forma visual las siguientes contingencias:

* **Permiso de Micrófono Denegado:** Si el usuario no otorga permisos de micrófono al navegador, el sistema despliega un banner informativo amigable explicando la situación y permitiéndole continuar escribiendo su consulta por teclado sin interrupciones.
* **Navegador sin Soporte de Voz:** Detección de compatibilidad en tiempo de carga con desactivación elegante de los botones correspondientes y mensaje explicativo.
* **Caída de Conexión o Fallo de IA:** Si ocurre un error en el backend o en la API de IA, la interfaz muestra el error de forma clara con un botón interactivo de **"Reintentar enviar pregunta"**, preservando el texto que el alumno había redactado.
* **Indicadores de Estado:** Estados diferenciados para:
  * Grabando voz (anillo pulsante + onda sonora).
  * Transcribiendo texto.
  * Consultando material pedagógico (indicador animado de reflexión del tutor).
  * Reproduciendo voz de respuesta (barra de ondas y botón de detener).

---

## 5. Límites y Restricciones de la POC

Al tratarse de una prueba de concepto acotada y demostrable para el recorrido propuesto, se definieron deliberadamente los siguientes límites:

1. **Autenticación Simplificada:**
   * Para optimizar el tiempo de revisión del evaluador, se implementó un conmutador directo de usuarios en la barra superior que alterna entre el alumno con acceso y el alumno sin acceso, en lugar de un flujo engorroso de registro, activación por email y recuperación de contraseñas.
2. **Búsqueda Semántica / RAG:**
   * En esta POC, el contenido de la lección completa se inyecta directamente en el contexto del tutor (dado que el tamaño de las lecciones individuales cabe holgadamente en la ventana de contexto de los modelos modernos o en el analizador local).
   * En una plataforma LMS productiva con miles de páginas, manuales y PDFs pesados, se recomendaría complementar esto con una base de datos vectorial (como pgvector o Pinecone) y generación aumentada por recuperación (RAG jerárquico).
3. **Persistencia de Audio en Servidor:**
   * La POC no almacena los archivos binarios de audio en disco ni en almacenamiento de objetos (S3), procesando la transcripción en el cliente de manera instantánea y privada. En un entorno empresarial, podría implementarse auditoría y analítica fonética.
