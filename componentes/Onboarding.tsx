
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { ChevronRight, ShieldCheck, Zap, BrainCircuit, Mic, Sparkles } from 'lucide-react';

const Onboarding = () => {
  const { completeOnboarding, acceptTerms } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const slides = [
    {
      title: "Ultra IA – Seu novo cérebro digital",
      desc: "Organize sua vida, crie planos, resolva problemas e evolua todos os dias com IA.",
      icon: <BrainCircuit size={64} className="text-cyan-400" />
    },
    {
      title: "Seu assistente pessoal",
      desc: "Converse por texto ou voz, receba respostas instantâneas e recomendações profundas.",
      icon: <Mic size={64} className="text-blue-500" />
    },
    {
      title: "Inteligência emocional",
      desc: "O Ultra IA entende você, orienta, motiva e ajuda a lidar com emoções.",
      icon: <Sparkles size={64} className="text-purple-500" />
    },
    {
      title: "Teste grátis",
      desc: "Experimente tudo por 7 dias grátis.",
      icon: <ShieldCheck size={64} className="text-green-400" />
    }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!name.trim()) {
          alert("Por favor, digite seu nome.");
          return;
      }
      // Ordem importante: Aceita termos, salva nome, finaliza.
      acceptTerms();
      // Pequeno delay para animação/UX antes de desmontar o componente
      setTimeout(() => {
          completeOnboarding(name);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-between p-8 z-[100]">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Progress */}
      <div className="flex gap-2 mt-8 z-10">
        {slides.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'}`}></div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 key={step}">
        <div className="mb-8 p-6 bg-slate-800/50 rounded-full border border-white/5 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          {slides[step].icon}
        </div>
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">{slides[step].title}</h1>
        <p className="text-slate-400 text-lg leading-relaxed">{slides[step].desc}</p>

        {step === 3 && (
            <div className="w-full mt-8 space-y-4 text-left animate-in fade-in slide-in-from-bottom-4 delay-100">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Como devo te chamar?</label>
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none transition-colors"
                        autoFocus
                    />
                </div>
            </div>
        )}
      </div>

      {/* Button */}
      <button 
        onClick={handleNext}
        className="w-full max-w-md py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 z-10"
      >
        {step === 3 ? 'Ativar 7 dias grátis' : 'Continuar'} <ChevronRight />
      </button>
    </div>
  );
};

export default Onboarding;
