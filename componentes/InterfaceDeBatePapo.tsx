
import React, { useState, useRef, useEffect, useMemo, memo, useCallback, useLayoutEffect } from 'react';
import { useApp } from '../contexto/AppContext';
import { sendMessageToAIStream, LiveClient } from '../services/geminiService';
import { Send, Mic, StopCircle, Plus, FileText, Image as ImageIcon, Loader2, MessageSquare, Search, X, Volume2, Sun, Moon, Video, PhoneOff, MicOff, User, Briefcase, ChevronRight, Users, Headphones, Play, Youtube, Music, BrainCircuit, Zap, ShoppingBag, Clapperboard, ChevronDown, Bot, Heart, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';

// --- CONSTANTS ---
const PAGE_SIZE = 20;

const AVATARS = [
    {
        id: 'sophia',
        name: 'Sofia',
        role: 'Coach de Vida & Bem-Estar',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', 
        voiceName: 'Kore', 
        description: 'Especialista em inteligência emocional e equilíbrio de vida. Calma, empática e estratégica.'
    },
    {
        id: 'alex',
        name: 'Alex',
        role: 'Estrategista de Negócios',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80', 
        voiceName: 'Fenrir', 
        description: 'Focado em ROI, carreira e produtividade extrema. Direto ao ponto e analítico.'
    },
    {
        id: 'maya',
        name: 'Maya',
        role: 'Mentora Criativa',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80', 
        voiceName: 'Puck', 
        description: 'Desbloqueio criativo, inovação e pensamento lateral. Inspiradora e visionária.'
    }
];

const MessageBubble = memo(({ msg, speakingId, onSpeak, aiMode }: { msg: any, speakingId: string | null, onSpeak: (text: string, id: string) => void, aiMode: string }) => {
    const isUser = msg.role === 'user';
    
    const getAiIcon = () => {
        if (aiMode === 'sales') return <ShoppingBag size={16} />;
        if (aiMode === 'content') return <Clapperboard size={16} />;
        if (aiMode === 'therapist') return <Heart size={16} />;
        if (aiMode === 'financial') return <TrendingUp size={16} />;
        return <Zap size={16} />;
    };

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 
                    ${isUser 
                        ? 'bg-gray-200 dark:bg-gray-700' 
                        : (aiMode === 'sales' ? 'bg-green-100 text-green-600' : aiMode === 'content' ? 'bg-purple-100 text-purple-600' : 'bg-cyan-100 text-cyan-600')
                    }`}>
                    {isUser ? <User size={16} className="text-gray-500" /> : getAiIcon()}
                </div>

                <div
                  className={`relative p-4 shadow-sm text-sm md:text-base leading-relaxed
                    ${isUser
                      ? 'bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm'
                    }`}
                >
                  {msg.attachment && (
                      <div className="mb-3">
                          {msg.attachment.type === 'audio' ? (
                              <div className={`p-2 rounded-xl flex flex-col gap-1 ${isUser ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                  <div className="flex items-center gap-2 px-1">
                                      <Mic size={12} className={isUser ? 'text-white/80' : 'text-gray-500'}/>
                                      <span className={`text-[10px] font-bold uppercase ${isUser ? 'text-white/80' : 'text-gray-500'}`}>Mensagem de Voz</span>
                                  </div>
                                  <audio 
                                    controls 
                                    className="w-full h-8 max-w-[240px]" 
                                    src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} 
                                  />
                              </div>
                          ) : (
                              <div className="p-2 bg-black/10 rounded-lg text-xs flex items-center gap-2 border border-white/10">
                                  <ImageIcon size={14}/>
                                  <span className="font-medium opacity-90">Anexo ({msg.attachment.type})</span>
                              </div>
                          )}
                      </div>
                  )}
                  
                  <div className={`prose max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'} prose-p:my-1 prose-ul:my-1 prose-li:my-0`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  
                  <div className={`flex items-center gap-3 mt-3 ${isUser ? 'justify-end text-blue-100' : 'justify-between text-gray-400'}`}>
                      {/* Botão de Ouvir Mensagem */}
                      {!isUser && msg.text && (
                        <button 
                            onClick={() => onSpeak(msg.text, msg.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                                ${speakingId === msg.id 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary-600'
                                }`}
                            title="Ouvir resposta em áudio"
                        >
                            {speakingId === msg.id ? <StopCircle size={12} className="animate-pulse" /> : <Volume2 size={12} />}
                            {speakingId === msg.id ? 'Parar' : 'Ouvir'}
                        </button>
                      )}
                      <span className="text-[10px] opacity-70 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                  </div>
                </div>
            </div>
        </div>
    );
});

const InterfaceDeBatePapo = () => {
  const { chatHistory, addChatMessage, updateLastChatMessage, tasks, goals, addTask, addGoal, addPlan, user, userProfile, addReport, addNotification, smartDevices, smartHubs, updateSmartDevice, transactions } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image' | 'audio' | 'pdf', mimeType: string, data: string } | undefined>(undefined);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [mediaQuery, setMediaQuery] = useState('');

  const [aiMode, setAiMode] = useState<'coach' | 'sales' | 'content' | 'therapist' | 'financial'>('coach');

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveClientRef = useRef<LiveClient | null>(null);
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const hasTranscribedText = useRef(false);

  const filteredHistory = useMemo(() => 
    chatHistory.filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase())),
  [chatHistory, searchTerm]);

  const visibleHistory = useMemo(() => {
      if (searchTerm) return filteredHistory;
      return filteredHistory.slice(-visibleLimit);
  }, [filteredHistory, visibleLimit, searchTerm]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowScrollBottom(false);
  };

  const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
      setShowScrollBottom(!isNearBottom);

      if (container.scrollTop === 0 && !isLoadingHistory && visibleLimit < filteredHistory.length && !searchTerm) {
          setIsLoadingHistory(true);
          prevScrollHeightRef.current = container.scrollHeight;
          
          setTimeout(() => {
              setVisibleLimit(prev => Math.min(prev + PAGE_SIZE, filteredHistory.length));
              setIsLoadingHistory(false);
          }, 300);
      }
  };

  useLayoutEffect(() => {
      const container = scrollContainerRef.current;
      if (container && prevScrollHeightRef.current > 0 && !isLoadingHistory) {
          const diff = container.scrollHeight - prevScrollHeightRef.current;
          container.scrollTop = diff;
          prevScrollHeightRef.current = 0;
      }
  }, [visibleHistory, isLoadingHistory]);

  useEffect(() => {
      if (searchTerm) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 300;
      const lastMessage = chatHistory[chatHistory.length - 1];
      
      if (lastMessage?.role === 'user' || isNearBottom || prevScrollHeightRef.current === 0) {
          scrollToBottom();
      }
  }, [chatHistory.length, searchTerm]);

  useEffect(() => {
      if (isLoading && !showScrollBottom) {
          scrollToBottom();
      }
  }, [chatHistory[chatHistory.length - 1]?.text, isLoading, showScrollBottom]);


  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopLiveSession();
    };
  }, []);

  const handleStartVideoClick = () => {
      setShowAvatarSelection(true);
  };

  const handleToolExecution = (toolCalls: any[], origin: 'text' | 'live') => {
      let feedbackMessage = '';
      toolCalls.forEach((call: any) => {
        const args = call.args;
        if (call.name === 'createTask') {
          addTask({
            title: args.title,
            category: args.category || 'Geral',
            priority: args.priority || 'Média',
            dueDate: args.dueDate || new Date().toISOString().split('T')[0]
          });
          feedbackMessage += `\n\n✅ Tarefa criada: ${args.title}`;
        } else if (call.name === 'createGoal') {
            addGoal({
                title: args.title,
                description: args.description || '',
                deadline: args.deadline || ''
            });
            feedbackMessage += `\n\n🎯 Meta definida: ${args.title}`;
        } else if (call.name === 'createPlan') {
            addPlan({
                title: args.title,
                type: args.type as any,
                content: args.content
            });
            feedbackMessage += `\n\n📜 Plano de ${args.type} criado e salvo em "Planos IA"!`;
            if (origin === 'live') {
                addNotification({ title: 'Novo Plano Criado', message: `O plano "${args.title}" foi criado durante a chamada.`, type: 'success' });
            }
        } else if (call.name === 'controlMedia') {
            const mediaMsg = executeMediaAction(args.action, args.query, args.platform);
            feedbackMessage += `\n\n${mediaMsg}`;
            if (origin === 'text') handleSpeak(`Entendido. ${mediaMsg}`, Date.now().toString());
        }
      });
      return feedbackMessage;
  };

  const startLiveSession = async () => {
      setShowAvatarSelection(false);
      setIsLiveMode(true);
      setLiveStatus('connecting');
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (e) {
          console.error("Camera error:", e);
          alert("Erro ao acessar câmera. Verifique permissões.");
          setIsLiveMode(false);
          return;
      }
      const client = new LiveClient(
          (status) => setLiveStatus(status as any),
          (toolCalls) => handleToolExecution(toolCalls, 'live')
      );
      liveClientRef.current = client;
      try {
          await client.connect(userProfile, user.name, {
              name: selectedAvatar.name,
              role: selectedAvatar.role,
              voiceName: selectedAvatar.voiceName
          });
          videoIntervalRef.current = setInterval(() => {
              sendVideoFrame();
          }, 500); 
      } catch (e) {
          console.error("Connection failed", e);
          setLiveStatus('error');
      }
  };

  const stopLiveSession = () => {
      if (liveClientRef.current) {
          liveClientRef.current.disconnect();
          liveClientRef.current = null;
      }
      if (videoIntervalRef.current) {
          clearInterval(videoIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(t => t.stop());
      }
      setIsLiveMode(false);
      setLiveStatus('disconnected');
  };

  const sendVideoFrame = () => {
      if (!videoRef.current || !canvasRef.current || !liveClientRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      canvasRef.current.width = videoRef.current.videoWidth / 2;
      canvasRef.current.height = videoRef.current.videoHeight / 2;
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
      liveClientRef.current.sendVideoFrame(base64);
  };

  const handleSpeak = useCallback((text: string, id: string) => {
    if ('speechSynthesis' in window) {
        if (speakingId === id) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR'; 
        
        // Tenta encontrar uma voz do Google (geralmente melhor qualidade)
        const voices = window.speechSynthesis.getVoices();
        const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('pt-BR'));
        if (googleVoice) {
            utterance.voice = googleVoice;
        }

        utterance.rate = 1.1; 
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        setSpeakingId(id);
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Seu navegador não suporta síntese de voz.");
    }
  }, [speakingId]);

  const executeMediaAction = (action: string, query: string, platform?: string) => {
      const q = encodeURIComponent(query);
      let url = '';
      let message = '';
      switch (action) {
          case 'play_music':
          case 'play_podcast':
              if (platform === 'youtube') url = `https://music.youtube.com/search?q=${q}`;
              else url = `https://open.spotify.com/search/${q}`;
              message = `🎵 Abrindo ${platform || 'Spotify'} para tocar: ${query}`;
              break;
          case 'play_video':
              url = `https://www.youtube.com/results?search_query=${q}`;
              message = `🎬 Pesquisando vídeos de "${query}" no YouTube...`;
              break;
          case 'open_maps':
              url = `https://www.google.com/maps/search/${q}`;
              message = `🗺️ Abrindo mapa para: ${query}`;
              break;
          case 'search_google':
          default:
              url = `https://www.google.com/search?q=${q}`;
              message = `🔍 Pesquisando "${query}" no Google...`;
              break;
      }
      if (url) {
          window.open(url, '_blank');
          addNotification({ title: 'Ação Externa', message, type: 'info' });
      }
      return message;
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride !== undefined ? textOverride : inputText;
    
    if ((!textToSend.trim() && !attachment) || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: textToSend,
      timestamp: Date.now(),
      attachment: attachment ? { ...attachment } : undefined
    };

    addChatMessage(userMsg);
    setInputText('');
    setAttachment(undefined);
    setIsLoading(true);
    setSearchTerm('');
    setIsSearchOpen(false);
    
    prevScrollHeightRef.current = 0; 

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg = {
      id: aiMsgId,
      role: 'model' as const,
      text: '', 
      timestamp: Date.now()
    };
    addChatMessage(aiMsg);

    try {
      const stream = await sendMessageToAIStream(
        userMsg.text || (userMsg.attachment ? "Processar este anexo" : ""),
        chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { tasks, goals, userProfile, smartDevices, smartHubs, transactions }, 
        userMsg.attachment,
        aiMode 
      );

      let fullText = "";
      const toolCalls: any[] = [];

      for await (const chunk of stream) {
         if (chunk.text) {
             fullText += chunk.text;
             updateLastChatMessage(fullText);
         }
         if (chunk.functionCalls) {
             toolCalls.push(...chunk.functionCalls);
         }
      }

      if (toolCalls.length > 0) {
          const feedback = handleToolExecution(toolCalls, 'text');
          if (feedback) {
              updateLastChatMessage(fullText + feedback);
          }
      }

    } catch (err) {
      console.error(err);
      updateLastChatMessage("Desculpe, tive um erro ao processar. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMedia = (platform: 'spotify' | 'youtube') => {
      if (!mediaQuery.trim()) return;
      const command = `Quero ouvir "${mediaQuery}" no ${platform}`;
      setShowMediaPopup(false);
      setMediaQuery('');
      handleSendMessage(command);
  };

  const triggerPlanCreation = () => {
      handleSendMessage("Por favor, crie um plano detalhado para mim. (Aguardando IA perguntar o tipo...)");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      hasTranscribedText.current = false; 

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
           const base64Content = base64data.split(',')[1];
           setAttachment({ type: 'audio', mimeType: 'audio/webm', data: base64Content });
           if (!hasTranscribedText.current) {
                setInputText(prev => prev || "(Áudio sem texto)");
           }
        };
      };

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onresult = (event: any) => {
           let finalTranscript = '';
           for (let i = event.resultIndex; i < event.results.length; ++i) {
             if (event.results[i].isFinal) {
               finalTranscript += event.results[i][0].transcript;
             }
           }
           if (finalTranscript) {
             hasTranscribedText.current = true;
             setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
           }
        };
        recognitionRef.current.start();
      }

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro mic:", err);
      alert("Erro ao acessar microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Relatório UltraIA`, 10, 20);
    doc.setFontSize(12);
    let y = 30;
    doc.text("Resumo:", 10, y);
    y += 10;
    chatHistory.slice(-5).forEach(msg => {
        const line = `${msg.role === 'user' ? 'Você' : 'UltraIA'}: ${msg.text.substring(0, 80)}...`;
        doc.text(line, 10, y);
        y += 10;
    });
    doc.save(`relatorio-ultraia.pdf`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          let type: 'image' | 'audio' | 'pdf' = 'pdf';
          if (file.type.startsWith('image')) type = 'image';
          else if (file.type.startsWith('audio')) type = 'audio';
          setAttachment({ type, mimeType: file.type, data: base64String });
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen bg-gray-50 dark:bg-dark-900 relative">
      
      {/* --- AVATAR SELECTION MODAL --- */}
      {showAvatarSelection && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white dark:bg-dark-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                          <Users className="text-primary-500" /> Escolha sua Companhia
                      </h2>
                      <button onClick={() => setShowAvatarSelection(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
                          <X size={24} />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {AVATARS.map(avatar => (
                          <div 
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${selectedAvatar.id === avatar.id ? 'border-primary-500 ring-4 ring-primary-500/20 scale-[1.02]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                          >
                                <div className="aspect-[3/4] relative bg-gray-200 dark:bg-gray-700">
                                    <img 
                                        src={avatar.image} 
                                        alt={avatar.name} 
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${avatar.name}&background=random&size=400`;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="text-white font-bold text-xl">{avatar.name}</h3>
                                        <p className="text-white/80 text-sm font-medium">{avatar.role}</p>
                                    </div>
                                    {selectedAvatar.id === avatar.id && (
                                        <div className="absolute top-4 right-4 bg-primary-500 text-white p-2 rounded-full shadow-lg">
                                            <Video size={20} />
                                        </div>
                                    )}
                                </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                      <button 
                        onClick={startLiveSession}
                        className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:scale-105 transition-transform flex items-center gap-2"
                      >
                          Iniciar Chamada <ChevronRight />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- VIDEO CALL MODAL --- */}
      {isLiveMode && (
          <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-between animate-in fade-in overflow-hidden h-full">
              <div className="absolute inset-0 z-0 opacity-40 blur-3xl scale-110" style={{ backgroundImage: `url(${selectedAvatar.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="absolute inset-0 z-0 bg-black/60"></div>

              <div className="w-full flex justify-between items-center text-white/90 p-6 z-10">
                  <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${liveStatus === 'connected' ? 'bg-green-500 text-green-500 animate-pulse' : 'bg-red-500 text-red-500'}`}></div>
                      <div>
                          <h3 className="font-bold text-lg tracking-wide">{selectedAvatar.name}</h3>
                          <p className="text-xs text-white/60 uppercase tracking-widest">{liveStatus === 'connected' ? 'Conectado' : 'Chamando...'}</p>
                      </div>
                  </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-4">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-black z-10">
                       <img 
                            src={selectedAvatar.image} 
                            alt={selectedAvatar.name} 
                            className={`w-full h-full object-cover object-top transition-all duration-1000 ${liveStatus === 'connected' ? 'scale-105' : 'scale-100 opacity-50'}`} 
                            onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedAvatar.name}&background=random&size=400`;
                            }}
                       />
                       {liveStatus === 'connected' && (
                           <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent mix-blend-overlay animate-pulse"></div>
                       )}
                  </div>
                  
                  {liveStatus === 'connected' && (
                      <p className="mt-8 text-white/80 text-lg font-light animate-pulse flex items-center gap-2">
                          <Mic size={16} /> Ouvindo...
                      </p>
                  )}
              </div>

              {/* User Camera View: Repositioned to avoid overlap on mobile */}
              <div className="absolute bottom-24 right-4 w-24 h-32 sm:w-32 sm:h-48 md:w-40 md:h-60 bg-gray-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                  />
                  <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex items-center gap-6 mb-8 z-10 pb-safe">
                  <button 
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-5 rounded-full transition-all duration-300 ${isMicMuted ? 'bg-white text-dark-900' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10'}`}>
                    {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <button 
                    onClick={stopLiveSession}
                    className="p-6 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transform hover:scale-105 transition-all shadow-red-500/30">
                    <PhoneOff size={32} fill="currentColor" />
                  </button>
              </div>
          </div>
      )}

      {/* --- NORMAL CHAT UI --- */}
      <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 sticky top-0 z-20 shadow-sm">
        {isSearchOpen ? (
            <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-200 max-w-4xl mx-auto w-full">
                <Search size={18} className="text-gray-400" />
                <input 
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-400 text-sm"
                />
                <button onClick={() => { setSearchTerm(''); setIsSearchOpen(false); }} className="p-1 text-gray-500"><X size={18} /></button>
            </div>
        ) : (
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
                <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 pr-2">
                    <button onClick={() => setAiMode('coach')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${aiMode === 'coach' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Zap size={12} /> Coach</button>
                    <button onClick={() => setAiMode('sales')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${aiMode === 'sales' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><ShoppingBag size={12} /> Vendas</button>
                    <button onClick={() => setAiMode('therapist')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${aiMode === 'therapist' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Heart size={12} /> Zen</button>
                    <button onClick={() => setAiMode('content')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${aiMode === 'content' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Clapperboard size={12} /> Creator</button>
                    <button onClick={() => setAiMode('financial')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${aiMode === 'financial' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><TrendingUp size={12} /> Fin</button>
                </div>

                <div className="flex gap-1 ml-1 shrink-0">
                    <button onClick={handleStartVideoClick} className="p-2 text-gray-500 hover:text-purple-600 bg-gray-50 dark:bg-gray-800 rounded-lg"><Video size={18} /></button>
                    <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-500 hover:text-primary-600 bg-gray-50 dark:bg-gray-800 rounded-lg"><Search size={18} /></button>
                    <button onClick={generatePDF} className="p-2 text-gray-500 hover:text-primary-600 bg-gray-50 dark:bg-gray-800 rounded-lg hidden sm:block"><FileText size={18} /></button>
                </div>
            </div>
        )}
      </div>

      <div 
        className="flex-1 overflow-y-auto px-2 md:px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800" 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full pb-2">
            {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center text-gray-400 opacity-60 flex-1 my-10">
                    <Bot size={48} className="mb-4" />
                    <p className="font-bold text-lg mb-1 dark:text-white">UltraIA Online</p>
                    <p className="text-sm text-center">Escolha um modo acima e comece.</p>
                </div>
            )}
            
            {isLoadingHistory && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary-500 w-5 h-5" /></div>}

            {visibleHistory.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} speakingId={speakingId} onSpeak={handleSpeak} aiMode={aiMode} />
            ))}
            
            {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
                <div className="flex justify-start w-full mb-4">
                    <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700/50 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                        <Loader2 className="animate-spin text-primary-600" size={14} />
                        <span className="text-xs text-gray-500 animate-pulse">Digitando...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {showScrollBottom && (
          <button onClick={scrollToBottom} className="absolute bottom-20 right-4 p-2 bg-white dark:bg-dark-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-primary-600 z-10">
              <ChevronDown size={20} />
          </button>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-gray-800 p-2 md:p-4 pb-safe">
        {showMediaPopup && (
            <div className="absolute bottom-20 left-4 z-20 bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-64 animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">O que ouvir?</h3>
                    <button onClick={() => setShowMediaPopup(false)}><X size={14} /></button>
                </div>
                <input autoFocus value={mediaQuery} onChange={(e) => setMediaQuery(e.target.value)} placeholder="Música..." className="w-full p-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm mb-2 outline-none" onKeyDown={(e) => e.key === 'Enter' && triggerMedia('spotify')} />
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => triggerMedia('spotify')} className="py-1.5 bg-[#1DB954] text-white rounded text-xs">Spotify</button>
                    <button onClick={() => triggerMedia('youtube')} className="py-1.5 bg-[#FF0000] text-white rounded text-xs">YouTube</button>
                </div>
            </div>
        )}

        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-[1.5rem] border border-transparent focus-within:border-primary-500 transition-colors shadow-inner">
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-primary-600 rounded-full hover:bg-white dark:hover:bg-gray-700 shrink-0"><Plus size={20} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf,audio/*" onChange={handleFileUpload} />
            
            <button onClick={() => setShowMediaPopup(!showMediaPopup)} className="p-2.5 text-gray-400 hover:text-primary-600 rounded-full hover:bg-white dark:hover:bg-gray-700 shrink-0 hidden sm:block"><Headphones size={20} /></button>

            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={isRecording ? "Gravando..." : "Mensagem..."}
                className={`flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-24 min-h-[40px] py-2.5 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-sm ${isRecording ? 'animate-pulse text-red-500 font-bold' : ''}`}
                rows={1}
            />

            {attachment && (
                <div className="absolute bottom-14 left-2 bg-primary-100 dark:bg-primary-900/80 px-3 py-1 rounded-lg text-xs text-primary-700 dark:text-primary-300 flex items-center gap-2 shadow-sm backdrop-blur-md">
                    {attachment.type === 'audio' ? <Mic size={12} /> : <FileText size={12} />} Anexo <button onClick={() => setAttachment(undefined)} className="ml-1 hover:text-red-500 font-bold">x</button>
                </div>
            )}

            {isRecording ? (
                 <button onClick={stopRecording} className="p-2.5 bg-red-500 text-white rounded-full animate-pulse shadow-lg shrink-0"><StopCircle size={20} /></button>
            ) : (
                <button onClick={startRecording} className="p-2.5 text-gray-400 hover:text-primary-600 rounded-full hover:bg-white dark:hover:bg-gray-700 shrink-0"><Mic size={20} /></button>
            )}

            <button onClick={() => handleSendMessage()} disabled={(!inputText.trim() && !attachment) || isLoading} className="p-2.5 bg-primary-600 text-white rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shrink-0 shadow-lg"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default InterfaceDeBatePapo;
