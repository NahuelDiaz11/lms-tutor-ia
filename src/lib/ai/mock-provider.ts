/**
 * Mock AI Provider especializado en EdTech para Aprendizaje de Inglés.
 * Responde dudas gramaticales, de vocabulario y conversación basándose EXCLUSIVAMENTE
 * en el material de la lección activa. Si la pregunta busca temas no incluidos,
 * devuelve explícitamente el mensaje de insuficiencia de información.
 */

export interface AIProviderResponse {
  answer: string;
  isContextual: boolean;
  providerUsed: string;
}

export class MockAIProvider {
  static async generateAnswer(
    lessonTitle: string,
    lessonContent: string,
    studentQuestion: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<AIProviderResponse> {
    // Simular pequeña latencia natural para feedback visual de UI (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanQuestion = studentQuestion.toLowerCase().trim();
    const cleanContent = lessonContent.toLowerCase();

    // Palabras vacías en español e inglés
    const stopWords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'a', 'al', 'en', 'para', 'por', 'con', 'sin',
      'que', 'qué', 'como', 'cómo', 'cual', 'cuál', 'es', 'son',
      'sirve', 'hace', 'significa', 'diferencia', 'entre', 'me', 'puedes', 'explicar',
      'the', 'is', 'are', 'in', 'at', 'on', 'how', 'what', 'why', 'when', 'can', 'you'
    ]);

    const questionKeywords = cleanQuestion
      .replace(/[¿?¡!.,;:"']/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    const matchingKeywords = questionKeywords.filter((kw) => cleanContent.includes(kw));

    // Saludos de cortesía
    if (/^(hola|hello|hi|good morning|good afternoon|buenos días|buenas tardes)/i.test(cleanQuestion) && questionKeywords.length <= 2) {
      return {
        answer: `Hello! I am your AI English tutor for "${lessonTitle}". ¿Tienes alguna duda sobre las reglas gramaticales, ejemplos o vocabulario de esta lección? Puedes preguntarme por texto o usando tu micrófono.`,
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Preguntas sobre DO y DOES
    if ((cleanQuestion.includes('do') && cleanQuestion.includes('does')) || cleanQuestion.includes('auxiliar')) {
      return {
        answer: 'De acuerdo con el material de la lección, la regla para preguntas en Present Simple es:\n\n- Usas **DO** con los pronombres **I, you, we, they** (ej: *"Do you speak English?"* o *"Where do you work?"*).\n- Usas **DOES** exclusivamente para la tercera persona singular (**he, she, it**) (ej: *"Does she live in Madrid?"*).\n\n⚠️ **Regla clave del texto:** Al usar *does*, el verbo principal vuelve a su forma base sin la "s" final.',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Pregunta sobre "¿Qué significa 'What do you do'?"
    if (cleanQuestion.includes('what do you do') || cleanQuestion.includes('a qué te dedicas') || cleanQuestion.includes('profesión')) {
      return {
        answer: 'La lección explica que la expresión **«What do you do?»** se traduce como *"¿A qué te dedicas?"* o *"¿Cuál es tu profesión?"*. Se responde habitualmente diciendo tu ocupación (ej: *"I am a software engineer"* o *"I work as a teacher"*).\n\nTen cuidado de no confundirla con *What are you doing?*, que significa "¿Qué estás haciendo en este instante?".',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Regla de tercera persona singular (-s / -es / -ies)
    if (cleanQuestion.includes('tercera persona') || cleanQuestion.includes('-s') || cleanQuestion.includes('-es') || cleanQuestion.includes('he, she') || cleanQuestion.includes('singular')) {
      return {
        answer: 'En la lección se detalla que en oraciones afirmativas con **he, she, it** el verbo cambia:\n\n- Se añade **-s** a la mayoría de verbos (*work -> works*).\n- Si termina en *-ch, -sh, -ss, -x, -o*, se añade **-es** (*watch -> watches*, *go -> goes*, *do -> does*).\n- Si termina en consonante + *y*, cambia a **-ies** (*study -> studies*).\n\nCon *I, you, we, they* el verbo se mantiene en su forma base sin cambios.',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Rutinas y usos de Present Simple
    if (cleanQuestion.includes('rutina') || cleanQuestion.includes('hábito') || cleanQuestion.includes('present simple') || cleanQuestion.includes('usos')) {
      return {
        answer: 'Según el contenido de la lección, el **Present Simple** se utiliza para tres propósitos principales:\n\n1. **Hábitos y rutinas:** Acciones recurrentes (ej: *"I drink coffee every morning"*).\n2. **Hechos permanentes y verdades universales:** (ej: *"The sun rises in the east"*).\n3. **Horarios programados:** (ej: *"The train leaves at 8:00 AM"*).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // --- LECCIÓN 2: PAST SIMPLE VS PRESENT PERFECT ---

    // Diferencia entre Past Simple y Present Perfect
    if ((cleanQuestion.includes('past') && cleanQuestion.includes('perfect')) || cleanQuestion.includes('diferencia entre pasado')) {
      return {
        answer: 'La regla de oro explicada en la lección es preguntarse: **¿Se menciona o importa el momento exacto en que ocurrió?**\n\n- Usa **Past Simple** cuando la acción empezó y terminó en un momento específico o conocido del pasado (con marcadores como *yesterday, in 2021, last week*).\n- Usa **Present Perfect** cuando hablas de una experiencia a lo largo de tu vida sin un año o fecha fija, o cuando la acción pasada tiene consecuencias directas en tu presente (ej: *"I have visited London three times"*).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Since y For
    if (cleanQuestion.includes('since') || cleanQuestion.includes('for')) {
      return {
        answer: 'En el material de la Lección 2 se indica la distinción:\n\n- **Since:** Señala el punto o momento exacto de inicio en el tiempo (ej: *"since 2018"*, *"since Monday"*).\n- **For:** Expresa la duración del período de tiempo transcurrido (ej: *"for five years"*, *"for two hours"*).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Ever y Never
    if (cleanQuestion.includes('ever') || cleanQuestion.includes('never')) {
      return {
        answer: 'Según la lección sobre Present Perfect:\n\n- **Ever:** Se usa en preguntas para indagar sobre experiencias de vida («¿Alguna vez...?»), por ejemplo: *"Have you ever been to Japan?"*.\n- **Never:** Se utiliza para indicar que una experiencia nunca ha ocurrido: *"I have never eaten sushi"*.\n\nAmbas estructuras van acompañadas del verbo en Past Participle (participio).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Already y Yet
    if (cleanQuestion.includes('already') || cleanQuestion.includes('yet')) {
      return {
        answer: 'El material establece que:\n\n- **Already:** Se usa en oraciones afirmativas para acciones completadas antes de lo esperado (*"I have already finished my homework"*).\n- **Yet:** Se usa al final de preguntas o negaciones para acciones que se esperan (*"Have you called him yet?"* / *"I have not called yet"*).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Marcadores temporales de Past Simple
    if (cleanQuestion.includes('yesterday') || cleanQuestion.includes('last week') || cleanQuestion.includes('marcador') || cleanQuestion.includes('did')) {
      return {
        answer: 'El **Past Simple** utiliza marcadores temporales concluidos como *yesterday*, *last week*, *in 2021*, *two days ago* o *when I was a child*. Para preguntas y oraciones negativas se utiliza el auxiliar **DID** (ej: *"Did you go to the party?"* / *"I did not see that movie"*).',
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    // Extracción de párrafos relevantes si hay coincidencias
    const paragraphs = lessonContent.split('\n\n').filter((p) => p.trim().length > 30);
    const relevantParagraphs = paragraphs.filter((p) => {
      const lower = p.toLowerCase();
      return matchingKeywords.some((kw) => lower.includes(kw));
    });

    if (relevantParagraphs.length > 0) {
      const cleanSnippet = relevantParagraphs[0]
        .replace(/^#+\s+/gm, '')
        .trim();
      return {
        answer: `Basándome en el material de "${lessonTitle}":\n\n${cleanSnippet}`,
        isContextual: true,
        providerUsed: 'EdTech Mock AI (offline)',
      };
    }

    return {
      answer: 'No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario.',
      isContextual: false,
      providerUsed: 'EdTech Mock AI (offline)',
    };
  }
}
