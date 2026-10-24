import { AIProviderResponse } from './mock-provider';

export class OpenAIAIProvider {
  static async generateAnswer(
    apiKey: string,
    lessonTitle: string,
    lessonContent: string,
    studentQuestion: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<AIProviderResponse> {
    const systemPrompt = `
Eres un tutor virtual pedagógico en una plataforma LMS.
Tu misión es responder dudas basándote EXCLUSIVAMENTE en el contenido de la lección proporcionada.

LECCIÓN: "${lessonTitle}"
CONTENIDO OFICIAL:
\"\"\"
${lessonContent}
\"\"\"

REGLAS OBLIGATORIAS:
1. Responde únicamente apoyándote en el contenido oficial anterior.
2. Si la pregunta solicita conceptos fuera del contenido o no hay información suficiente, debes responder con esta frase textual:
"No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario."
3. No especules ni agregues información externa.
`.trim();

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: studentQuestion },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error en API de OpenAI (${res.status}): ${err}`);
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || '';
    const isContextual = !answer.includes('No dispongo de información suficiente');

    return {
      answer: answer.trim(),
      isContextual,
      providerUsed: 'OpenAI (gpt-4o-mini)',
    };
  }
}
