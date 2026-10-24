# LMS Educa - POC Tutor Virtual con IA e Interacción por Voz

Prueba de concepto (POC) funcional que implementa una experiencia de aprendizaje asistida por inteligencia artificial contextual con soporte para interacción por voz y texto en una plataforma LMS.

---

## 📋 Resumen del Proyecto y Requerimientos Cumplidos

| Requerimiento | Implementación |
|---|---|
| **01 Contenido de aprendizaje** | 1 Curso (*"Fundamentos de APIs Web y Protocolo HTTP"*) y 2 lecciones completas con explicaciones de verbos HTTP, GET, POST, idempotencia y códigos de estado REST. |
| **02 Alumnos y acceso** | 2 alumnos de prueba preconfigurados: **Ana Silva** (con acceso/inscripción) y **Pedro Gómez** (sin acceso). Bloqueo estricto con HTTP 403 Forbidden y aislamiento contra vulnerabilidades IDOR. |
| **03 Tutor de IA contextual** | Respuestas basadas exclusivamente en el material de la lección activa. Si la información solicitada no figura en el contenido, indica formalmente la insuficiencia de datos. |
| **04 Interacción por voz y texto** | Transcripción en tiempo real de voz a texto (STT) editable antes de enviar; sintetizador de voz (TTS) para escuchar las explicaciones del tutor con controles de audio. |
| **05 Continuidad de la conversación** | Historial de intercambios almacenado en base de datos SQLite por lección y alumno. Al recargar la sesión o volver en días posteriores, se recupera la conversación íntegra. |
| **06 Experiencia de uso y resiliencia** | Señalización visual de estados (grabando, transcribiendo, consultando, reproduciendo audio) y recuperación amigable ante incidencias de micrófono o desconexión con botón de reintento. |
| **Buenas Prácticas & Seguridad** | Suite de pruebas automatizadas con **Vitest**, workflow de **GitHub Actions (CI)**, prevención de XSS/SQLi e inyección de contexto segura. |

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

Para comprobar fácilmente todos los criterios de la prueba técnica:

### 1. Demostración con Alumno Autorizado (Ana Silva)
* En la barra superior, confirma que esté activo el perfil **«Alumno Con Acceso»** (activo por defecto).
* Haz clic en **«Estudiar y consultar al tutor»** en la **Lección 1: Métodos HTTP y Arquitectura Cliente-Servidor**.
* **Prueba de Voz / Texto:**
  * Presiona el botón del **micrófono** y formula verbalmente la pregunta clave: *«¿Para qué sirve POST?»*.
  * Observa cómo la voz se transcribe en tiempo real en la caja de texto antes del envío. Puedes modificar o complementar el texto con el teclado.
  * Presiona enviar. El tutor responderá explicando la creación de recursos, el envío de datos en el cuerpo y su carácter no idempotente según el texto de la lección.
* **Prueba de Audio (TTS):**
  * En la respuesta del tutor, presiona el botón **«Escuchar»** para oír la explicación en audio sintetizado.
* **Prueba Fuera de Contexto:**
  * Escribe o dicta una pregunta ajena al curso, por ejemplo: *«¿Cómo preparo una receta de cocina?»* o *«¿Cuál es la distancia a Marte?»*.
  * Comprueba que el tutor responde estrictamente:  
    > *"No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario."*

### 2. Demostración de Continuidad del Historial
* Actualiza el navegador (F5 / Ctrl+R) o navega a la Lección 2 y regresa a la Lección 1.
* Comprueba que el historial de preguntas y respuestas se mantiene intacto y recuperado desde la base de datos.

### 3. Demostración de Control de Acceso y Prevención IDOR (Pedro Gómez)
* En la barra de navegación superior, presiona el botón **«Alumno Sin Acceso»**.
* Intenta ingresar a cualquiera de las lecciones.
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
│   └── seed.mjs               # Script de carga inicial de datos de prueba
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Endpoints de sesión y conmutación de usuarios de prueba
│   │   │   ├── courses/       # Catálogo de cursos con verificación de matrícula
│   │   │   └── lessons/       # Detalle de lección y conversaciones (protección IDOR y 403)
│   │   ├── lessons/[id]/      # Vista dividida: Material de lección + Tutor IA
│   │   ├── layout.tsx         # Layout principal con Navbar y selector de alumnos
│   │   └── page.tsx           # Dashboard principal del LMS
│   ├── components/
│   │   ├── Navbar.tsx         # Barra con conmutador rápido de alumnos de prueba
│   │   └── TutorChat.tsx      # Chat interactivo con STT, TTS, estados y resiliencia
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts  # Hook para STT con Web Speech API y recuperación de errores
│   │   └── useSpeechSynthesis.ts    # Hook para TTS con sintetizador nativo
│   └── lib/
│       ├── ai/                # Motor de IA: Mock inteligente, Gemini y OpenAI
│       ├── auth.ts            # Helpers de autenticación, verificación de permisos y anti-IDOR
│       └── db.ts              # Cliente singleton de Prisma ORM
├── tests/
│   ├── ai-tutor.test.ts       # Pruebas del tutor contextual y delimitación de material
│   └── authorization.test.ts  # Pruebas de acceso de alumnos y prevención de IDOR
├── .github/workflows/ci.yml   # Integración continua con GitHub Actions
├── DECISIONES.md              # Documento formal de arquitectura, decisiones y límites
└── README.md                  # Este documento
```

---

## 📄 Documentación Adicional
Consulta el documento [DECISIONES.md](DECISIONES.md) para un análisis pormenorizado de las justificaciones técnicas, buenas prácticas de desarrollo seguro y consideraciones de arquitectura.
