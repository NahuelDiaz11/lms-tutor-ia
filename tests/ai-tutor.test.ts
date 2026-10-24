import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/lib/ai/mock-provider';

describe('Tutor de IA Contextual para EdTech Inglés (Alcance Funcional 03)', () => {
  const lessonTitle = 'Lección 1: Present Simple & Daily Routines (Rutinas y Hábitos)';
  const lessonContent = `
# Present Simple & Daily Routines
El Present Simple se utiliza para hábitos, rutinas y hechos permanentes.

## Regla de la Tercera Persona Singular (He, She, It)
Se añade -s a la mayoría de verbos (work -> works).
Si termina en -ch, -sh, -ss, -x, -o, se añade -es (watch -> watches, do -> does).

## Preguntas con los Auxiliares DO y DOES
- DO: Se usa con I, you, we, they. Ejemplo: Do you speak English?
- DOES: Se usa con he, she, it. Al usar does, el verbo vuelve a su forma base. Ejemplo: Does she live in Madrid?

## Preguntas Frecuentes
- «What do you do?»: Significa "¿A qué te dedicas?" o "¿Cuál es tu profesión?".
  `.trim();

  it('debe responder adecuadamente a preguntas sobre cuándo usar DO y cuándo DOES', async () => {
    const question = '¿Cuándo debo usar "do" y cuándo "does" para hacer preguntas?';
    const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, question);

    expect(response.isContextual).toBe(true);
    expect(response.answer.toLowerCase()).toContain('tercera persona');
    expect(response.answer.toLowerCase()).toContain('forma base');
  });

  it('debe explicar el significado de la expresión común "What do you do?"', async () => {
    const question = '¿Qué significa la frase "What do you do?" y cómo se responde?';
    const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, question);

    expect(response.isContextual).toBe(true);
    expect(response.answer.toLowerCase()).toContain('profesión');
    expect(response.answer.toLowerCase()).toContain('dedicas');
  });

  it('debe explicar la regla de la tercera persona singular (-s / -es)', async () => {
    const question = '¿Por qué se agrega -s o -es en tercera persona en Present Simple?';
    const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, question);

    expect(response.isContextual).toBe(true);
    expect(response.answer.toLowerCase()).toContain('he, she, it');
  });

  it('debe indicar explícitamente insuficiencia de información ante preguntas fuera del contenido de la lección', async () => {
    const outOfContextQuestions = [
      '¿Cómo se cocina un asado argentino?',
      '¿Cuál es la distancia entre la Tierra y el Sol?',
      '¿Cómo programo una red neuronal en Python?',
      '¿Qué tipos de cambio aplican en Wall Street?',
    ];

    for (const q of outOfContextQuestions) {
      const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, q);
      expect(response.isContextual).toBe(false);
      expect(response.answer).toBe(
        'No dispongo de información suficiente en el contenido de esta lección para responder a tu pregunta. Te sugiero consultar las demás lecciones del curso o el material complementario.'
      );
    }
  });
});
