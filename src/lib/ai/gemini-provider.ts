import { AIProviderResponse } from './mock-provider';

export class GeminiAIProvider {
  static async generateAnswer(
    apiKey: string,
    lessonTitle: string,
    lessonContent: string,
    studentQuestion: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<AIProviderResponse> {
    const systemInstruction = `
Eres un tutor virtual pedagógico y empático en una plataforma LMS.
Tu objetivo es resolver las dudas del alumno basándote EXCLUSIVAMENTE en el contenido de la lección proporcionada.

LECCIÓN ACTUAL: "${lessonTitle}"
CONTENIDO DEL MATERIAL:
\"\"\"
${lessonContent}
\"\"\"

REGLAS ESTRICTAS DE RESPUESTA:
1. Responde únicamente con información verificable dentro del contenido de la lección anterior.
2. Si la pregunta del alumno indaga sobre temas que NO están explicados en la lección o la información es insuficiente, responde EXACTAMENTE:
"No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario."
3. No inventes datos ni utilices conocimientos externos no incluidos en el material provisto.
4. Explica con claridad, tono educativo y concisión.
`.trim();

    const formattedHistory = conversationHistory.slice(-4).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: studentQuestion }],
      },
    ];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Error en API de Gemini (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const isContextual = !answer.includes('No dispongo de información suficiente');

    return {
      answer: answer.trim(),
      isContextual,
      providerUsed: 'Google Gemini (gemini-1.5-flash)',
    };
  }
}
