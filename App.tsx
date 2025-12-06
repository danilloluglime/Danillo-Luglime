
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexto/AppContext';
import BarraLateral from './componentes/BarraLateral';
import PremiumModal from './componentes/PremiumModal';
import Onboarding from './componentes/Onboarding';

// --- LAZY LOADING ---
const Painel = lazy(() => import('./componentes/Painel'));
const InterfaceDeBatePapo = lazy(() => import('./componentes/InterfaceDeBatePapo'));
const GerenciadorDeTarefas = lazy(() => import('./componentes/GerenciadorDeTarefas'));
const Diario = lazy(() => import('./componentes/Diario'));
const Configuracoes = lazy(() => import('./componentes/Configuracoes'));
const HubDeIntegracoes = lazy(() => import('./componentes/HubDeIntegracoes'));
const Memoria = lazy(() => import('./componentes/Memoria'));
const PlanosInteligentes = lazy(() => import('./componentes/PlanosInteligentes'));
const ModoDirecao = lazy(() => import('./componentes/ModoDirecao'));
const Financeiro = lazy(() => import('./componentes/Financeiro'));
const Saude360 = lazy(() => import('./componentes/Saude360'));
const Habitos = lazy(() => import('./componentes/Habitos'));
const Relacionamentos = lazy(() => import('./componentes/Relacionamentos'));
const Ferramentas = lazy(() => import('./componentes/Ferramentas')); 

const LoadingScreen = () => (
  <div className="flex h-full w-full items-center justify-center bg-transparent min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
        </div>
      </div>
      <span className="text-cyan-400/80 text-xs font-bold tracking-[0.2em] animate-pulse">CARREGANDO SISTEMA...</span>
    </div>
  </div>
);

const LayoutContent = () => {
  const location = useLocation();
  const { user, isOnboardingCompleted } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const fullScreenRoutes = ['/direcao'];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  useEffect(() => {
    // Paywall Check Logic (Ex: 24h antes do fim do trial)
    if (isOnboardingCompleted && user.plan === 'free') {
        const trialStart = new Date(user.trialStartDate || Date.now());
        const now = new Date();
        const daysPassed = (now.getTime() - trialStart.getTime()) / (1000 * 3600 * 24);
        
        // Show paywall if trial nearing end (e.g. > 6 days) AND user hasn't seen it this session
        if (daysPassed > 6 && !sessionStorage.getItem('hasSeenPaywall')) {
            const timer = setTimeout(() => {
                setShowPaywall(true);
                sessionStorage.setItem('hasSeenPaywall', 'true');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }
  }, [user.plan, user.trialStartDate, isOnboardingCompleted]);

  // Se não completou onboarding, mostra tela de boas-vindas
  if (!isOnboardingCompleted) {
      return <Onboarding />;
  }

  return (
    <div className="flex min-h-screen bg-ultra-bg text-slate-50 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob gpu-accelerated"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 gpu-accelerated"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {!isFullScreen && <BarraLateral />}

      {/* Main Content Area: Responsive Padding/Margins */}
      <main className={`flex-1 transition-all duration-300 relative z-10 
        ${isFullScreen ? 'p-0' : 'md:ml-20 lg:ml-64 p-4 pb-24 md:pb-4'} 
        overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Painel />} />
            <Route path="/chat" element={<InterfaceDeBatePapo />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/memoria" element={<Memoria />} />
            <Route path="/integracoes" element={<HubDeIntegracoes />} />
            <Route path="/tarefas" element={<GerenciadorDeTarefas />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/saude" element={<Saude360 />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/relacionamentos" element={<Relacionamentos />} />
            <Route path="/plans" element={<PlanosInteligentes />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/config" element={<Configuracoes />} />
            <Route path="/direcao" element={<ModoDirecao />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showPaywall && <PremiumModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <LayoutContent />
      </Router>
    </AppProvider>
  );
};

export default App;
