import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/lib/ai/mock-provider';

describe('Tutor de IA Contextual (Alcance Funcional 03)', () => {
  const lessonTitle = 'Lección 1: Métodos HTTP y Arquitectura Cliente-Servidor';
  const lessonContent = `
# Métodos HTTP y Arquitectura Cliente-Servidor
El protocolo HTTP es el estándar fundamental que permite la comunicación.

### 2. ¿Para qué sirve POST?
El método POST se utiliza para enviar datos al servidor con el propósito de crear un nuevo recurso o procesar información que genera cambios en el sistema.
Los datos viajan en el cuerpo (body) de la petición, habitualmente en formato JSON.
No es idempotente: si envías la misma petición POST dos veces consecutivas, el servidor creará dos recursos independientes.

### 1. GET
El método GET se utiliza exclusivamente para consultar y recuperar información sin modificar el estado del servidor. Es seguro e idempotente.
  `.trim();

  it('debe responder con precisión a la pregunta clave del enunciado: "¿Para qué sirve POST?"', async () => {
    const question = '¿Para qué sirve POST?';
    const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, question);

    expect(response.isContextual).toBe(true);
    expect(response.answer.toLowerCase()).toContain('crear un nuevo recurso');
    expect(response.answer.toLowerCase()).toContain('cuerpo');
    expect(response.answer.toLowerCase()).toContain('no es idempotente');
  });

  it('debe responder sobre el método GET basándose en el contenido de la lección', async () => {
    const question = '¿Qué características tiene GET y es idempotente?';
    const response = await MockAIProvider.generateAnswer(lessonTitle, lessonContent, question);

    expect(response.isContextual).toBe(true);
    expect(response.answer.toLowerCase()).toContain('recuperar información');
    expect(response.answer.toLowerCase()).toContain('idempotente');
  });

  it('debe indicar explícitamente insuficiencia de información ante preguntas fuera del contenido de la lección', async () => {
    const outOfContextQuestions = [
      '¿Cómo se cocina una paella valenciana?',
      '¿Cuál es la distancia entre la Tierra y la Luna?',
      '¿Qué funciones trigonométricas se usan en gráficos 3D?',
      '¿Cómo configuro un clúster de Kubernetes en AWS?',
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
