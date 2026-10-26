import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Síntesis de Voz de Alta Fidelidad (TTS)
 * Si OPENAI_API_KEY está configurada, genera voz neural de estudio (modelo tts-1).
 * Si no está configurada, retorna `{ fallback: true }` para que el cliente
 * utilice de inmediato el motor neural optimizado del navegador.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'nova' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        fallback: true,
        message: 'No hay OPENAI_API_KEY configurada. Usando motor neural del navegador.',
      });
    }

    // Limpiar texto para dicción humana fluida
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
      .replace(/\s*->\s*/g, ' pasa a ')
      .replace(/\bej:\s*/gi, 'por ejemplo, ')
      .replace(/\bejem:\s*/gi, 'por ejemplo, ')
      .replace(/\bvs\b/gi, 'versus')
      .replace(/[«»"“”]/g, '')
      .replace(/\(([^)]+)\)/g, ', $1, ')
      .replace(/\n+/g, '. ')
      .trim();

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: cleanText,
        voice: voice || 'nova', // 'nova' tiene un tono cálido y pedagógico ideal para EdTech
        speed: 0.98,
      }),
    });

    if (!response.ok) {
      console.warn('OpenAI TTS API error, fallback a motor local:', await response.text());
      return NextResponse.json({ fallback: true });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Error en /api/tts:', err);
    return NextResponse.json({ fallback: true, error: err.message });
  }
}
