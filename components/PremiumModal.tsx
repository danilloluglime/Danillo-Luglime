
import React from 'react';
import { CheckCircle, X, Zap, Crown, Image as ImageIcon, Mic } from 'lucide-react';
import { useApp } from '../contexto/AppContext';

interface PremiumModalProps {
  onClose: () => void;
}

const PremiumModal = ({ onClose }: PremiumModalProps) => {
  const { upgradePlan } = useApp();

  const handleActivate = () => {
    // Aqui viria a integração real com StoreKit/GoogleBilling
    // Como é webapp, simulamos o upgrade.
    upgradePlan();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition text-gray-600 dark:text-gray-300">
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 animate-spin-slow"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg backdrop-blur-sm border border-white/20">
              <Crown className="text-white w-8 h-8" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">ULTRA IA PRO</h2>
            <p className="text-cyan-100 font-medium">Desbloqueie todo o potencial.</p>
          </div>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex items-center justify-center gap-2 mb-2">
             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide animate-pulse">
                7 Dias Grátis
             </span>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400"><Zap size={14} fill="currentColor" /></div>
              <span className="font-medium">Sem limites de mensagens</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400"><ImageIcon size={14} /></div>
              <span className="font-medium">Criação de Ferramentas e Imagens</span>
            </li>
            <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <CheckCircle size={18} className="text-green-500" />
              <span>Acesso antecipado a novos modelos</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Depois do trial: apenas <strong className="text-gray-900 dark:text-white">R$ 17,90/mês</strong>.<br/>
              Sem fidelidade. Cancele quando quiser.
            </p>
            
            <button 
              onClick={handleActivate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Iniciar Teste Grátis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
