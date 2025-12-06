
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexto/AppContext';
import { Award, Flame, Check, Plus, Calendar, Trophy, Star, X, Sparkles } from 'lucide-react';

const PRAISES = [
    "Você é imparável! 🚀",
    "Disciplina é liberdade. Parabéns! 🏆",
    "Mais um passo rumo à excelência. ⭐",
    "O sucesso é a soma de pequenos esforços. 💪",
    "Orgulho da sua dedicação! 🔥",
    "Continue assim, os resultados virão! 💎",
    "Sua constância é inspiradora! 🌟",
    "Foco total! Você está no controle. 🎯"
];

const Habitos = () => {
  const { habits, addHabit, toggleHabit } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', category: 'Saúde', frequency: 'Diário' });

  // Estados de Recompensa (Gamificação)
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState({ title: '', message: '', streak: 0 });

  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
      if(!newHabit.title) return;
      addHabit(newHabit as any);
      setShowModal(false);
      setNewHabit({ title: '', category: 'Saúde', frequency: 'Diário' });
  };

  const handleCheckHabit = (id: string, currentStreak: number, isCompleted: boolean) => {
      toggleHabit(id, today);

      if (!isCompleted) {
          // Se estava incompleto e agora completou, mostra recompensa
          const randomPraise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
          setRewardData({
              title: 'Hábito Concluído!',
              message: randomPraise,
              streak: currentStreak + 1 // Otimista para UI
          });
          setShowReward(true);
          
          // Fecha automaticamente após 5.5 segundos (tempo suficiente para curtir)
          // O usuário ainda pode fechar manualmente clicando fora ou no X
          setTimeout(() => setShowReward(false), 5500);
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 relative">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Award className="text-orange-500" size={32} /> Habits Genius
                </h1>
                <p className="text-gray-500">Construa a melhor versão de você, um dia de cada vez.</p>
            </div>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 flex items-center gap-2">
                <Plus size={20} /> Novo Hábito
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => {
                const isCompletedToday = habit.completedDates.includes(today);
                
                return (
                    <div key={habit.id} className={`p-6 rounded-2xl border transition-all relative overflow-hidden group hover:shadow-lg ${isCompletedToday ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`font-bold text-lg ${isCompletedToday ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{habit.title}</h3>
                                <p className={`text-xs ${isCompletedToday ? 'text-orange-100' : 'text-gray-500'}`}>{habit.category} • {habit.frequency}</p>
                            </div>
                            <div className={`flex items-center gap-1 font-bold ${isCompletedToday ? 'text-white' : 'text-orange-500'}`}>
                                <Flame size={20} fill={isCompletedToday ? 'white' : 'currentColor'} className={isCompletedToday ? "animate-pulse" : ""} />
                                <span>{habit.streak}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleCheckHabit(habit.id, habit.streak, isCompletedToday)}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                isCompletedToday 
                                ? 'bg-white text-orange-600 shadow-md' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-orange-100 hover:text-orange-600'
                            }`}>
                            {isCompletedToday ? <><Check size={20} /> Concluído!</> : 'Marcar Feito'}
                        </button>
                        
                        {/* Background Effect Decorativo */}
                        {isCompletedToday && (
                            <div className="absolute -bottom-10 -right-10 opacity-20 rotate-12 pointer-events-none">
                                <Trophy size={120} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        
        {/* Modal Novo Hábito */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Criar Novo Hábito</h2>
                    <div className="space-y-4">
                        <input 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                            placeholder="Nome do hábito (Ex: Meditar)"
                            value={newHabit.title}
                            onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                        />
                        <select 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                            value={newHabit.category}
                            onChange={e => setNewHabit({...newHabit, category: e.target.value})}
                        >
                            <option>Saúde</option>
                            <option>Mente</option>
                            <option>Trabalho</option>
                            <option>Lazer</option>
                        </select>
                        <select 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                            value={newHabit.frequency}
                            onChange={e => setNewHabit({...newHabit, frequency: e.target.value})}
                        >
                            <option>Diário</option>
                            <option>Semanal</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
                        <button onClick={handleAdd} className="px-5 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">Criar</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL DE RECOMPENSA (GAMIFICAÇÃO) --- */}
        {showReward && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                {/* Overlay transparente mas escurecido */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto" onClick={() => setShowReward(false)}></div>
                
                <div className="relative bg-white dark:bg-dark-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 animate-in zoom-in-90 spring-bounce duration-500 pointer-events-auto overflow-hidden">
                    
                    {/* Botão Fechar */}
                    <button onClick={() => setShowReward(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>

                    {/* Efeitos de Fundo (Confete simplificado CSS) */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[20%] w-3 h-3 bg-red-500 rounded-full animate-bounce delay-100"></div>
                        <div className="absolute top-[-10%] left-[50%] w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                        <div className="absolute top-[-10%] left-[80%] w-4 h-4 bg-green-500 rounded-full animate-bounce delay-75"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/10 to-transparent"></div>
                    </div>

                    {/* Conteúdo */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-yellow-200 dark:ring-yellow-900/50">
                            <Trophy size={48} className="text-yellow-500 drop-shadow-md animate-[bounce_1s_infinite]" />
                        </div>
                        
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 uppercase tracking-wide">
                            {rewardData.title}
                        </h2>
                        
                        <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full mb-4 border border-orange-200 dark:border-orange-800">
                            <Flame size={20} className="text-orange-500 fill-orange-500" />
                            <span className="font-bold text-orange-700 dark:text-orange-300">{rewardData.streak} dias seguidos!</span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">
                            "{rewardData.message}"
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <Star size={20} fill="currentColor" className="-mt-2" />
                            <Star size={16} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Habitos;
