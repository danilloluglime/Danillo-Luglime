
import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../contexto/AppContext';
import { Activity, Moon, Battery, Scale, Droplets, Smile, Frown, Meh, Check } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Saude360 = () => {
  const { healthMetrics, addHealthMetric, addJournalEntry } = useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Otimização: Memoizar o cálculo da última métrica para evitar re-ordenação a cada render
  const getLastMetricValue = useCallback((type: string) => {
      // Cria uma cópia rasa antes de ordenar para não mutar o array original
      const metrics = healthMetrics
        .filter(m => m.type === type)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return metrics.length > 0 ? metrics[0].value : null;
  }, [healthMetrics]);

  // Memoizar dados do gráfico para evitar re-renderização pesada do Recharts
  const weightData = useMemo(() => {
      return healthMetrics
        .filter(m => m.type === 'weight')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ordem cronológica
        .map(m => ({ date: new Date(m.date).toLocaleDateString(), value: m.value }));
  }, [healthMetrics]);

  const handleQuickAdd = (type: string, value: number, unit: string) => {
      addHealthMetric({ type: type as any, value, unit });
  };

  const handleWeightUpdate = () => {
      const current = getLastMetricValue('weight') || 70;
      const val = prompt("Novo peso (kg):", current.toString());
      if(val) {
          // Correção: Substituir vírgula por ponto para suportar formato brasileiro (ex: 75,5)
          const normalizedVal = val.replace(',', '.');
          const parsed = parseFloat(normalizedVal);
          
          if (!isNaN(parsed)) {
              handleQuickAdd('weight', parsed, 'kg');
          } else {
              alert("Por favor, insira um número válido.");
          }
      }
  };

  const handleMoodSelect = (moodId: string, moodLabel: string, journalMood: 'Feliz' | 'Neutro' | 'Triste') => {
      setSelectedMood(moodId);
      addJournalEntry({
          date: new Date().toISOString(),
          content: `Check-in Rápido de Saúde: Estou me sentindo ${moodLabel.toLowerCase()}.`,
          mood: journalMood
      });
  };

  const lastSleep = getLastMetricValue('sleep');
  const lastWeight = getLastMetricValue('weight');
  const lastWater = getLastMetricValue('water');
  const lastEnergy = getLastMetricValue('energy');

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Activity className="text-red-500" size={32} /> Saúde 360
            </h1>
            <p className="text-gray-500">Monitoramento completo do seu corpo e mente.</p>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-xs uppercase font-bold">Sono</span>
                    <Moon size={18} className="text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {lastSleep || '-'} <span className="text-sm font-normal text-gray-400">h</span>
                </div>
                <div className="mt-2 flex gap-1">
                    <button onClick={() => handleQuickAdd('sleep', 6, 'h')} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">6h</button>
                    <button onClick={() => handleQuickAdd('sleep', 7, 'h')} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">7h</button>
                    <button onClick={() => handleQuickAdd('sleep', 8, 'h')} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">8h</button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-xs uppercase font-bold">Peso</span>
                    <Scale size={18} className="text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {lastWeight || '-'} <span className="text-sm font-normal text-gray-400">kg</span>
                </div>
                <button onClick={handleWeightUpdate} className="mt-2 text-xs text-blue-500 hover:underline">Atualizar</button>
            </div>

            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-xs uppercase font-bold">Água</span>
                    <Droplets size={18} className="text-cyan-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {lastWater || 0} <span className="text-sm font-normal text-gray-400">ml</span>
                </div>
                <button onClick={() => handleQuickAdd('water', (lastWater || 0) + 250, 'ml')} className="mt-2 w-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 text-xs py-1 rounded-lg hover:bg-cyan-200 transition">
                    + 250ml
                </button>
            </div>

            <div className="bg-white dark:bg-dark-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-xs uppercase font-bold">Energia</span>
                    <Battery size={18} className="text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {lastEnergy || '-'} <span className="text-sm font-normal text-gray-400">%</span>
                </div>
                <input 
                    type="range" min="0" max="100" 
                    value={lastEnergy || 50} 
                    onChange={(e) => handleQuickAdd('energy', parseInt(e.target.value), '%')}
                    className="w-full mt-2 accent-green-500 h-1"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gráfico de Peso */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Histórico de Peso</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Check-in de Humor */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white">Como você se sente?</h3>
                    {selectedMood && <span className="text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Registrado</span>}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => handleMoodSelect('otimo', 'Ótimo e Produtivo', 'Feliz')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group active:scale-95
                        ${selectedMood === 'otimo' 
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-500 ring-1 ring-green-500' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                    >
                        <Smile className={`transition-transform group-hover:scale-110 ${selectedMood === 'otimo' ? 'text-green-600 fill-green-100' : 'text-green-500'}`} size={32} />
                        <span className={`font-medium ${selectedMood === 'otimo' ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                            Ótimo, produtivo!
                        </span>
                    </button>

                    <button 
                        onClick={() => handleMoodSelect('normal', 'Normal', 'Neutro')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group active:scale-95
                        ${selectedMood === 'normal' 
                            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 ring-1 ring-yellow-500' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                    >
                        <Meh className={`transition-transform group-hover:scale-110 ${selectedMood === 'normal' ? 'text-yellow-600 fill-yellow-100' : 'text-yellow-500'}`} size={32} />
                        <span className={`font-medium ${selectedMood === 'normal' ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'}`}>
                            Normal, ok.
                        </span>
                    </button>

                    <button 
                        onClick={() => handleMoodSelect('cansado', 'Cansado ou Estressado', 'Triste')}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all group active:scale-95
                        ${selectedMood === 'cansado' 
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-500 ring-1 ring-red-500' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                    >
                        <Frown className={`transition-transform group-hover:scale-110 ${selectedMood === 'cansado' ? 'text-red-600 fill-red-100' : 'text-red-500'}`} size={32} />
                        <span className={`font-medium ${selectedMood === 'cansado' ? 'text-red-800 dark:text-red-200' : 'text-gray-700 dark:text-gray-300'}`}>
                            Cansado / Estressado
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default React.memo(Saude360);
