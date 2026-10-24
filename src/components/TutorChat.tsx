'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Square,
  Bot,
  User as UserIcon,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioInputUsed?: boolean;
  createdAt?: string;
}

interface TutorChatProps {
  lessonId: string;
  lessonTitle: string;
}

export default function TutorChat({ lessonId, lessonTitle }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook de Síntesis de Voz (TTS)
  const { speak, stop: stopSpeaking, isSpeaking, speakingMessageId, error: ttsError } = useSpeechSynthesis();

  // Hook de Reconocimiento de Voz (STT)
  const {
    isListening,
    transcript,
    error: sttError,
    isSupported: isSttSupported,
    startListening,
    stopListening,
    clearError: clearSttError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      if (text) {
        setInputQuestion((prev) => (prev ? `${prev} ${text}` : text));
        setWasVoiceInput(true);
      }
    },
  });

  // Si hay transcripción en progreso, actualizar el campo de texto editable
  useEffect(() => {
    if (transcript && isListening) {
      setInputQuestion(transcript);
      setWasVoiceInput(true);
    }
  }, [transcript, isListening]);

  // Cargar historial de conversación persistente (Requerimiento 05)
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/conversation`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else if (res.status === 403) {
        setErrorStatus('No tienes permiso para ver o interactuar con el tutor de esta lección.');
      } else {
        setErrorStatus('No se pudo recuperar el historial de conversaciones.');
      }
    } catch (e) {
      console.error('Error al cargar historial:', e);
      setErrorStatus('Fallo de conexión al cargar el historial del tutor.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [lessonId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Manejo de envío de preguntas
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuestion).trim();
    if (!text || isSending) return;

    if (isListening) {
      stopListening();
    }

    const currentVoiceFlag = wasVoiceInput;
    setInputQuestion('');
    setWasVoiceInput(false);
    setErrorStatus(null);
    setLastFailedQuestion(null);
    setIsSending(true);

    // Optimistic UI: Mostrar el mensaje del alumno de inmediato
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      audioInputUsed: currentVoiceFlag,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/lessons/${lessonId}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          audioInputUsed: currentVoiceFlag,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo al comunicarse con el tutor.`);
      }

      const data = await res.json();

      // Reemplazar mensaje temporal con los mensajes persistidos
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, data.userMessage, data.assistantMessage];
      });

      // Opcional: auto-reproducir por voz si el usuario preguntó por voz
      if (currentVoiceFlag && data.assistantMessage?.content) {
        speak(data.assistantMessage.content, data.assistantMessage.id);
      }
    } catch (err: any) {
      console.error('Error al enviar mensaje al tutor:', err);
      setErrorStatus(err.message || 'Incidencia al contactar con el tutor de IA.');
      setLastFailedQuestion(text);
      // Eliminar el mensaje optimista fallido para permitir reintento limpio
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setInputQuestion(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      clearSttError();
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header del Tutor */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Bot className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm tracking-wide text-white">Tutor IA Contextual</h2>
              <span className="flex items-center gap-1 text-[11px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                <Sparkles className="w-3 h-3 text-amber-300" /> Asistencia Activa
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 truncate max-w-xs sm:max-w-md">
              Restringido al contenido de: <span className="font-medium text-white">{lessonTitle}</span>
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          title="Recargar historial"
          className="text-indigo-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerta de Incidencia / Error recuperable (Requerimiento 06) */}
      {(errorStatus || sttError || ttsError) && (
        <div className="bg-rose-50 border-b border-rose-200 p-3 px-4 text-xs text-rose-800 flex items-start justify-between gap-2 transition">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Incidencia detectada:</p>
              <p className="text-rose-700">{errorStatus || sttError || ttsError}</p>
              {lastFailedQuestion && (
                <button
                  onClick={() => handleSendMessage(lastFailedQuestion)}
                  className="mt-1.5 inline-flex items-center gap-1 font-semibold text-rose-900 underline hover:no-underline"
                >
                  <RefreshCw className="w-3 h-3" /> Reintentar enviar pregunta
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setErrorStatus(null);
              clearSttError();
            }}
            className="text-rose-500 hover:text-rose-700 font-bold px-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Contenedor de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
        {isLoadingHistory ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Recuperando historial previo de la lección...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Inicia tu práctica con el Tutor de Inglés</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Puedes preguntar por texto o practicar tu pronunciación con el micrófono. El tutor te asistirá basándose exclusivamente en este contenido.
            </p>
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-left w-full shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Preguntas recomendadas para esta lección:
              </span>
              <button
                onClick={() => setInputQuestion('¿Cuándo debo usar "do" y cuándo "does"?')}
                className="text-xs text-indigo-600 font-medium hover:underline text-left block"
              >
                &laquo;¿Cuándo debo usar "do" y cuándo "does"?&raquo;
              </button>
              <button
                onClick={() => setInputQuestion('¿Qué significa "What do you do" y cómo respondo?')}
                className="text-xs text-indigo-600 font-medium hover:underline text-left block"
              >
                &laquo;¿Qué significa "What do you do"?&raquo;
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isReadingThis = speakingMessageId === msg.id && isSpeaking;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  {/* Encabezado del mensaje */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-xs opacity-75">
                    <span className="font-semibold flex items-center gap-1">
                      {isUser ? (
                        <>
                          <UserIcon className="w-3 h-3" /> Tú
                          {msg.audioInputUsed && (
                            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ml-1">
                              <Mic className="w-2.5 h-2.5" /> Voz
                            </span>
                          )}
                        </>
                      ) : (
                        'Tutor IA'
                      )}
                    </span>

                    {/* Botón de reproducción de voz (TTS) para el tutor (Requerimiento 04) */}
                    {!isUser && (
                      <button
                        onClick={() => speak(msg.content, msg.id)}
                        title={isReadingThis ? 'Detener lectura' : 'Escuchar respuesta con voz'}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium transition ${
                          isReadingThis
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isReadingThis ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-current" /> Detener
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" /> Escuchar
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Contenido del mensaje */}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Visualizador de ondas si está leyendo */}
                  {isReadingThis && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                      <div className="flex items-center h-4">
                        <span className="voice-wave-bar"></span>
                        <span className="voice-wave-bar"></span>
                        <span className="voice-wave-bar"></span>
                        <span className="voice-wave-bar"></span>
                        <span className="voice-wave-bar"></span>
                      </div>
                      <span>Reproduciendo voz del tutor...</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Estado "Pensando" (Requerimiento 06) */}
        {isSending && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="font-medium text-slate-700">El tutor está consultando el contenido de la lección...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Banner de Grabación Activa (Requerimiento 04 y 06) */}
      {isListening && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="font-semibold text-rose-700">Grabando tu voz:</span>
            <span className="italic text-slate-700 truncate max-w-xs sm:max-w-md">
              {transcript || 'Habla ahora... la voz se transcribirá antes de enviarse'}
            </span>
          </div>
          <button
            onClick={stopListening}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-md font-medium"
          >
            Finalizar grabación
          </button>
        </div>
      )}

      {/* Barra de Entrada (Texto o Voz) */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Botón de Grabación por Voz (Requerimiento 04) */}
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isSending}
            title={
              !isSttSupported
                ? 'Navegador sin soporte de voz'
                : isListening
                ? 'Detener grabación'
                : 'Grabar pregunta por voz (se transcribirá antes de enviar)'
            }
            className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-recording shadow-md shadow-rose-200'
                : isSttSupported
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Campo de Texto editable (el alumno revisa/edita antes de enviar) */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={
                isListening
                  ? 'Transcribiendo voz...'
                  : 'Escribe tu pregunta o usa el micrófono...'
              }
              disabled={isSending}
              className="w-full pl-3.5 pr-20 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            {wasVoiceInput && inputQuestion && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-indigo-100 text-indigo-700 font-medium px-1.5 py-0.5 rounded">
                Transcrito
              </span>
            )}
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isSending}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>La respuesta se basará exclusivamente en el contenido de esta lección.</span>
          <span>Pulsa el icono de audio en la respuesta para escucharla.</span>
        </div>
      </div>
    </div>
  );
}
