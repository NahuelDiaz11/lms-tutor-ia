import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export const dynamic = 'force-dynamic';

/**
 * Función para descargar un fragmento de audio MP3 desde el servicio neuronal de Google
 */
function fetchGoogleTTSChunk(text: string, lang = 'es-ES'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Google TTS status code: ${res.statusCode}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );

    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Google TTS timeout'));
    });
  });
}

/**
 * Limpia y normaliza el texto para conseguir una prosodia natural de docente
 */
function cleanAndNormalize(rawText: string): string {
  return rawText
    // Eliminar formato Markdown (negrita, cursiva, títulos, código)
    .replace(/[*_#`~[\]]/g, '')
    // Eliminar emojis
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    // Reemplazos fonéticos amigables
    .replace(/\s*->\s*/g, ' pasa a ')
    .replace(/\bej:\s*/gi, 'por ejemplo, ')
    .replace(/\bejem:\s*/gi, 'por ejemplo, ')
    .replace(/\bvs\b/gi, 'versus')
    .replace(/[«»"“”]/g, '')
    // Viñetas y guiones de lista
    .replace(/^[-*•]\s+/gm, '')
    // Paréntesis transformados en pausas suaves
    .replace(/\(([^)]+)\)/g, ', $1, ')
    // Saltos de línea en pausas con punto
    .replace(/\n+/g, '. ')
    // Limpieza de signos dobles generados
    .replace(/\s+([.,;:?!])/g, '$1')
    .replace(/([.,;:?!])\s*([.,;:?!])/g, '$1 ')
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Divide el texto en fragmentos que no superen los 160 caracteres
 * respetando los límites oracionales y de comas para una dicción perfecta
 */
function splitIntoAudioChunks(text: string, maxLen = 160): string[] {
  // Dividir inicialmente por puntos, signos de interrogación o exclamación
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= maxLen) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);

      if (sentence.length > maxLen) {
        // Si una sola oración excede maxLen, dividir por comas o palabras
        const clauses = sentence.split(/(?<=[,;])\s+/);
        let subClause = '';

        for (const clause of clauses) {
          if ((subClause + ' ' + clause).trim().length <= maxLen) {
            subClause = (subClause + ' ' + clause).trim();
          } else {
            if (subClause) chunks.push(subClause);

            if (clause.length > maxLen) {
              const words = clause.split(' ');
              let wordChunk = '';
              for (const w of words) {
                if ((wordChunk + ' ' + w).trim().length <= maxLen) {
                  wordChunk = (wordChunk + ' ' + w).trim();
                } else {
                  if (wordChunk) chunks.push(wordChunk);
                  wordChunk = w;
                }
              }
              subClause = wordChunk;
            } else {
              subClause = clause;
            }
          }
        }
        current = subClause;
      } else {
        current = sentence;
      }
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Endpoint POST /api/tts
 * 1. Si OPENAI_API_KEY está presente: Genera audio con OpenAI tts-1 (voz nova/alloy).
 * 2. Si no hay OPENAI_API_KEY: Genera audio con la voz neuronal de Google (WaveNet).
 * 3. Si falla la red remota: Retorna fallback: true para usar síntesis local.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, lang = 'es-ES', voice = 'nova' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 });
    }

    const cleaned = cleanAndNormalize(text);
    if (!cleaned) {
      return NextResponse.json({ error: 'Texto vacío tras normalización' }, { status: 400 });
    }

    // 1. Opción OpenAI TTS si hay clave configurada
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: cleaned,
            voice: voice || 'nova',
            speed: 0.98,
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      } catch (openAiErr) {
        console.warn('OpenAI TTS falló, recurriendo a Google Neural TTS:', openAiErr);
      }
    }

    // 2. Opción Google Neural TTS (Sin API Key, voz humana nativa fluida)
    try {
      const chunks = splitIntoAudioChunks(cleaned, 160);
      const buffers: Buffer[] = [];

      // Descargar secuencialmente los fragmentos de audio
      for (const chunk of chunks) {
        const buf = await fetchGoogleTTSChunk(chunk, lang);
        buffers.push(buf);
      }

      const combinedAudio = Buffer.concat(buffers);

      return new NextResponse(combinedAudio, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=7200',
        },
      });
    } catch (googleErr) {
      console.warn('Google Neural TTS falló, indicando fallback al navegador:', googleErr);
      return NextResponse.json({ fallback: true });
    }
  } catch (err: any) {
    console.error('Error general en /api/tts:', err);
    return NextResponse.json({ fallback: true, error: err.message }, { status: 500 });
  }
}
