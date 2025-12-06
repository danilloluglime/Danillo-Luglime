
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexto/AppContext';
import { generateTaskSuggestions } from '../services/geminiService';
import { Plus, Trash2, Calendar, Tag, Sparkles, Loader2, Play, Pause, X, CheckCircle2, Timer, Target, MoreHorizontal, Filter, ArrowUpRight } from 'lucide-react';
import { Goal } from '../types';

const GerenciadorDeTarefas = () => {
  const { tasks, addTask, toggleTask, deleteTask, goals, addGoal, updateGoalProgress } = useApp();
  
  // Estados de Modais
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Estados de Formulários
  const [newTask, setNewTask] = useState({ title: '', category: 'Pessoal', priority: 'Média', dueDate: '', linkedGoalId: '' });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });

  // Estado de Filtro e IA
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Estados do Modo Foco
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Handlers de Tarefas ---
  const handleAddTask = () => {
    addTask({
        title: newTask.title,
        category: newTask.category as any,
        priority: newTask.priority as any,
        dueDate: newTask.dueDate,
        linkedGoalId: newTask.linkedGoalId || undefined
    });
    setShowTaskModal(false);
    setNewTask({ title: '', category: 'Pessoal', priority: 'Média', dueDate: '', linkedGoalId: '' });
  };

  const handleGetSuggestions = async () => {
      setShowSuggestions(true);
      setLoadingSuggestions(true);
      
      // Filtra metas para o contexto da IA se uma estiver selecionada
      const contextGoals = selectedGoalId ? goals.filter(g => g.id === selectedGoalId) : goals;
      
      const results = await generateTaskSuggestions(contextGoals);
      setSuggestions(results);
      setLoadingSuggestions(false);
  };

  const handleAddSuggestion = (suggestion: any) => {
      addTask({
          title: suggestion.title,
          category: suggestion.category,
          priority: suggestion.priority,
          dueDate: new Date().toISOString().split('T')[0],
          linkedGoalId: selectedGoalId || undefined
      });
      setSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  // --- Handlers de Metas ---
  const handleAddGoal = () => {
      addGoal(newGoal);
      setShowGoalModal(false);
      setNewGoal({ title: '', description: '', deadline: '' });
  };

  // --- Lógica do Timer (Modo Foco) ---
  useEffect(() => {
      if (isTimerRunning && timerSeconds > 0) {
          timerRef.current = setInterval(() => {
              setTimerSeconds(prev => prev - 1);
          }, 1000);
      } else if (timerSeconds === 0) {
          setIsTimerRunning(false);
          alert("Tempo esgotado! Faça uma pausa curta.");
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timerSeconds]);

  const startFocus = (taskId: string) => {
      setActiveTask(taskId);
      setTimerSeconds(25 * 60);
      setIsTimerRunning(true);
  };

  const stopFocus = () => {
      setActiveTask(null);
      setIsTimerRunning(false);
      setTimerSeconds(25 * 60);
  };

  const completeTaskFromFocus = () => {
      if (activeTask) {
          toggleTask(activeTask);
          stopFocus();
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Filtragem ---
  const displayedTasks = selectedGoalId 
    ? tasks.filter(t => t.linkedGoalId === selectedGoalId)
    : tasks;

  const currentGoal = goals.find(g => g.id === selectedGoalId);
  const currentFocusTask = tasks.find(t => t.id === activeTask);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- SEÇÃO DE ESTRATÉGIA (METAS) --- */}
      <div>
        <div className="flex justify-between items-end mb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Target className="text-primary-600" /> Hub de Produtividade
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie sua estratégia (Metas) e sua execução (Tarefas) em um só lugar.</p>
            </div>
            <button 
                onClick={() => setShowGoalModal(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg transition">
                + Nova Meta
            </button>
        </div>

        {/* Carrossel de Metas */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Card "Todas as Tarefas" */}
            <div 
                onClick={() => setSelectedGoalId(null)}
                className={`min-w-[200px] md:min-w-[240px] p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]
                ${selectedGoalId === null 
                    ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900 shadow-lg' 
                    : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}
            >
                <div className="flex justify-between items-start mb-6">
                    <CheckCircle2 size={24} />
                    <span className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Todas as Tarefas</h3>
                <p className="text-xs opacity-80">Visão Geral</p>
            </div>

            {/* Cards de Metas Dinâmicos */}
            {goals.map(goal => (
                <div 
                    key={goal.id}
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`min-w-[260px] md:min-w-[300px] p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] relative group
                    ${selectedGoalId === goal.id 
                        ? 'bg-gradient-to-br from-primary-600 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/30' 
                        : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'}`}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
                             ${selectedGoalId === goal.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {goal.status}
                        </span>
                        <div className="text-xs opacity-70 flex items-center gap-1">
                           <Calendar size={12} /> {goal.deadline}
                        </div>
                    </div>
                    
                    <h3 className={`font-bold text-lg mb-1 truncate ${selectedGoalId === goal.id ? 'text-white' : 'text-gray-800 dark:text-white'}`}>{goal.title}</h3>
                    <p className={`text-xs mb-4 line-clamp-2 ${selectedGoalId === goal.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {goal.description}
                    </p>

                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold">{goal.progress}%</span>
                    </div>

                    {/* Slider de Progresso Manual (Só aparece se selecionado ou hover) */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <input 
                            type="range" min="0" max="100" 
                            value={goal.progress}
                            onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                            className="w-full accent-green-400 h-1"
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- SEÇÃO DE EXECUÇÃO (TAREFAS) --- */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sticky top-0 bg-gray-50 dark:bg-dark-900 py-4 z-10 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {selectedGoalId ? (
                    <>
                        <ArrowUpRight className="text-primary-500" />
                        Foco na Meta: <span className="text-primary-600">{currentGoal?.title}</span>
                    </>
                ) : (
                    <>
                        <Filter className="text-gray-400" size={20} /> Todas as Tarefas
                    </>
                )}
            </h2>
            
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={handleGetSuggestions}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition shadow-lg shadow-purple-600/20 text-sm font-medium">
                    <Sparkles size={16} /> {selectedGoalId ? 'IA: Sugerir Passos' : 'IA: Sugestões'}
                </button>
                <button 
                    onClick={() => setShowTaskModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/30 text-sm font-medium">
                    <Plus size={18} /> Nova Tarefa
                </button>
            </div>
        </div>

        {/* Sugestões IA */}
        {showSuggestions && (
            <div className="mb-6 p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                        <Sparkles size={20} /> {selectedGoalId ? `Passos para "${currentGoal?.title}"` : 'Sugestões Gerais'}
                    </h3>
                    <button onClick={() => setShowSuggestions(false)} className="text-sm text-purple-600 hover:underline">Fechar</button>
                </div>
                
                {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-8 text-purple-500">
                        <Loader2 className="animate-spin mr-2" /> Analisando contexto...
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-800 p-4 rounded-xl flex flex-col justify-between shadow-sm border border-purple-100 dark:border-purple-900/30 h-full">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">{s.title}</p>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{s.category}</span>
                                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">{s.priority}</span>
                                    </div>
                                </div>
                                <button 
                                  onClick={() => handleAddSuggestion(s)}
                                  className="mt-3 w-full py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition text-xs font-bold flex items-center justify-center gap-1">
                                  <Plus size={14} /> Adicionar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Lista de Tarefas */}
        <div className="space-y-3">
            {displayedTasks.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                    <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Nenhuma tarefa encontrada.</p>
                    <p className="text-sm text-gray-400">
                        {selectedGoalId ? 'Adicione passos para alcançar esta meta.' : 'Crie uma tarefa para começar seu dia.'}
                    </p>
                </div>
            )}
            
            {displayedTasks.map((task) => {
                // Encontrar meta vinculada se existir
                const linkedGoal = goals.find(g => g.id === task.linkedGoalId);
                
                return (
                    <div key={task.id} className={`group bg-white dark:bg-dark-800 p-4 rounded-2xl border transition-all hover:shadow-md flex items-center justify-between
                        ${task.completed ? 'border-green-100 dark:border-green-900/20 bg-green-50/50 dark:bg-green-900/5' : 'border-gray-100 dark:border-gray-700'}
                    `}>
                        <div className="flex items-center gap-4 flex-1">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}`}>
                                {task.completed && <span className="text-white text-xs">✓</span>}
                            </button>
                            
                            <div className="min-w-0">
                                <h3 className={`font-semibold text-base truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {task.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {linkedGoal && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                                            <Target size={10} /> {linkedGoal.title}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} /> {task.dueDate || 'Hoje'}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${task.priority === 'Alta' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!task.completed && (
                                <button 
                                    onClick={() => startFocus(task.id)}
                                    className="p-2 text-primary-600 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition"
                                    title="Modo Foco">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            )}
                            <button 
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- MODAIS --- */}

      {/* Modal Nova Tarefa */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                    <Plus className="text-primary-500" /> Nova Tarefa
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">O que fazer?</label>
                        <input 
                            autoFocus
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="Ex: Ler relatório anual"
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Categoria</label>
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                value={newTask.category}
                                onChange={e => setNewTask({...newTask, category: e.target.value})}
                            >
                                <option>Trabalho</option>
                                <option>Pessoal</option>
                                <option>Saúde</option>
                                <option>Estudo</option>
                                <option>Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Prioridade</label>
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                value={newTask.priority}
                                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                            >
                                <option>Alta</option>
                                <option>Média</option>
                                <option>Baixa</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Vincular a Meta (Opcional)</label>
                        <select 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                            value={newTask.linkedGoalId}
                            onChange={e => setNewTask({...newTask, linkedGoalId: e.target.value})}
                        >
                            <option value="">Sem vínculo</option>
                            {goals.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Data</label>
                        <input 
                            type="date"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                            value={newTask.dueDate}
                            onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button onClick={() => setShowTaskModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancelar</button>
                    <button 
                        onClick={handleAddTask} 
                        disabled={!newTask.title}
                        className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition disabled:opacity-50">
                        Criar Tarefa
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal Nova Meta */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                    <Target className="text-blue-500" /> Nova Meta
                </h2>
                
                <div className="space-y-4">
                    <input 
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Título da meta (Ex: Correr Maratona)"
                        value={newGoal.title}
                        onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    />
                    <textarea 
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl h-24 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descrição detalhada..."
                        value={newGoal.description}
                        onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    />
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Prazo Final</label>
                        <input 
                            type="date"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                            value={newGoal.deadline}
                            onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button onClick={() => setShowGoalModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">Cancelar</button>
                    <button 
                        onClick={handleAddGoal} 
                        disabled={!newGoal.title}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                        Definir Meta
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Overlay do Modo Foco */}
      {activeTask && (
        <div className="fixed inset-0 bg-dark-900/95 z-[60] flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-300">
            <button 
                onClick={stopFocus} 
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
                <X size={32} />
            </button>
            
            <div className="text-center space-y-8 max-w-lg w-full">
                <div>
                    <div className="flex items-center justify-center gap-2 text-primary-400 mb-2 uppercase tracking-widest text-sm font-bold">
                        <Timer size={16} /> Modo Foco
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">{currentFocusTask?.title}</h2>
                    <p className="text-gray-400 mt-2">{currentFocusTask?.category}</p>
                </div>

                <div className="text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    {formatTime(timerSeconds)}
                </div>

                <div className="flex items-center justify-center gap-6">
                    <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="w-20 h-20 rounded-full bg-white text-dark-900 flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg shadow-white/10">
                        {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                <button 
                    onClick={completeTaskFromFocus}
                    className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full border border-green-500/50 text-green-400 hover:bg-green-500/10 transition mt-8">
                    <CheckCircle2 size={20} />
                    Concluir Tarefa e Encerrar
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default GerenciadorDeTarefas;
