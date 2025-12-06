
import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../contexto/AppContext';
import { getDailyInsight, generateMorningBriefing, processSmartCommand } from '../services/geminiService';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { CheckCircle2, Target, Calendar, TrendingUp, Bell, RefreshCw, Zap, Mic, ArrowRight, Loader2, Coffee, Car, Compass, Activity, AlertOctagon, HeartPulse, X, Shield, Wind, Volume2, Sparkles, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const Painel = () => {
  const { user, userProfile, tasks = [], goals = [], notifications = [], habits = [], healthMetrics = [], transactions = [], addTask, addGoal, addNotification } = useApp();
  
  const [insightData, setInsightData] = useState<{ quote: string, analysis: string, direction: string, mindset: string } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const navigate = useNavigate();
  
  const [zenMode, setZenMode] = useState(false);
  const [smartCommand, setSmartCommand] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingContent, setBriefingContent] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // --- ZEN MODE STATE ---
  const [zenCycle, setZenCycle] = useState(0); 
  const [zenSeconds, setZenSeconds] = useState(4);
  const [zenActive, setZenActive] = useState(false);

  // Otimização: Cálculos derivados memoizados
  const completedTasks = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const pendingTasks = tasks.length - completedTasks;
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'Em andamento'), [goals]);
  const avgGoalProgress = useMemo(() => activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((acc, g) => acc + g.progress, 0) / activeGoals.length) 
    : 0, [activeGoals]);

  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read), [notifications]);

  // Recomendações Dinâmicas (Simuladas baseadas no estado)
  const recommendations = useMemo(() => {
      const recs = [];
      if (pendingTasks > 5) recs.push({ title: 'Organizar Tarefas', icon: <CheckCircle2 size={16} />, link: '/tarefas' });
      if (habits.length < 2) recs.push({ title: 'Criar Novo Hábito', icon: <Activity size={16} />, link: '/habitos' });
      recs.push({ title: 'Criar Post Social', icon: <Zap size={16} />, link: '/ferramentas' });
      return recs;
  }, [pendingTasks, habits]);

  // --- CÁLCULO LIFE GPS ---
  const lifeGPSData = useMemo(() => {
      const productivityScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 50;
      const lastSleep = healthMetrics.find(h => h.type === 'sleep')?.value || 6;
      const healthScore = Math.min((lastSleep / 8) * 100, 100);
      
      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      let financeScore = 50;
      if (income > 0) {
          financeScore = Math.min(((income - expense) / income) * 100 + 50, 100);
      }
      
      const avgStreak = habits.length > 0 ? habits.reduce((acc, h) => acc + h.streak, 0) / habits.length : 0;
      const disciplineScore = Math.min(avgStreak * 10, 100);

      return [
          { subject: 'Carreira', A: productivityScore, fullMark: 100 },
          { subject: 'Saúde', A: Math.round(healthScore), fullMark: 100 },
          { subject: 'Finanças', A: Math.round(financeScore), fullMark: 100 },
          { subject: 'Disciplina', A: Math.round(disciplineScore), fullMark: 100 },
          { subject: 'Mente', A: 85, fullMark: 100 },
          { subject: 'Social', A: 75, fullMark: 100 },
      ];
  }, [tasks, completedTasks, healthMetrics, transactions, habits]);

  const fetchInsight = async (forceRefresh = false) => {
      // Use existing cache logic in service or simple local check
      setLoadingInsight(true);
      try {
          const result = await getDailyInsight({
              userName: user.name,
              profession: userProfile.profession,
              focusArea: userProfile.focusArea,
              journalMood: "Normal",
              pendingTasksCount: pendingTasks,
              completedTasksCount: completedTasks
          });
          setInsightData(result);
      } catch (e) {
          console.error("Failed to fetch insight", e);
      } finally {
          setLoadingInsight(false);
      }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  // --- ZEN MODE LOGIC ---
  useEffect(() => {
      let interval: any;
      if (zenMode && zenActive) {
          interval = setInterval(() => {
              setZenSeconds(prev => {
                  if (prev > 1) return prev - 1;
                  setZenCycle(c => (c + 1) % 4);
                  return 4; // 4 seconds per phase (Box Breathing)
              });
          }, 1000);
      } else {
          setZenCycle(0);
          setZenSeconds(4);
      }
      return () => clearInterval(interval);
  }, [zenMode, zenActive]);

  const getZenConfig = () => {
      switch(zenCycle) {
          case 0: return { label: "INSPIRE", sub: "Encha os pulmões...", color: "text-cyan-400", scale: 1.5, ringColor: "border-cyan-500" };
          case 1: return { label: "SEGURE", sub: "Mantenha o ar...", color: "text-white", scale: 1.5, ringColor: "border-white" };
          case 2: return { label: "EXPIRE", sub: "Solte devagar...", color: "text-purple-400", scale: 1, ringColor: "border-purple-500" };
          case 3: return { label: "SEGURE", sub: "Mantenha vazio...", color: "text-gray-400", scale: 1, ringColor: "border-gray-500" };
          default: return { label: "PRONTO", sub: "", color: "text-white", scale: 1, ringColor: "border-white" };
      }
  };

  const handleExecuteCommand = async () => {
      if (!smartCommand.trim()) return;
      setProcessingCommand(true);
      try {
          const result = await processSmartCommand(smartCommand, new Date().toISOString().split('T')[0]);
          if (result.action === 'createTask') addTask(result.data);
          else if (result.action === 'createGoal') addGoal(result.data);
          addNotification({ title: 'Comando Processado', message: result.message, type: result.action === 'unknown' ? 'warning' : 'success' });
          setSmartCommand('');
      } catch (e) {
          addNotification({ title: 'Erro', message: 'Falha ao processar comando.', type: 'warning' });
      } finally {
          setProcessingCommand(false);
      }
  };

  const handleMorningBriefing = async () => {
      setShowBriefing(true);
      if (!briefingContent) {
          setLoadingBriefing(true);
          const result = await generateMorningBriefing(user.name, tasks, goals, userProfile);
          setBriefingContent(result);
          setLoadingBriefing(false);
      }
  };

  return (
    <>
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{user.name}</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide mt-1 flex items-center gap-2">
             <Shield size={12} className="text-green-500" /> ULTRA IA System Online
          </p>
        </div>
        
        <div className="glass px-2 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/10">
            <button onClick={() => navigate('/direcao')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                <Car size={16} /> Sentinela
            </button>
            <button onClick={handleMorningBriefing} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-orange-400 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                <Coffee size={16} /> Briefing
            </button>
            <button onClick={() => { setZenMode(true); setZenActive(false); }} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-teal-400 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                <HeartPulse size={16} /> Zen
            </button>
        </div>
      </div>

      {/* Recommendations Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 text-xs font-bold text-purple-200 whitespace-nowrap">
              <Sparkles size={12} /> Sugestões para hoje:
          </div>
          {recommendations.map((rec, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(rec.link)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/50 rounded-full text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap group">
                  {rec.icon}
                  {rec.title}
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
              </button>
          ))}
      </div>

      {/* Smart Command Bar */}
      <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="glass relative rounded-2xl p-2 flex items-center gap-3 border border-white/10">
              <div className="p-3 bg-white/5 rounded-xl text-cyan-400 border border-white/5">
                  <Zap size={20} className={processingCommand ? "animate-spin" : ""} fill={processingCommand ? "currentColor" : "none"} />
              </div>
              <input 
                  value={smartCommand}
                  onChange={(e) => setSmartCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  placeholder="Comando Ultra (ex: 'OBJETIVO: Criar funil de vendas')..."
                  className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-slate-500 font-medium"
                  disabled={processingCommand}
              />
              <button onClick={handleExecuteCommand} disabled={!smartCommand} className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition">
                  <ArrowRight size={20} />
              </button>
          </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LIFE GPS */}
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col min-h-[350px]">
               <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Compass size={120} /></div>
               <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 border border-cyan-500/30"><Compass size={20} /></div>
                   <h3 className="font-bold text-white text-lg tracking-wide">Life GPS</h3>
               </div>
               <div className="flex-1 w-full h-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                       <RadarChart cx="50%" cy="50%" outerRadius="70%" data={lifeGPSData}>
                           <PolarGrid stroke="rgba(255,255,255,0.1)" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar name="Performance" dataKey="A" stroke="#22d3ee" strokeWidth={3} fill="#22d3ee" fillOpacity={0.3} />
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                       </RadarChart>
                   </ResponsiveContainer>
               </div>
          </div>

          {/* ULTRA INSIGHT HUD */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col border border-white/5 bg-gradient-to-br from-slate-900/50 to-purple-900/10">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300 flex items-center gap-2">
                        <Activity size={16} className="text-purple-400 animate-pulse" /> Daily Insight OS
                    </h3>
                    <button onClick={() => fetchInsight(true)} className="text-slate-500 hover:text-white transition p-2"><RefreshCw size={16} className={loadingInsight ? "animate-spin" : ""} /></button>
                </div>

                {loadingInsight ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-purple-400 gap-4 min-h-[200px]">
                        <Loader2 className="animate-spin w-10 h-10" />
                        <span className="text-sm font-medium tracking-widest animate-pulse">ANALISANDO PADRÕES...</span>
                    </div>
                ) : insightData ? (
                    <div className="flex flex-col gap-8 relative z-10 flex-1 justify-center">
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                                Mindset: <span className="text-white">{insightData.mindset}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-blue-400 mb-3"><AlertOctagon size={16} /><span className="text-[10px] font-bold uppercase">Análise Tática</span></div>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">{insightData.analysis}</p>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 text-green-400 mb-3"><Target size={16} /><span className="text-[10px] font-bold uppercase">Diretriz Primária</span></div>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">{insightData.direction}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-slate-400 text-sm italic font-serif text-center">"{insightData.quote}"</p>
                        </div>
                    </div>
                ) : null}
          </div>
      </div>

      {/* Briefing Modal */}
      {showBriefing && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10 flex flex-col bg-[#0f172a] relative">
                 <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 backdrop-blur-xl z-10">
                     <h2 className="text-xl font-bold flex items-center gap-3 text-orange-400"><Coffee size={24} /> Briefing Matinal</h2>
                     <button onClick={() => setShowBriefing(false)} className="text-slate-400 hover:text-white p-2 rounded-full"><X size={20} /></button>
                 </div>
                 <div className="p-8 flex-1 text-sm text-slate-300 leading-relaxed">
                     {loadingBriefing ? (
                         <div className="flex flex-col items-center justify-center h-48 space-y-4"><Loader2 size={40} className="animate-spin text-orange-500" /><p className="text-orange-400 font-medium animate-pulse">Gerando estratégia...</p></div>
                     ) : <div className="prose prose-invert max-w-none"><ReactMarkdown>{briefingContent}</ReactMarkdown></div>}
                 </div>
             </div>
         </div>
      )}

      {/* Zen Mode Overlay */}
      {zenMode && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white p-6 animate-fade-in duration-1000 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-black opacity-80 pointer-events-none"></div>
              <button onClick={() => setZenMode(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition p-4 rounded-full z-50"><X size={32} /></button>
              
              {!zenActive ? (
                  <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
                      <Wind size={64} className="mx-auto text-teal-400 mb-6 animate-pulse" />
                      <h2 className="text-5xl font-extralight mb-4 tracking-[0.3em] text-white">ZEN MODE</h2>
                      <button onClick={() => setZenActive(true)} className="px-12 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-lg font-bold tracking-widest transition-all">INICIAR</button>
                  </div>
              ) : (
                  <div className="relative flex flex-col items-center justify-center w-full h-full">
                      <div className="relative w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] flex items-center justify-center aspect-square">
                          <div className={`absolute w-[60%] h-[60%] rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${getZenConfig().ringColor} opacity-20`} style={{ transform: `scale(${getZenConfig().scale})` }}></div>
                          <div className={`w-[40%] h-[40%] rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl`} style={{ transform: `scale(${getZenConfig().scale})` }}>
                               <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{zenSeconds}</span>
                          </div>
                      </div>
                      <div className="mt-8 sm:mt-12 text-center z-10 h-24 sm:h-32 shrink-0">
                          <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-widest transition-colors duration-1000 ${getZenConfig().color}`}>{getZenConfig().label}</h2>
                          <p className="text-lg sm:text-xl text-slate-400 mt-4 font-light tracking-wide animate-pulse">{getZenConfig().sub}</p>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
    </>
  );
};

export default Painel;
