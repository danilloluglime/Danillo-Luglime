import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeSentiment } from '../services/geminiService';
import { BookHeart, Sparkles } from 'lucide-react';

const Journal = () => {
  const { journal, addJournalEntry } = useApp();
  const [content, setContent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    
    // Simple mock mood detection based on keywords if AI fails, but we use AI
    let detectedMood: any = 'Neutro';
    const analysis = await analyzeSentiment(content);
    
    // Very naive mood extraction from analysis text just for demo state
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

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
            <BookHeart className="text-pink-500" />
            Diário Emocional
        </h1>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-lg border border-pink-100 dark:border-pink-900/30 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Como você está se sentindo hoje? Escreva livremente..."
                className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-none focus:ring-2 focus:ring-pink-300 resize-none text-gray-700 dark:text-gray-200 text-lg mb-4 placeholder:text-gray-400"
            />
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

export default Journal;