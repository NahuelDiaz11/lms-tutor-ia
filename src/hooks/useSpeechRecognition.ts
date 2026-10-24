'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (text: string) => void;
  lang?: string;
}

export function useSpeechRecognition({
  onFinalTranscript,
  lang = 'es-ES',
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Parar tras una frase o pregunta
    recognition.interimResults = true; // Mostrar transcripción en tiempo real
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      const currentText = final || interim;
      setTranscript(currentText);

      if (final && onFinalTranscript) {
        onFinalTranscript(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      setIsListening(false);

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError(
            'El acceso al micrófono fue denegado por el navegador. Habilita los permisos en la barra de direcciones o escribe tu pregunta por texto.'
          );
          break;
        case 'no-speech':
          setError('No se detectó voz. Vuelve a presionar el micrófono para hablar.');
          break;
        case 'network':
          setError('Fallo de conexión en el servicio de reconocimiento de voz. Puedes enviar tu duda por texto.');
          break;
        case 'audio-capture':
          setError('No se encontró ningún micrófono disponible en tu dispositivo.');
          break;
        default:
          setError(`Incidencia de micrófono (${event.error}). Puedes continuar formulando tu duda por escrito.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [lang, onFinalTranscript]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');

    if (!isSupported) {
      setError(
        'Tu navegador no soporta Speech-to-Text nativo. Te recomendamos usar Google Chrome, Microsoft Edge o Safari, o ingresar la pregunta por escrito.'
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn('Error al iniciar SpeechRecognition:', err);
        // Si ya estaba corriendo, reiniciar
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (_) {}
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    clearError: () => setError(null),
  };
}
