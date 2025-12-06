
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { User, Briefcase, Clock, Save, Bot, CheckCircle, Star, Shield, FileText, Lock, ChevronDown, ChevronUp, ShoppingBag, Target } from 'lucide-react';

const Configuracoes = () => {
  const { userProfile, updateUserProfile, user, upgradePlan } = useApp();
  
  const [formData, setFormData] = useState(userProfile);
  const [saved, setSaved] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setSaved(false);
  };

  const handleSave = () => {
      updateUserProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Configuração & Plano</h1>
            <p className="text-gray-500">Personalize sua IA e gerencie sua assinatura.</p>
        </div>

        {/* ÁREA DE PLANOS */}
        <div className="mb-12 bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {user.plan === 'pro' ? <Star className="text-yellow-500 fill-yellow-500" /> : <Star className="text-gray-400" />}
                        Status: <span className="text-cyan-600 uppercase">{user.plan === 'pro' ? 'Premium Ativo' : 'Básico'}</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                        {user.plan === 'pro' 
                            ? 'Você tem acesso ilimitado a todos os recursos de IA.' 
                            : 'Você está no plano gratuito. Ative o Premium para liberar todo o potencial.'}
                    </p>
                </div>

                {user.plan === 'free' ? (
                    <button 
                        onClick={() => upgradePlan()}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105">
                        Ativar 7 Dias Grátis
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-bold border border-green-200 dark:border-green-800">
                        <CheckCircle size={20} /> Assinatura Ativa
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card de Identidade */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-cyan-600">
                    <User size={24} /> Quem é você?
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissão / Cargo</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-cyan-500">
                            <Briefcase size={18} className="text-gray-400" />
                            <input 
                                value={formData.profession}
                                onChange={(e) => handleChange('profession', e.target.value)}
                                className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-gray-200"
                                placeholder="Ex: Advogado, Designer, CEO..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área de Foco Atual</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-cyan-500">
                            <Target size={18} className="text-gray-400" />
                            <input 
                                value={formData.focusArea}
                                onChange={(e) => handleChange('focusArea', e.target.value)}
                                className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-gray-200"
                                placeholder="Ex: Aumentar vendas, Organizar tempo..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário de Trabalho</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-cyan-500">
                            <Clock size={18} className="text-gray-400" />
                            <input 
                                value={formData.dailyWorkHours}
                                onChange={(e) => handleChange('dailyWorkHours', e.target.value)}
                                className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-gray-200"
                                placeholder="Ex: 09:00 - 18:00"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card da Personalidade e Vendas */}
            <div className="space-y-8">
                {/* Personalidade */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-600">
                        <Bot size={24} /> Como a IA deve agir?
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da sua Assistente</label>
                            <input 
                                value={formData.aiName}
                                onChange={(e) => handleChange('aiName', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 ring-purple-500 outline-none"
                                placeholder="Ex: Jarvis, Sexta-feira, Ana..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estilo de Comunicação</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Direto e Curto', 'Detalhado e Explicativo', 'Motivacional', 'Formal'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => handleChange('communicationStyle', style)}
                                        className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                                            formData.communicationStyle === style 
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm' 
                                            : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {style}
                                        {formData.communicationStyle === style && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configurações de Vendas (Bot Vendedor) */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-600">
                        <ShoppingBag size={24} /> Configuração de Vendas
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">Esses dados treinam o modo "Bot Vendedor" do chat.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produto / Serviço Principal</label>
                            <input 
                                value={formData.salesProduct || ''}
                                onChange={(e) => handleChange('salesProduct', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 ring-green-500 outline-none"
                                placeholder="Ex: Mentoria de Carreira, Ebook de Receitas..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Oferta Principal (O que o cliente ganha)</label>
                            <input 
                                value={formData.salesOffer || ''}
                                onChange={(e) => handleChange('salesOffer', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 ring-green-500 outline-none"
                                placeholder="Ex: 4 encontros + suporte WhatsApp por R$997"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Público Alvo</label>
                            <input 
                                value={formData.targetAudience || ''}
                                onChange={(e) => handleChange('targetAudience', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 ring-green-500 outline-none"
                                placeholder="Ex: Jovens recém-formados..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg transform hover:-translate-y-1 ${saved ? 'bg-green-500 shadow-green-500/30' : 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-blue-500/30'}`}
            >
                {saved ? <CheckIcon /> : <Save />}
                {saved ? 'Perfil Atualizado!' : 'Salvar Preferências'}
            </button>
        </div>

        {/* --- RODAPÉ JURÍDICO & PRIVACIDADE --- */}
        <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-10 pb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Shield size={14} /> Legal & Compliance
            </h3>
            
            <div className="space-y-4">
                {/* Política de Privacidade Toggle */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setShowPrivacy(!showPrivacy)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                    >
                        <strong className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Lock size={16} /> Política de Privacidade</strong>
                        {showPrivacy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showPrivacy && (
                        <div className="p-4 bg-white dark:bg-dark-800 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-gray-700">
                            <p className="mb-2"><strong>Política de Privacidade – Ultra IA</strong></p>
                            <p className="mb-2">O Ultra IA respeita sua privacidade. Coletamos apenas informações essenciais para funcionamento do app: dados de cadastro, interações com a IA e configurações pessoais.</p>
                            <p className="mb-2">Nunca vendemos, trocamos ou compartilhamos seus dados com terceiros. Todos os dados são criptografados e armazenados de forma segura.</p>
                            <p className="mb-2">O usuário pode solicitar exclusão total dos dados a qualquer momento. O Ultra IA pode usar informações anonimizadas para melhorar o serviço.</p>
                            <p>Ao usar o app, você concorda com esta política.</p>
                        </div>
                    )}
                </div>

                {/* Termos de Uso Toggle */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setShowTerms(!showTerms)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                    >
                        <strong className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><FileText size={16} /> Termos de Uso</strong>
                        {showTerms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showTerms && (
                        <div className="p-4 bg-white dark:bg-dark-800 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-gray-700">
                            <p className="mb-2"><strong>Termos de Uso – Ultra IA</strong></p>
                            <p className="mb-2">Ao utilizar o Ultra IA, você concorda em:</p>
                            <ul className="list-disc pl-4 mb-2 space-y-1">
                                <li>Não utilizar o app para atividades ilegais;</li>
                                <li>Não tentar manipular ou burlar o sistema;</li>
                                <li>Respeitar a assinatura mensal e cobranças;</li>
                                <li>Compreender que as respostas da IA são sugestões e não substituem profissionais especializados;</li>
                                <li>Permitir o uso anônimo de dados para melhoria do sistema.</li>
                            </ul>
                            <p>O Ultra IA pode atualizar funcionalidades sem aviso prévio. Cancelamento pode ser feito a qualquer momento pela loja do dispositivo.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-10 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
                <p className="text-[10px] text-gray-400">
                    © {new Date().getFullYear()} Ultra IA Tecnologia. Todos os direitos reservados.
                </p>
            </div>
        </div>
    </div>
  );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default Configuracoes;
