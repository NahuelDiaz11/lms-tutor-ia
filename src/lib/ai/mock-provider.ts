/**
 * Mock AI Provider para evaluación técnica offline / sin consumo de servicios pagos.
 * Analiza el contenido de la lección frente a la pregunta del alumno.
 * Si la información no está en el contenido, devuelve explícitamente el mensaje de insuficiencia.
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
    // Simular una pequeña latencia natural para feedback visual de UI (300ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanQuestion = studentQuestion.toLowerCase().trim();
    const cleanContent = lessonContent.toLowerCase();

    // Palabras clave normalizadas para evaluar relevancia contextual
    const stopWords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'a', 'al', 'en', 'para', 'por', 'con', 'sin',
      'que', 'qué', 'como', 'cómo', 'cual', 'cuál', 'es', 'son',
      'sirve', 'hace', 'significa', 'diferencia', 'entre', 'me', 'puedes', 'explicar',
      'hola', 'buenos', 'días', 'tardes', 'gracias'
    ]);

    const questionKeywords = cleanQuestion
      .replace(/[¿?¡!.,;:]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    // Determinar si hay coincidencia relevante con el contenido de la lección
    const matchingKeywords = questionKeywords.filter((kw) => cleanContent.includes(kw));

    // Caso de saludos simples de cortesía
    if (/^(hola|buenos días|buenas tardes|saludos)/i.test(cleanQuestion) && questionKeywords.length <= 1) {
      return {
        answer: `¡Hola! Soy tu tutor virtual para la lección "${lessonTitle}". ¿Tienes alguna duda sobre los conceptos explicados en este material? Por ejemplo, puedes preguntarme sobre los métodos HTTP o códigos de respuesta.`,
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    // Regla estricta: Si ninguna palabra clave relevante coincide con el material de la lección
    if (matchingKeywords.length === 0) {
      return {
        answer: 'No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario.',
        isContextual: false,
        providerUsed: 'mock (offline)',
      };
    }

    // Búsqueda de secciones específicas dentro del contenido de la lección
    // Ejemplo clave del PDF: "¿Para qué sirve POST?"
    if (cleanQuestion.includes('post')) {
      return {
        answer: 'De acuerdo con el material de esta lección, el método **POST** se utiliza para enviar datos al servidor con el propósito de crear un nuevo recurso o procesar información que genere cambios en el sistema (por ejemplo, registrar un usuario o publicar un comentario).\n\nA diferencia de GET, los datos viajan en el cuerpo (*body*) de la petición en formatos como JSON, y **no es idempotente**: si envías dos veces consecutivas la misma petición POST, se crearán dos recursos independientes.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('get')) {
      return {
        answer: 'Según la lección, el método **GET** se utiliza exclusivamente para consultar y recuperar información de un recurso sin alterar el estado del servidor. Es un método seguro e **idempotente** (repetir la petición produce el mismo resultado sin efectos secundarios) y sus parámetros viajan en la URL (*query string*), no en el cuerpo.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('idempotenc') || cleanQuestion.includes('idempotente')) {
      return {
        answer: 'La lección explica que una operación es **idempotente** cuando la ejecución repetida de la misma no altera el resultado final en el servidor con respecto a haberla ejecutado una sola vez. Los métodos GET, PUT y DELETE son idempotentes; en cambio, POST no lo es.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('put') || cleanQuestion.includes('patch')) {
      return {
        answer: 'En el material se establece que **PUT** reemplaza completamente un recurso existente con los nuevos datos enviados, mientras que **PATCH** se utiliza para aplicar modificaciones parciales sobre un recurso sin sobrescribirlo por completo.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('delete')) {
      return {
        answer: 'El método **DELETE** se utiliza para eliminar el recurso especificado en la URL de destino y, según el material, se trata de una operación idempotente.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('404')) {
      return {
        answer: 'El código **404 Not Found** pertenece a la familia 4xx (errores del cliente) e indica que el recurso solicitado no existe en el servidor.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('201') || (cleanQuestion.includes('created') && cleanQuestion.includes('código'))) {
      return {
        answer: 'El código **201 Created** pertenece a la familia 2xx e indica que la solicitud fue procesada y el recurso se creó con éxito. Es la respuesta habitual y recomendada tras una petición POST exitosa.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('200') || cleanQuestion.includes('2xx')) {
      return {
        answer: 'La familia **2xx** indica éxito (solicitud recibida, comprendida y aceptada). El código **200 OK** es la respuesta exitosa estándar y genérica para operaciones GET o PUT.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('403') || cleanQuestion.includes('forbidden')) {
      return {
        answer: 'El código **403 Forbidden** indica que el cliente está autenticado pero no posee los permisos necesarios para acceder al recurso solicitado.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('401') || cleanQuestion.includes('unauthorized')) {
      return {
        answer: 'El código **401 Unauthorized** indica que se requiere autenticación y la misma no fue suministrada o no es válida.',
        isContextual: true,
        providerUsed: 'mock (offline)',
      };
    }

    if (cleanQuestion.includes('500') || cleanQuestion.includes('5xx')) {
      return {
        answer: 'La familia **5xx** agrupa los errores del servidor. En particular, **500 Internal Server Error** señala un fallo genérico e inesperado en la aplicación del servidor al procesar la petición.',
        isContextual: true,
        providerUsed: 'mock (offline)',
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
        providerUsed: 'mock (offline)',
      };
    }

    return {
      answer: 'No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario.',
      isContextual: false,
      providerUsed: 'mock (offline)',
    };
  }
}
