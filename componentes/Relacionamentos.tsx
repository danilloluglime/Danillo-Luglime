
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { Heart, MessageCircle, Gift, Zap, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageToAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Relacionamentos = () => {
    const { user } = useApp();
    const [adviceQuery, setAdviceQuery] = useState('');
    const [adviceResult, setAdviceResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [loveTank, setLoveTank] = useState(75);

    const getAdvice = async () => {
        if(!adviceQuery.trim()) return;
        setLoading(true);
        // Simulação rápida usando o serviço existente (adaptado)
        try {
            const result = await sendMessageToAI(
                `Atue como um conselheiro amoroso sábio e empático. O usuário perguntou: "${adviceQuery}". Responda com um conselho prático, curto e acolhedor focado em fortalecer a relação.`,
                [], 
                {} 
            );
            setAdviceResult(result.text);
        } catch (error) {
            setAdviceResult("Não consegui processar o conselho agora. Tente novamente.");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <Heart className="text-pink-500 fill-pink-500" size={32} /> Espaço do Amor
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Cuide das suas conexões mais importantes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Love Tank */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-lg border border-pink-100 dark:border-pink-900/30">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" /> Tanque Emocional
                    </h3>
                    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden flex flex-col-reverse">
                        <div 
                            className="w-full bg-gradient-to-t from-pink-600 to-pink-400 transition-all duration-1000 flex items-center justify-center relative"
                            style={{ height: `${loveTank}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-white/20"></div>
                            <span className="text-white font-bold text-2xl drop-shadow-md">{loveTank}%</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between gap-2">
                        <button onClick={() => setLoveTank(Math.max(0, loveTank - 10))} className="px-3 py-1 text-sm bg-gray-100 hover:bg-red-100 text-gray-600 rounded-lg">- Conflito</button>
                        <button onClick={() => setLoveTank(Math.min(100, loveTank + 10))} className="px-3 py-1 text-sm bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-lg font-bold">+ Momento Bom</button>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">Como está a energia do casal hoje?</p>
                </div>

                {/* Desafio do Dia */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl shadow-lg text-white flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Gift size={20} className="text-yellow-300" /> Gesto do Dia
                        </h3>
                        <p className="text-white/90 leading-relaxed text-lg font-medium">
                            "Envie uma mensagem de áudio agora dizendo 3 coisas que você admira nele(a) e por quê."
                        </p>
                    </div>
                    <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-xl text-sm font-bold transition">
                        Marcar como Feito
                    </button>
                </div>
            </div>

            {/* Conselheiro IA */}
            <div className="mt-8 bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-500" /> Conselheiro IA
                </h3>
                <div className="flex gap-2 mb-4">
                    <input 
                        value={adviceQuery}
                        onChange={(e) => setAdviceQuery(e.target.value)}
                        placeholder="Ex: Como lidar com ciúmes? Como melhorar o diálogo?"
                        className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={getAdvice}
                        disabled={loading || !adviceQuery}
                        className="px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    </button>
                </div>
                
                {adviceResult && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-gray-700 dark:text-gray-200 leading-relaxed">
                        <ReactMarkdown>{adviceResult}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Relacionamentos;
