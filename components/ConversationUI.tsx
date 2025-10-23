import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Session, Blob } from "@google/genai";
import { TranscriptEntry } from '../types';

interface ConversationUIProps {
  onExit: () => void;
}

const ConversationUI: React.FC<ConversationUIProps> = ({ onExit }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = data[i];
      // Clamp the sample to the [-1, 1] range to prevent clipping.
      const clampedSample = Math.max(-1, Math.min(1, s));
      // Convert to 16-bit integer.
      // The range of a 16-bit integer is [-32768, 32767].
      // We use different multipliers for positive and negative values to map the float range correctly.
      int16[i] = clampedSample < 0 ? clampedSample * 32768 : clampedSample * 32767;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopConversation = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (micSourceRef.current) {
        micSourceRef.current.disconnect();
        micSourceRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    setStatus('idle');
    setIsSpeaking(false);
  }, []);

  const startConversation = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setTranscript([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // FIX: Cast window to `any` to support `webkitAudioContext` for older browsers without TypeScript errors.
      inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // FIX: Cast window to `any` to support `webkitAudioContext` for older browsers without TypeScript errors.
      outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            micSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.speaker === 'user' && !last.isFinal) {
                        const newTranscript = [...prev];
                        newTranscript[newTranscript.length - 1] = { ...last, text: last.text + text };
                        return newTranscript;
                    }
                    return [...prev, { speaker: 'user', text, isFinal: false }];
                });
            } else if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.speaker === 'model' && !last.isFinal) {
                        const newTranscript = [...prev];
                        newTranscript[newTranscript.length - 1] = { ...last, text: last.text + text };
                        return newTranscript;
                    }
                    return [...prev, { speaker: 'model', text, isFinal: false }];
                });
            }

            if (message.serverContent?.turnComplete) {
                setTranscript(prev => prev.map(entry => ({ ...entry, isFinal: true })));
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setIsSpeaking(true);
              const outputCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(source => source.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e: ErrorEvent) => {
            setError('An error occurred during the conversation. Please try again.');
            setStatus('error');
            stopConversation();
          },
          onclose: (e: CloseEvent) => {
            stopConversation();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'Du bist ein freundlicher und hilfsbereiter Deutschlehrer. Dein Name ist Typ-Affe. Sprich deutlich und in einem gemäßigten Tempo. Halte deine Antworten kurz und bündig.',
        },
      });

    } catch (err) {
      console.error(err);
      setError('Could not access microphone. Please check permissions and try again.');
      setStatus('error');
    }
  }, [stopConversation]);

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const isListening = status === 'connected' && !isSpeaking;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center h-[75vh] animate-fade-in">
        <div className="w-full flex justify-between items-center mb-4 px-2">
             <h2 className="text-3xl font-bold font-orbitron text-yellow-300">Gespräch</h2>
             <button onClick={onExit} className="text-slate-500 hover:text-cyan-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
        </div>
        <div ref={transcriptContainerRef} className="flex-grow w-full overflow-y-auto p-4 space-y-4 bg-slate-800/50 border border-slate-700 rounded-lg">
           {transcript.length === 0 && status !== 'connecting' && (
             <div className="flex items-center justify-center h-full text-slate-500 text-lg">
               Klicke auf das Mikrofon, um das Gespräch zu beginnen.
             </div>
           )}
           {transcript.map((entry, index) => (
             <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
               <p className={`p-3 rounded-lg max-w-md shadow-md text-lg ${entry.speaker === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                 {entry.text}
                 {!entry.isFinal && <span className="inline-block w-1 h-4 bg-slate-400 ml-1 animate-blink" />}
               </p>
             </div>
           ))}
        </div>
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        
        <div className="flex flex-col items-center justify-center mt-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
                {isListening && <div className="absolute inset-0 rounded-full bg-cyan-500/80 animate-pulse-listening" />}
                {isSpeaking && <div className="absolute inset-0 rounded-full bg-yellow-500/50 scale-125 animate-pulse" />}
                
                <button
                    onClick={status === 'connected' ? stopConversation : startConversation}
                    disabled={status === 'connecting'}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform focus:outline-none focus:ring-4 ${status === 'connected' ? 'bg-red-500 hover:bg-red-400 focus:ring-red-500/50' : 'bg-cyan-500 hover:bg-cyan-400 focus:ring-cyan-500/50'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
                    aria-label={status === 'connected' ? 'Gespräch beenden' : 'Gespräch beginnen'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        {status === 'connected' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
                        )}
                    </svg>
                </button>
            </div>
            <p className="text-slate-400 mt-4 text-sm uppercase tracking-wider h-5">
                {status === 'connecting' ? 'Verbinde...' : (isListening ? 'Höre...' : (isSpeaking ? 'Spricht...' : 'Bereit'))}
            </p>
        </div>
    </div>
  );
};

export default ConversationUI;