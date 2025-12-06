
import React, { useState } from 'react';
import { generateToolContent } from '../services/geminiService';
import { PenTool, ShoppingBag, GraduationCap, Video, Send, Loader2, Copy, Check, Home, TrendingUp } from 'lucide-react';

const Ferramentas = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: 'real_estate', name: 'Imobiliário', icon: <Home />, desc: 'Scripts para qualificar leads e agendar visitas.' },
    { id: 'arbitrage', name: 'Arbitragem', icon: <TrendingUp />, desc: 'Análise de oportunidades de revenda.' },
    { id: 'copywriting', name: 'Copy Vendas', icon: <ShoppingBag />, desc: 'Textos persuasivos para vender mais.' },
    { id: 'video_script', name: 'Roteiro Viral', icon: <Video />, desc: 'Scripts para TikTok/Reels com alta retenção.' },
    { id: 'cold_mail', name: 'E-mail Frio', icon: <Send />, desc: 'Abordagem profissional para clientes.' },
    { id: 'social_post', name: 'Post Social', icon: <PenTool />, desc: 'Legendas para Instagram/LinkedIn.' },
    { id: 'study_plan', name: 'Plano Estudo', icon: <GraduationCap />, desc: 'Cronograma para provas e concursos.' },
  ];

  const handleGenerate = async () => {
      if (!input.trim() || !selectedTool) return;
      setLoading(true);
      const text = await generateToolContent(selectedTool, input);
      setResult(text);
      setLoading(false);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const getPlaceholder = () => {
      switch(selectedTool) {
          case 'real_estate': return "Ex: Apartamento 3 quartos, centro, cliente investidor...";
          case 'arbitrage': return "Ex: Eletrônicos usados, iPhones, Mercado Livre vs OLX...";
          case 'video_script': return "Ex: Dicas de IA para produtividade, tom humorado...";
          default: return `Descreva o objetivo para ${tools.find(t => t.id === selectedTool)?.name}...`;
      }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Ferramentas de Lucro & Produtividade</h1>
        <p className="text-gray-500 mb-8">Geradores automáticos de IA para escalar seus negócios.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => { setSelectedTool(tool.id); setResult(''); setInput(''); }}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all h-full justify-center ${
                        selectedTool === tool.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105' 
                        : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                    <div className={`p-2 rounded-full ${selectedTool === tool.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-blue-500'}`}>{tool.icon}</div>
                    <span className="text-xs font-bold leading-tight">{tool.name}</span>
                </button>
            ))}
        </div>

        {selectedTool && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
                    <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                        {tools.find(t => t.id === selectedTool)?.icon} 
                        Configurar {tools.find(t => t.id === selectedTool)?.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{tools.find(t => t.id === selectedTool)?.desc}</p>
                    
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={getPlaceholder()}
                        className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 resize-none outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !input}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : 'Gerar Resultado Agora'}
                    </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[400px] relative group flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resultado Gerado</span>
                        <div className="flex gap-2">
                             {result && (
                                <button 
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition">
                                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                             )}
                        </div>
                    </div>
                    
                    {result ? (
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm overflow-y-auto flex-1 custom-scrollbar">
                            {result}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm opacity-60">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <PenTool size={24} />
                            </div>
                            <p>Preencha os dados ao lado e clique em Gerar.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Ferramentas;
