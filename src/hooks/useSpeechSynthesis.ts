'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const speak = useCallback(
    (text: string, messageId?: string) => {
      setError(null);

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setError('Tu navegador no cuenta con soporte nativo de síntesis de voz.');
        return;
      }

      // Si ya está reproduciendo este mismo mensaje, actuar como toggle para detener
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      // Limpiar markdown o caracteres especiales para una dicción más limpia
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Buscar voz en español disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find((v) => v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (messageId) setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        if (e.error !== 'canceled') {
          setError('No fue posible reproducir el audio de la respuesta.');
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, speakingMessageId, stop]
  );

  return {
    isSpeaking,
    speakingMessageId,
    isSupported,
    error,
    speak,
    stop,
    clearError: () => setError(null),
  };
}
