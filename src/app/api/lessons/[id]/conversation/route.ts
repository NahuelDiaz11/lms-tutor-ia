import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, checkLessonAccess } from '@/lib/auth';
import { askAITutor } from '@/lib/ai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const postMessageSchema = z.object({
  question: z.string().min(1, 'La pregunta no puede estar vacía').max(2000, 'Pregunta demasiado extensa'),
  audioInputUsed: z.boolean().optional().default(false),
});

/**
 * GET: Obtener historial de conversación de la lección para el usuario autenticado.
 * Protegido contra IDOR: únicamente accede a los mensajes del usuario en sesión.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const lessonId = params.id;
    const { hasAccess } = await checkLessonAccess(user.id, lessonId);

    // CONTROL DE ACCESO (02 Alumnos y acceso)
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. No tienes autorización para consultar las conversaciones de este curso.',
          code: 'FORBIDDEN_CONVERSATION_ACCESS',
        },
        { status: 403 }
      );
    }

    // Buscar la conversación del alumno para esta lección específica (aislamiento de datos)
    const conversation = await db.conversation.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      conversationId: conversation?.id || null,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    return NextResponse.json({ error: 'Error al consultar conversación' }, { status: 500 });
  }
}

/**
 * POST: Enviar pregunta por texto o voz (transcrita) al tutor de IA contextual.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'No autenticado', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const lessonId = params.id;
    const { hasAccess, lesson } = await checkLessonAccess(user.id, lessonId);

    if (!lesson) {
      return NextResponse.json({ error: 'Lección inexistente' }, { status: 404 });
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. No puedes interactuar con el tutor de un curso al que no estás inscrito.',
          code: 'FORBIDDEN_INTERACTION',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { question, audioInputUsed } = postMessageSchema.parse(body);

    // 1. Obtener o crear conversación asociada al alumno y la lección
    let conversation = await db.conversation.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 6, // Últimos mensajes para contexto de diálogo
        },
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          userId: user.id,
          lessonId,
        },
        include: {
          messages: true,
        },
      });
    }

    // 2. Formatear historial reciente
    const history = (conversation.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Consultar al motor del tutor de IA
    const aiResponse = await askAITutor(lesson.title, lesson.content, question, history);

    // 4. Persistir mensaje del usuario y respuesta del tutor en BD (Continuidad de conversación)
    const [userMsg, assistantMsg] = await db.$transaction([
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: question,
          audioInputUsed: Boolean(audioInputUsed),
        },
      }),
      db.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.answer,
          audioInputUsed: false,
        },
      }),
      db.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      answer: aiResponse.answer,
      isContextual: aiResponse.isContextual,
      providerUsed: aiResponse.providerUsed,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Datos no válidos' }, { status: 400 });
    }
    console.error('Error al procesar interacción con IA:', error);
    return NextResponse.json(
      { error: 'El servicio del tutor de IA no pudo procesar tu solicitud. Por favor intenta de nuevo.' },
      { status: 503 }
    );
  }
}
