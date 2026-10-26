# Class-Edtech Learning - Tutor Virtual con IA y Voz

![Class-Edtech Learning Banner](/banner.png)

Prueba de concepto (POC) funcional desarrollada para la plataforma **Class-Edtech Learning** ([ww.classedtech.com.co](https://ww.classedtech.com.co)). Implementa una experiencia de aprendizaje interactiva asistida por un tutor de inteligencia artificial contextual, con **interacción por voz en tiempo real (STT y TTS)** para la práctica de *Speaking* y *Listening*, control de accesos seguro (prevención IDOR) y persistencia de diálogo pedagógico.

---

## 📋 Resumen del Proyecto y Requerimientos Cumplidos

| Requerimiento | Implementación en Class-Edtech Learning |
|---|---|
| **01 Contenido de aprendizaje** | Curso de inglés: *"Inglés Práctico: Comunicación y Estructuras Fundamentales (A2-B1)"* con 2 lecciones completas (Lección 1: *Present Simple & Daily Routines, reglas de tercera persona y auxiliares Do/Does*; Lección 2: *Past Simple vs Present Perfect, marcadores temporales concluidos vs experiencias de vida*). |
| **02 Alumnos y acceso** | 2 alumnos de prueba preconfigurados: **Ana Silva** (`alumno.autorizado@classedtech.com.co`, con matrícula activa al curso de inglés) y **Pedro Gómez** (`alumno.noautorizado@classedtech.com.co`, sin matrícula). Bloqueo estricto con **HTTP 403 Forbidden** y prevención de IDOR. |
| **03 Tutor de IA contextual** | Respuestas pedagógicas restringidas exclusivamente al contenido de la lección activa. Motor híbrido desacoplado con **Google Gemini (gemini-2.5-flash)** de última generación y **EdTech Mock AI** autónomo offline como fallback seguro. Si el alumno indaga sobre temas no incluidos en el material, el tutor indica formalmente que no dispone de información suficiente. |
| **04 Interacción por voz y texto** | **Speaking (STT):** El alumno puede grabar su duda o pronunciación; su voz se transcribirá en tiempo real a la caja de texto para que pueda revisarla o editarla antes de enviarla al tutor. **Listening (TTS Humano):** Motor de voz neuronal (Google WaveNet / OpenAI) que reproduce explicaciones en audio MP3 con entonación humana natural, visualizador de ondas y selector de voces. |
| **05 Continuidad de la conversación** | Historial de intercambios almacenado en base de datos SQLite por lección y alumno. Al recargar la sesión o volver en días posteriores, el alumno recupera íntegramente sus conversaciones anteriores. |
| **06 Experiencia de uso y resiliencia** | Señalización visual de estados (grabando con ondas sonoras, transcribiendo, consultando material, reproduciendo audio) y recuperación amigable ante incidencias de micrófono o desconexión con botón interactivo de **"Reintentar"**. |
| **07 Autenticación & Pantalla Inicial** | Pantalla de Login dedicada (`/login`) como punto de entrada inicial obligatorio mediante Middleware, con credenciales y tarjetas de 1 clic para conmutar fácilmente entre Ana (con acceso) y Pedro (sin acceso). |
| **Buenas Prácticas & Seguridad** | Suite de **11 pruebas automatizadas** con **Vitest** (100% pasando), workflow de **GitHub Actions (CI)**, Dockerfile/docker-compose, prevención de XSS/SQLi e IDOR con claves compuestas. |

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

El proyecto incluye tests unitarios y de integración para validar la autenticación, el comportamiento contextual del tutor, el manejo de preguntas fuera de material y el control estricto de autorizaciones:

```bash
npm test
```

Para verificar la compilación de producción:
```bash
npm run build
```

---

## 🧭 Cuentas de Acceso y Guía de Demostración

### Credenciales de Prueba Preconfiguradas:
* **Alumno Con Acceso:** `alumno.autorizado@classedtech.com.co` | Contraseña: `password123`
* **Alumno Sin Acceso:** `alumno.noautorizado@classedtech.com.co` | Contraseña: `password123`

*(En la pantalla de [http://localhost:3000/login](http://localhost:3000/login) también dispones de botones de 1 clic para entrar directamente sin escribir).*

### Flujo de Evaluación:

1. **Demostración con Alumno Autorizado (Ana Silva):**
   * Inicia sesión con la cuenta de Ana.
   * Entra a la **Lección 1: Present Simple & Daily Routines**.
   * **Prueba de Voz / Speaking (STT):**
     * Presiona el botón del **micrófono** y formula verbalmente preguntas como:
       * *«¿Cuándo debo usar "do" y cuándo "does"?»*
       * *«¿Qué significa la frase "What do you do" y cómo respondo?»*
       * *«¿Por qué se agrega -s en tercera persona?»*
     * Observa la transcripción en tiempo real en la caja de texto antes del envío.
     * Envía la consulta y recibe la explicación detallada.
   * **Prueba de Audio / Listening (TTS):**
     * Presiona el botón **«Escuchar»** en la respuesta para oír la dicción en audio.
   * **Prueba Fuera de Contexto:**
     * Pregunta un tema no cubierto (ej. recetas de cocina o programación).
     * Comprueba que el tutor responde estrictamente:  
       > *"No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario."*

2. **Demostración de Continuidad del Historial:**
   * Actualiza el navegador (F5 / Ctrl+R) o cambia de lección y regresa.
   * Comprueba que la conversación se mantiene intacta desde la base de datos SQLite.

3. **Demostración de Control de Acceso y Prevención IDOR (Pedro Gómez):**
   * Cambia en la barra superior a **«Sin Acceso»** o cierra sesión y entra con la cuenta de Pedro.
   * Intenta ingresar a las lecciones del curso.
   * El servidor bloquea el acceso con **HTTP 403 Forbidden**, previniendo que un usuario sin matrícula lea el material o las conversaciones privadas.

---

## ⚙️ Configuración y Motores de IA

La plataforma cuenta con una arquitectura de IA desacoplada y multimodelo:

### 1. Google Gemini 2.5 Flash (Recomendado - Gratuito y de Alta Precisión)
El proyecto está integrado con **`gemini-2.5-flash`** a través de la API oficial de Google AI Studio. Ofrece razonamiento pedagógico profundo, comprensión de lenguaje natural y explicaciones orales de alta calidad:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyTuClaveDeGemini"
DATABASE_URL="file:./dev.db"
```
*(Puedes obtener una clave gratuita en 1 minuto en [Google AI Studio](https://aistudio.google.com/app/apikey) sin ingresar tarjeta de crédito).*

### 2. Motor EdTech Mock Inteligente (100% Offline y Autónomo)
Si no se configura ninguna clave de API o si hay cortes de red, el sistema activa automáticamente su **EdTech Mock AI** interno:
```env
AI_PROVIDER="mock"
DATABASE_URL="file:./dev.db"
```
Este motor analiza el material de la lección activa y responde preguntas sobre auxiliares *Do/Does*, *Present Simple*, tercera persona *-s/-es*, *Past Simple vs Present Perfect*, expresiones conversacionales como *What do you do?*, etc., y activa estrictamente la respuesta de insuficiencia ante preguntas ajenas.

### 3. OpenAI (Opcional)
```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

---

## 📄 Documentación de Decisiones Técnicas
Consulta el documento [DECISIONES.md](DECISIONES.md) para un desglose completo de la arquitectura relacional, desarrollo seguro y límites de la POC.
