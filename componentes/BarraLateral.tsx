
import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, CheckSquare, Target, BookOpen, BrainCircuit, Moon, Sun, Settings, Database, Brain, DollarSign, Activity, Award, Heart, Zap, PenTool } from 'lucide-react';
import { useApp } from '../contexto/AppContext';

const BarraLateral = () => {
  const { theme, setTheme } = useApp();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Painel' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/ferramentas', icon: PenTool, label: 'Tools' },
    { to: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
    { to: '/plans', icon: BrainCircuit, label: 'Planos' },
    { to: '/financeiro', icon: DollarSign, label: 'Finanças' },
    { to: '/saude', icon: Activity, label: 'Saúde' },
    { to: '/habitos', icon: Award, label: 'Hábitos' },
    { to: '/memoria', icon: Brain, label: 'Memória' }, 
    { to: '/relacionamentos', icon: Heart, label: 'Amor' },
    { to: '/diario', icon: BookOpen, label: 'Diário' },
    { to: '/integracoes', icon: Database, label: 'Dados' },
    { to: '/config', icon: Settings, label: 'Config' },
  ];

  // Mobile Bottom Bar (Mostra apenas os essenciais para caber)
  const mobileNavItems = navItems.filter(item => 
    ['/', '/chat', '/tarefas', '/ferramentas', '/config'].includes(item.to)
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 lg:w-64 glass-panel flex-col transition-all z-50 border-r border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-4 shrink-0 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <div className="hidden lg:block">
            <span className="text-xl font-bold text-white tracking-tight block leading-none">UltraIA</span>
            <span className="text-[9px] text-cyan-400 font-bold tracking-[0.2em] uppercase opacity-80">System OS</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} className={`shrink-0 transition-transform duration-300 ${({isActive}: any) => isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="hidden lg:block font-medium truncate text-sm tracking-wide">{item.label}</span>
              {({ isActive }: { isActive: boolean }) => isActive && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_currentColor]"></div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors group"
          >
            {theme === 'light' ? <Moon size={20} className="group-hover:rotate-12 transition-transform" /> : <Sun size={20} className="group-hover:rotate-90 transition-transform" />}
            <span className="hidden lg:block font-medium text-sm">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM BAR (Visible only on Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#0f172a]/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <div className={`p-2 rounded-xl transition-all ${
                ({isActive}: any) => isActive ? 'bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : ''
            }`}>
                <item.icon size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default memo(BarraLateral);
