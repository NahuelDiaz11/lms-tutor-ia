import { MockAIProvider, AIProviderResponse } from './mock-provider';
import { GeminiAIProvider } from './gemini-provider';
import { OpenAIAIProvider } from './openai-provider';

export type { AIProviderResponse };

export async function askAITutor(
  lessonTitle: string,
  lessonContent: string,
  studentQuestion: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<AIProviderResponse> {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === 'gemini' && geminiKey) {
    try {
      return await GeminiAIProvider.generateAnswer(
        geminiKey,
        lessonTitle,
        lessonContent,
        studentQuestion,
        conversationHistory
      );
    } catch (error) {
      console.warn('Fallo en GeminiProvider, recurriendo a MockProvider como fallback seguro:', error);
      return await MockAIProvider.generateAnswer(
        lessonTitle,
        lessonContent,
        studentQuestion,
        conversationHistory
      );
    }
  }

  if (provider === 'openai' && openaiKey) {
    try {
      return await OpenAIAIProvider.generateAnswer(
        openaiKey,
        lessonTitle,
        lessonContent,
        studentQuestion,
        conversationHistory
      );
    } catch (error) {
      console.warn('Fallo en OpenAIProvider, recurriendo a MockProvider como fallback seguro:', error);
      return await MockAIProvider.generateAnswer(
        lessonTitle,
        lessonContent,
        studentQuestion,
        conversationHistory
      );
    }
  }

  // Por defecto: MockAIProvider inteligente
  return await MockAIProvider.generateAnswer(
    lessonTitle,
    lessonContent,
    studentQuestion,
    conversationHistory
  );
}
