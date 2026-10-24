# LinguaLearn AI - POC Tutor Virtual de Inglés con Voz en Plataforma EdTech

Prueba de concepto (POC) funcional desarrollada para una **plataforma EdTech de aprendizaje de idiomas**. Representa una experiencia de aprendizaje interactiva asistida por un tutor de inteligencia artificial contextual, con **interacción por voz en tiempo real (STT y TTS)** para la práctica activa de *Speaking* y *Listening*, control de accesos seguro y persistencia de diálogo pedagógico.

---

## 📋 Resumen del Proyecto y Requerimientos Cumplidos

| Requerimiento | Implementación en LinguaLearn AI |
|---|---|
| **01 Contenido de aprendizaje** | Curso de inglés: *"Inglés Práctico: Comunicación y Estructuras Fundamentales (A2-B1)"* con 2 lecciones completas (Lección 1: *Present Simple & Daily Routines, reglas de tercera persona y auxiliares Do/Does*; Lección 2: *Past Simple vs Present Perfect, marcadores temporales concluidos vs experiencias de vida*). |
| **02 Alumnos y acceso** | 2 alumnos de prueba preconfigurados: **Ana Silva** (`alumno.autorizado@edtech.poc`, con matrícula activa al curso de inglés) y **Pedro Gómez** (`alumno.noautorizado@edtech.poc`, sin matrícula). Bloqueo estricto con **HTTP 403 Forbidden** y prevención de IDOR. |
| **03 Tutor de IA contextual** | Respuestas pedagógicas restringidas exclusivamente al contenido de la lección activa. Si el alumno indaga sobre temas no incluidos en el material, el tutor indica formalmente que no dispone de información suficiente. |
| **04 Interacción por voz y texto** | **Speaking (STT):** El alumno puede grabar su duda o pronunciación; su voz se transcribirá en tiempo real a la caja de texto para que pueda revisarla o editarla antes de enviarla al tutor. **Listening (TTS):** Sintetizador de voz en la respuesta con controles de audio para escuchar la explicación y modelos orales. |
| **05 Continuidad de la conversación** | Historial de intercambios almacenado en base de datos SQLite por lección y alumno. Al recargar la sesión o volver en días posteriores, el alumno recupera íntegramente sus conversaciones anteriores. |
| **06 Experiencia de uso y resiliencia** | Señalización visual de estados (grabando con ondas sonoras, transcribiendo, consultando material, reproduciendo audio) y recuperación amigable ante incidencias de micrófono o desconexión con botón interactivo de **"Reintentar"**. |
| **Buenas Prácticas & Seguridad** | Suite de pruebas automatizadas con **Vitest** (9 tests pasando), workflow de **GitHub Actions (CI)**, prevención de XSS/SQLi e inyección de contexto segura. |

---

## 🚀 Puesta en Marcha Rápida

### Opción A: Ejecución Local con Node.js (Recomendada)

**Requisitos previos:** Node.js v18+ o v20+ y npm.

1. **Clonar e instalar dependencias:**
   ```bash
   cd poc-lms-tutor-ia
   npm install
   ```

2. **Inicializar base de datos SQLite y datos de prueba (Seed):**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

### Opción B: Ejecución con Docker

Si prefieres ejecutar el entorno contenerizado sin instalar dependencias locales:

```bash
docker compose up --build
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye tests unitarios y de integración para validar el comportamiento contextual del tutor, el manejo de preguntas fuera de material y el control estricto de autorizaciones:

```bash
npm test
```

Para verificar la compilación de producción:
```bash
npm run build
```

---

## 🧭 Guía de Demostración y Evaluación del Flujo

Para comprobar fácilmente todos los criterios de la prueba técnica en el entorno EdTech de inglés:

### 1. Demostración con Alumno Autorizado (Ana Silva)
* En la barra superior, confirma que esté activo el perfil **«Alumno Con Acceso»** (activo por defecto).
* Haz clic en **«Estudiar y consultar al tutor»** en la **Lección 1: Present Simple & Daily Routines**.
* **Prueba de Voz / Speaking (STT):**
  * Presiona el botón del **micrófono** y formula verbalmente preguntas como:
    * *«¿Cuándo debo usar "do" y cuándo "does"?»*
    * *«¿Qué significa la frase "What do you do" y cómo respondo?»*
    * *«¿Por qué se agrega -s en tercera persona?»*
  * Observa cómo la voz se transcribe en tiempo real en la caja de texto antes del envío. Puedes modificar o complementar el texto con el teclado.
  * Presiona enviar. El tutor responderá explicando las reglas de la lección con tono pedagógico bilingüe.
* **Prueba de Audio / Listening (TTS):**
  * En la respuesta del tutor, presiona el botón **«Escuchar»** para oír la explicación y las oraciones en inglés en audio sintetizado.
* **Prueba Fuera de Contexto:**
  * Escribe o dicta una pregunta ajena a la lección, por ejemplo: *«¿Cómo preparo una receta de cocina?»* o *«¿Cómo programo una red neuronal en Python?»*.
  * Comprueba que el tutor responde estrictamente:  
    > *"No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario."*

### 2. Demostración de Continuidad del Historial
* Actualiza el navegador (F5 / Ctrl+R) o navega a la Lección 2 y regresa a la Lección 1.
* Comprueba que el historial de preguntas y respuestas se mantiene intacto y recuperado desde la base de datos.

### 3. Demostración de Control de Acceso y Prevención IDOR (Pedro Gómez)
* En la barra de navegación superior, presiona el botón **«Alumno Sin Acceso»**.
* Intenta ingresar a cualquiera de las lecciones del curso de inglés.
* Comprueba que el servidor responde con **HTTP 403 Forbidden** bloqueando de inmediato el acceso al contenido y las conversaciones privadas del otro usuario.

---

## ⚙️ Configuración y Variables de Entorno

El archivo `.env` viene preconfigurado para operar **100% offline y sin costos** mediante un Mock inteligente que no requiere tarjetas ni API keys:

```env
DATABASE_URL="file:./dev.db"
AI_PROVIDER="mock"
```

Si deseas evaluar la interacción con modelos de producción reales, puedes suministrar una API key y cambiar el proveedor:

```env
# Para Google Gemini:
AI_PROVIDER="gemini"
GEMINI_API_KEY="tu_clave_de_gemini"

# O para OpenAI:
AI_PROVIDER="openai"
OPENAI_API_KEY="tu_clave_de_openai"
```

---

## 📂 Estructura del Código

```
poc-lms-tutor-ia/
├── prisma/
│   └── schema.prisma          # Definición de modelos User, Course, Lesson, Enrollment, Conversation, Message
├── scripts/
│   └── seed.mjs               # Script de carga inicial de datos EdTech de inglés
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Endpoints de sesión y conmutación de usuarios de prueba
│   │   │   ├── courses/       # Catálogo de cursos con verificación de matrícula
│   │   │   └── lessons/       # Detalle de lección y conversaciones (protección IDOR y 403)
│   │   ├── lessons/[id]/      # Vista dividida: Material de lección + Tutor IA
│   │   ├── layout.tsx         # Layout principal con Navbar y selector de alumnos
│   │   └── page.tsx           # Dashboard principal del LMS EdTech
│   ├── components/
│   │   ├── Navbar.tsx         # Barra con conmutador rápido de alumnos de prueba
│   │   └── TutorChat.tsx      # Chat interactivo con STT, TTS, estados y resiliencia
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts  # Hook para STT con Web Speech API y recuperación de errores
│   │   └── useSpeechSynthesis.ts    # Hook para TTS con sintetizador nativo
│   └── lib/
│       ├── ai/                # Motor de IA: Mock EdTech inteligente, Gemini y OpenAI
│       ├── auth.ts            # Helpers de autenticación, verificación de permisos y anti-IDOR
│       └── db.ts              # Cliente singleton de Prisma ORM
├── tests/
│   ├── ai-tutor.test.ts       # Pruebas del tutor de inglés y delimitación de material
│   └── authorization.test.ts  # Pruebas de acceso de alumnos y prevención de IDOR
├── .github/workflows/ci.yml   # Integración continua con GitHub Actions
├── DECISIONES.md              # Documento formal de arquitectura, decisiones y límites
└── README.md                  # Este documento
```
