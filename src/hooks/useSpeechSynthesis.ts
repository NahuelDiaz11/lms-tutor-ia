'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Puntuador heurístico para identificar y priorizar las voces más humanas y naturales
 * disponibles en el entorno del navegador (Edge Natural, Google Neural, Apple Siri, etc.)
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  // Filtrar si no es español
  if (!lang.startsWith('es')) return -1000;

  // 1. Nivel Superior: Voces Neuronales / Naturales de Microsoft Edge / Azure
  // Suenan como una persona real en estudio
  if (name.includes('natural') || name.includes('neural')) score += 120;
  if (name.includes('online')) score += 40;

  // 2. Nivel Alto: Voces de Google (Chrome en Android, Windows, Mac, Linux)
  // Mucho más humanas que los sintetizadores locales
  if (name.includes('google')) score += 80;

  // 3. Voces de alta calidad reconocidas por nombre (Apple Siri / Windows Premium)
  if (
    name.includes('paulina') ||
    name.includes('mónica') ||
    name.includes('monica') ||
    name.includes('jorge') ||
    name.includes('elena') ||
    name.includes('alvaro') ||
    name.includes('raquel') ||
    name.includes('sofía') ||
    name.includes('diego') ||
    name.includes('lucia') ||
    name.includes('francisca')
  ) {
    score += 60;
  }

  // 4. Penalización drástica a sintetizadores robóticos locales antiguos
  if (name.includes('espeak') || name.includes('festival') || name.includes('mbrola') || name.includes('flite')) {
    score -= 300;
  }

  // 5. Preferencia de dialectos pedagógicos
  if (lang === 'es-mx' || lang === 'es-co' || lang === 'es-419') score += 15;
  if (lang === 'es-us') score += 12;
  if (lang === 'es-es') score += 10;

  return score;
}

/**
 * Normaliza y limpia el texto para una prosodia y cadencia humana natural:
 * - Convierte flechas '->' en 'pasa a'
 * - Expande abreviaturas pedagógicas ('ej:' en 'por ejemplo,')
 * - Remueve emojis y sintaxis técnica que provocan tartamudeo en el motor
 * - Inserta pausas suaves en comas y signos gramaticales
 */
function normalizeTextForSpeech(rawText: string): string {
  return rawText
    // Eliminar formato Markdown de títulos, negritas, cursivas y bloques de código
    .replace(/[*_#`~[\]]/g, '')
    // Eliminar emojis que causan lecturas extrañas o tartamudeo en motores TTS
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    // Flechas gramaticales (ej: work -> works)
    .replace(/\s*->\s*/g, ' pasa a ')
    // Abreviaturas comunes
    .replace(/\bej:\s*/gi, 'por ejemplo, ')
    .replace(/\bejem:\s*/gi, 'por ejemplo, ')
    .replace(/\bvs\b/gi, 'versus')
    // Comillas que puedan sonar mecánicas
    .replace(/[«»"“”]/g, '')
    // Viñetas al inicio de línea
    .replace(/^[-*•]\s+/gm, '')
    // Paréntesis transformados en pausas con coma
    .replace(/\(([^)]+)\)/g, ', $1, ')
    // Saltos de línea transformados en pausas de punto
    .replace(/\n+/g, '. ')
    // Limpieza de espacios y puntos múltiples
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Carga y ordenamiento inteligente de voces del navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // Filtrar voces en español o multilenguaje
      const spanishVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith('es'));
      const candidateVoices = spanishVoices.length > 0 ? spanishVoices : allVoices;

      // Ordenar por nivel de naturalidad y humanidad
      const sortedVoices = [...candidateVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setAvailableVoices(sortedVoices);

      // Restaurar preferencia guardada o asignar la mejor voz detectada
      const savedURI = localStorage.getItem('class_edtech_preferred_voice');
      const matchedSaved = sortedVoices.find((v) => v.voiceURI === savedURI);
      const best = matchedSaved || sortedVoices[0] || null;

      setSelectedVoice(best);
    };

    // Escuchar el evento de carga asíncrona de voces del navegador
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Algunos navegadores tardan unos milisegundos en poblar getVoices()
    const timer = setTimeout(loadVoices, 350);

    const handleBeforeUnload = () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioRef.current) audioRef.current.pause();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const setVoiceByURI = useCallback(
    (voiceURI: string) => {
      const target = availableVoices.find((v) => v.voiceURI === voiceURI);
      if (target) {
        setSelectedVoice(target);
        if (typeof window !== 'undefined') {
          localStorage.setItem('class_edtech_preferred_voice', voiceURI);
        }
      }
    },
    [availableVoices]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    utteranceQueueRef.current = [];
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const speak = useCallback(
    async (text: string, messageId?: string) => {
      setError(null);

      // Si ya está reproduciendo este mismo mensaje, actuar como toggle para detener
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
        return;
      }

      stop();

      const cleanedText = normalizeTextForSpeech(text);
      if (!cleanedText) return;

      setIsSpeaking(true);
      if (messageId) setSpeakingMessageId(messageId);

      // 1. Intentar primero con la API de audio de estudio (/api/tts)
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanedText, voice: 'nova' }),
        });

        // Si la API retorna un stream de audio MP3 real
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('audio')) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            setSpeakingMessageId(null);
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            console.warn('Audio element error, intentando motor de síntesis local...');
            playViaBrowserSynthesis(cleanedText, messageId);
          };

          await audio.play();
          return;
        }
      } catch (e) {
        // Fallback inmediato al sintetizador natural del navegador
      }

      // 2. Motor de Síntesis del Navegador con Voz Optimizada
      playViaBrowserSynthesis(cleanedText, messageId);
    },
    [isSpeaking, speakingMessageId, stop, selectedVoice, availableVoices]
  );

  const playViaBrowserSynthesis = (cleanedText: string, messageId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Tu navegador no cuenta con soporte nativo de síntesis de voz.');
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Determinar la mejor voz disponible
    let voiceToUse = selectedVoice;
    if (!voiceToUse) {
      const all = window.speechSynthesis.getVoices();
      const spanish = all.filter((v) => v.lang.toLowerCase().startsWith('es'));
      const pool = spanish.length > 0 ? spanish : all;
      voiceToUse = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
    }

    // Dividir en fragmentos oracionales para evitar monotonía y bloqueos de audio
    const sentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    if (sentences.length === 0) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    let currentIndex = 0;

    const speakNextSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        return;
      }

      const sentenceText = sentences[currentIndex].trim();
      const utterance = new SpeechSynthesisUtterance(sentenceText);

      if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
      } else {
        utterance.lang = 'es-MX';
      }

      // Parámetros afinados para máxima naturalidad humana:
      // Un ritmo ligeramente pausado (0.94) y entonación cálida (1.0)
      utterance.rate = 0.94;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentIndex++;
        // Pequeña pausa natural entre oraciones (70ms)
        setTimeout(speakNextSentence, 70);
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error en oración:', e);
        if (e.error !== 'canceled') {
          currentIndex++;
          speakNextSentence();
        } else {
          setIsSpeaking(false);
          setSpeakingMessageId(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  return {
    isSpeaking,
    speakingMessageId,
    isSupported,
    error,
    availableVoices,
    selectedVoice,
    setVoiceByURI,
    speak,
    stop,
    clearError: () => setError(null),
  };
}
