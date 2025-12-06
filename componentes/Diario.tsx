import React, { useState, useRef } from 'react';
import { useApp } from '../contexto/AppContext';
import { analyzeSentiment } from '../services/geminiService';
import { BookHeart, Sparkles, Mic, StopCircle } from 'lucide-react';

const Diario = () => {
  const { journal, addJournalEntry } = useApp();
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  // Estados para Ditado
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSave = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    
    // Simples detecção de humor baseada em palavras-chave se a IA falhar, mas usamos IA
    let detectedMood: any = 'Neutro';
    const analysis = await analyzeSentiment(content);
    
    if (analysis.toLowerCase().includes('triste')) detectedMood = 'Triste';
    else if (analysis.toLowerCase().includes('feliz') || analysis.toLowerCase().includes('bom')) detectedMood = 'Feliz';
    else if (analysis.toLowerCase().includes('ansioso')) detectedMood = 'Ansioso';

    addJournalEntry({
        date: new Date().toISOString(),
        content: content,
        mood: detectedMood,
        aiAnalysis: analysis
    });

    setContent('');
    setAnalyzing(false);
  };

  const toggleListening = () => {
      if (isListening) {
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
          setIsListening(false);
      } else {
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
              recognitionRef.current = new SpeechRecognition();
              recognitionRef.current.continuous = true;
              recognitionRef.current.interimResults = true;
              recognitionRef.current.lang = 'pt-BR';

              recognitionRef.current.onstart = () => setIsListening(true);
              recognitionRef.current.onend = () => setIsListening(false);
              
              recognitionRef.current.onresult = (event: any) => {
                  let interimTranscript = '';
                  let finalTranscript = '';

                  for (let i = event.resultIndex; i < event.results.length; ++i) {
                      if (event.results[i].isFinal) {
                          finalTranscript += event.results[i][0].transcript;
                      } else {
                          interimTranscript += event.results[i][0].transcript;
                      }
                  }
                  
                  // Adiciona ao conteúdo existente
                  if (finalTranscript) {
                      setContent(prev => prev + (prev ? ' ' : '') + finalTranscript);
                  }
              };

              recognitionRef.current.start();
          } else {
              alert("Seu navegador não suporta reconhecimento de voz.");
          }
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
            <BookHeart className="text-pink-500" />
            Diário Emocional
        </h1>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg border border-pink-100 dark:border-pink-900/30 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
            
            <div className="relative">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={isListening ? "Ouvindo... Pode falar..." : "Como você está se sentindo hoje? Escreva ou grave um áudio..."}
                    className={`w-full h-40 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-none focus:ring-2 focus:ring-pink-300 resize-none text-gray-700 dark:text-gray-200 text-lg mb-4 placeholder:text-gray-400 transition-all ${isListening ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/10' : ''}`}
                />
                
                {/* Botão de Ditado Flutuante dentro da área */}
                <button 
                    onClick={toggleListening}
                    className={`absolute bottom-6 right-4 p-2 rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                    title="Ditar texto"
                >
                    {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                </button>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={analyzing || !content.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition shadow-lg shadow-pink-500/30 disabled:opacity-50"
                >
                    {analyzing ? <Sparkles className="animate-spin" /> : <Sparkles />}
                    {analyzing ? 'Analisando...' : 'Registrar e Analisar'}
                </button>
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Histórico</h2>
            {journal.map(entry => (
                <div key={entry.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                            ${entry.mood === 'Feliz' ? 'bg-green-100 text-green-700' : 
                              entry.mood === 'Triste' ? 'bg-blue-100 text-blue-700' :
                              entry.mood === 'Ansioso' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            {entry.mood}
                        </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{entry.content}</p>
                    {entry.aiAnalysis && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-indigo-800 dark:text-indigo-300 text-sm flex gap-3">
                            <Sparkles size={16} className="shrink-0 mt-1" />
                            <div>
                                <span className="font-bold block mb-1">Feedback da IA:</span>
                                {entry.aiAnalysis}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default Diario;