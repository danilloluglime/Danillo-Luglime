
import React from 'react';
import { CheckCircle, X, Zap, Crown, Image as ImageIcon, Mic, Brain, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexto/AppContext';

interface PremiumModalProps {
  onClose: () => void;
}

const PremiumModal = ({ onClose }: PremiumModalProps) => {
  const { upgradePlan } = useApp();

  const handleActivate = () => {
    // Simula a ativação do plano e fecha o modal
    upgradePlan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop com blur pesado */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>

      {/* Modal Card - Estilo Futurista Branco + Neon Azul */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.4)] animate-in zoom-in-95 duration-300 border-[3px] border-cyan-400">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-50 dark:bg-slate-800 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition text-gray-400 hover:text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 p-8 text-center relative overflow-hidden pb-2">
          {/* Efeito Neon Topo */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-pulse"></div>
          
          <div className="relative z-10 pt-4">
            <div className="mx-auto w-24 h-24 bg-cyan-50 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] border-2 border-cyan-100 dark:border-cyan-800 animate-bounce-slow">
              <Crown className="text-cyan-500 w-12 h-12" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
              Desbloqueie o<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Ultra IA</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm uppercase tracking-wider">Você no Controle Total</p>
          </div>
        </div>

        {/* Features List */}
        <div className="px-8 pb-8 space-y-4 bg-white dark:bg-slate-900">
          <div className="space-y-3">
            <FeatureItem icon={<Brain size={18} />} text="IA conversacional ilimitada" />
            <FeatureItem icon={<Mic size={18} />} text="Assistente por voz natural" />
            <FeatureItem icon={<ShieldCheck size={18} />} text="Psicólogo emocional IA" />
            <FeatureItem icon={<Zap size={18} />} text="Criador de rotinas & Insights" />
            <FeatureItem icon={<ImageIcon size={18} />} text="Memória contínua & Evolução" />
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            {/* Prova Social */}
            <div className="flex items-center justify-center gap-[-10px] mb-4">
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 ml-2 font-medium">Mais de 3.000 usuários ativos</p>
            </div>

            <button 
              onClick={handleActivate}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-xl shadow-xl shadow-cyan-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-3 ring-4 ring-cyan-500/10"
            >
              👉 Ativar 7 Dias Grátis
            </button>
            <p className="text-xs text-slate-400 font-medium">
              Depois apenas <strong className="text-slate-600 dark:text-slate-300">R$ 17/mês</strong>. Cancele quando quiser.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50/30 dark:hover:bg-slate-700/80">
        <div className="text-cyan-500 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm">{icon}</div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{text}</span>
        <CheckCircle size={18} className="ml-auto text-cyan-500" />
    </div>
);

export default PremiumModal;
