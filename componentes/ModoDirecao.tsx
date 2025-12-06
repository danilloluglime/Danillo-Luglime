
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexto/AppContext';
import { processSmartCommand } from '../services/geminiService';
import { Mic, MicOff, Zap, ArrowLeft, Activity, Volume2, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModoDirecao = () => {
  const { addTask, addGoal, user } = useApp();
  const navigate = useNavigate();
  
  // Estados Visuais
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Inicializando...');
  const [transcript, setTranscript] = useState('');
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // Referências de Controle (Refs não causam re-render e são síncronas)
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const shouldListenRef = useRef(false); // Controle mestre se deve estar ouvindo
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  // Palavras-chave
  const WAKE_WORDS = ['ultra', 'assistente', 'coach', 'computador', 'amigo'];

  // --- 1. INICIALIZAÇÃO E WAKE LOCK ---
  useEffect(() => {
    const init = async () => {
      shouldListenRef.current = true; // Ativa intenção de escuta
      
      // Solicitar Wake Lock
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error('Wake Lock error:', err);
        }
      }

      // Inicia ciclo falando
      speak(`Olá ${user.name}. Modo Sentinela ativo.`, true);
    };

    init();

    return () => {
      shouldListenRef.current = false; // Desativa intenção
      stopListening();
      window.speechSynthesis.cancel();
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  // --- 2. SÍNTESE DE VOZ (Output) ---
  const speak = (text: string, resumeListeningAfter = true) => {
    // Marca que estamos falando para impedir que o onEnd do mic reinicie a escuta prematuramente
    isSpeakingRef.current = true;
    stopListening(); 
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    
    utterance.onend = () => {
        isSpeakingRef.current = false;
        if (resumeListeningAfter && shouldListenRef.current) {
            startListening();
        }
    };

    utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (resumeListeningAfter && shouldListenRef.current) {
            startListening();
        }
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- 3. RECONHECIMENTO DE VOZ (Input) ---
  const startListening = () => {
    // Verificações de segurança para não iniciar sobreposto
    if (isProcessingRef.current || isSpeakingRef.current || !shouldListenRef.current) {
        return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setErrorState("Seu navegador não suporta comandos de voz.");
      return;
    }

    try {
        // Se já existe instância, garante que pare antes de recriar
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
            recognitionRef.current = null;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false; // Importante: false para evitar buffer infinito e travamentos
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
          setIsListening(true);
          setStatus('Ouvindo...');
          setErrorState(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          // Lógica CRÍTICA de reinício:
          // Só reinicia se: Deveríamos estar ouvindo E não estamos processando E não estamos falando
          if (shouldListenRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
             // Pequeno delay para respirar o browser
             setTimeout(() => {
                 startListening(); 
             }, 300);
          }
        };

        recognition.onerror = (event: any) => {
            console.warn("Erro Mic:", event.error);
            if (event.error === 'not-allowed') {
                shouldListenRef.current = false;
                setErrorState("Microfone bloqueado. Permita o acesso.");
                speak("Preciso de permissão para ouvir.", false);
            }
            // Para 'no-speech' ou 'network', o onend vai disparar e tentar reiniciar, o que é o comportamento desejado.
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript.toLowerCase();
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
             // Lógica de Wake Word ou Comando Direto
             const detectedWakeWord = WAKE_WORDS.find(word => transcriptText.includes(word));
             
             // Se detectou palavra chave OU se o texto for longo o suficiente (comando direto)
             if (detectedWakeWord || transcriptText.length > 5) {
                 handleCommandDetected(transcriptText, detectedWakeWord || '');
             }
          }
        };

        recognition.start();
    } catch (e) {
        console.error("Falha ao iniciar mic:", e);
        setErrorState("Erro ao iniciar escuta.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
  };

  // --- 4. PROCESSAMENTO ---
  const handleCommandDetected = async (fullText: string, wakeWord: string) => {
    // Trava reinícios
    isProcessingRef.current = true;
    stopListening(); // Para o mic imediatamente

    const commandContent = wakeWord ? fullText.split(wakeWord)[1] : fullText;
    
    // Filtro de ruído (se for muito curto e não tiver wake word clara)
    if ((!commandContent || commandContent.trim().length < 3) && wakeWord) {
        // Falso positivo ou só chamou o nome
        speak("Sim?", true); // Responde e volta a ouvir
        isProcessingRef.current = false;
        return;
    }

    setStatus('Processando...');
    
    // Feedback sonoro
    const audio = new Audio('https://actions.google.com/sounds/v1/science_fiction/scifi_input_accept.ogg');
    audio.volume = 0.2;
    audio.play().catch(() => {});

    try {
        const result = await processSmartCommand(commandContent || fullText, new Date().toISOString().split('T')[0]);
        
        // Executar Ação
        if (result.action === 'createTask') {
            addTask(result.data);
        } else if (result.action === 'createGoal') {
            addGoal(result.data);
        } else if (result.action === 'controlMedia') {
            executeMediaAction(result.data.action, result.data.query, result.data.platform);
        }

        // Falar resposta -> Ao terminar, isSpeakingRef vira false e startListening é chamado
        speak(result.message || "Feito.", true);

    } catch (error) {
        speak("Não entendi, pode repetir?", true);
    } finally {
        setTranscript('');
        isProcessingRef.current = false; 
        // Nota: isProcessingRef = false AQUI, mas speak() foi chamado acima.
        // speak() setou isSpeakingRef = true.
        // Então onend do mic não vai reiniciar.
        // Quem vai reiniciar é o onend do speak().
    }
  };

  const executeMediaAction = (action: string, query: string, platform?: string) => {
      const q = encodeURIComponent(query);
      let url = '';
      switch (action) {
          case 'play_music': url = `https://open.spotify.com/search/${q}`; break;
          case 'play_video': url = `https://www.youtube.com/results?search_query=${q}`; break;
          case 'open_maps': url = `https://www.google.com/maps/search/${q}`; break;
          default: url = `https://www.google.com/search?q=${q}`; break;
      }
      if (url) window.open(url, '_blank');
  };

  const handleManualRestart = () => {
      shouldListenRef.current = true;
      isProcessingRef.current = false;
      isSpeakingRef.current = false;
      setErrorState(null);
      startListening();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden font-sans">
        {/* Background Visuals */}
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black transition-opacity duration-1000 ${isListening ? 'opacity-100' : 'opacity-60'}`}></div>
        
        {/* Header */}
        <div className="absolute top-6 left-6 z-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition px-4 py-2 rounded-full hover:bg-white/10">
                <ArrowLeft size={20} /> <span className="font-medium">Voltar</span>
            </button>
        </div>

        <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
             <div className="flex items-center gap-2 text-green-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                <Zap size={14} fill="currentColor" /> Ativo
             </div>
        </div>

        {/* Central Interface */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg text-center space-y-12">
            
            {/* Mic Sphere */}
            <div className="relative group cursor-pointer" onClick={handleManualRestart}>
                <div className={`absolute inset-0 rounded-full border-2 border-indigo-500/30 transition-all duration-1000 ${isListening ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
                <div className={`absolute inset-0 rounded-full border border-cyan-400/20 transition-all duration-[2000ms] ${isListening ? 'scale-[2] opacity-50' : 'scale-100 opacity-0'}`}></div>
                
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isListening ? 'bg-indigo-600 shadow-indigo-500/50 scale-110' : 'bg-gray-800 border border-gray-700'}`}>
                    {isListening ? (
                        <Mic size={48} className="text-white animate-pulse" />
                    ) : (
                        <MicOff size={48} className="text-gray-500" />
                    )}
                </div>
            </div>

            {/* Status & Transcript */}
            <div className="space-y-6 min-h-[120px]">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {errorState ? 'Pausado' : status}
                </h1>
                
                {errorState ? (
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-red-400 flex items-center gap-2 text-sm bg-red-900/20 px-4 py-2 rounded-full border border-red-900/50">
                            <AlertTriangle size={14} /> {errorState}
                        </p>
                        <button 
                            onClick={handleManualRestart}
                            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition shadow-lg">
                            <Play size={16} fill="currentColor" /> Retomar
                        </button>
                    </div>
                ) : (
                    <p className="text-xl text-gray-300 font-light leading-relaxed max-w-md mx-auto">
                        {transcript ? `"${transcript}"` : 'Diga "ULTRA" ou dê um comando...'}
                    </p>
                )}
            </div>

            {/* Audio Visualizer (Fake) */}
            <div className="flex items-center justify-center gap-1 h-12 w-full opacity-80">
                 {[...Array(8)].map((_, i) => (
                     <div 
                        key={i} 
                        className={`w-2 bg-cyan-400 rounded-full transition-all duration-75 ${isListening ? 'animate-pulse' : 'h-1 opacity-20'}`}
                        style={{ 
                            height: isListening ? `${Math.max(10, Math.random() * 50)}px` : '4px',
                            animationDelay: `${i * 0.1}s` 
                        }}
                     ></div>
                 ))}
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 opacity-60">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Comandos de Voz</p>
            <div className="flex gap-4 text-[10px] text-gray-400">
                <span>"Criar tarefa..."</span>
                <span>•</span>
                <span>"Minhas metas..."</span>
                <span>•</span>
                <span>"Tocar música..."</span>
            </div>
        </div>
    </div>
  );
};

export default ModoDirecao;
