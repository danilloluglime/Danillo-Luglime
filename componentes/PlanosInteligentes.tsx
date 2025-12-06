import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { generatePlan } from '../services/geminiService';
import { BrainCircuit, Loader2, Save, Utensils, Home, Briefcase, Dumbbell, BookOpen, Heart, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const PlanosInteligentes = () => {
  const { user, addPlan, plans } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('Treino');
  const [generatedContent, setGeneratedContent] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Configurações dinâmicas baseadas no tipo selecionado
  const getContextPlaceholder = (type: string) => {
    switch (type) {
        case 'Plano Alimentar':
            return 'Ex: Sou vegetariano, tenho ovos e batata doce, quero perder peso...';
        case 'Limpeza Doméstica':
            return 'Ex: Moro em apartamento pequeno, tenho 30min por dia, sábado livre...';
        case 'Treino':
            return 'Ex: Quero focar em hipertrofia, 4x na semana, treino em casa...';
        case 'Estudos':
            return 'Ex: Tenho prova de inglês em 1 mês, posso estudar 1h por dia...';
        case 'Financeiro':
            return 'Ex: Ganho 3000, gasto 1200 aluguel, 500 mercado. Quero investir...';
        default:
            return 'Ex: Detalhes específicos sobre seu objetivo...';
    }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'Plano Alimentar': return <Utensils className="text-orange-500" />;
          case 'Limpeza Doméstica': return <Home className="text-teal-500" />;
          case 'Treino': return <Dumbbell className="text-red-500" />;
          case 'Estudos': return <BookOpen className="text-blue-500" />;
          case 'Espiritual': return <Heart className="text-pink-500" />;
          case 'Financeiro': return <DollarSign className="text-green-500" />;
          default: return <Briefcase className="text-purple-500" />;
      }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const context = `Nome: ${user.name}. Tipo de Plano: ${selectedType}. Notas do usuário: ${additionalContext}`;
    
    // Pequeno ajuste no prompt via contexto para tipos específicos
    let specificPrompt = "";
    if (selectedType === 'Plano Alimentar') {
        specificPrompt = "Gere um cardápio semanal prático ou receitas baseadas nos ingredientes.";
    } else if (selectedType === 'Limpeza Doméstica') {
        specificPrompt = "Gere um cronograma de limpeza realista dividido por dias da semana.";
    } else if (selectedType === 'Financeiro') {
        specificPrompt = "Gere uma tabela de orçamento, categorize os gastos e dê 3 dicas práticas de economia. Use Markdown Tables.";
    }

    const result = await generatePlan(selectedType, `${context}. ${specificPrompt}`);
    setGeneratedContent(result);
    setLoading(false);
  };

  const handleSave = () => {
    if (!generatedContent) return;
    addPlan({
        title: `Plano de ${selectedType} - ${new Date().toLocaleDateString()}`,
        type: selectedType as any,
        content: generatedContent
    });
    setGeneratedContent('');
    alert("Plano salvo com sucesso!");
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Planos Inteligentes</h1>
        <p className="text-gray-500 mb-8">Deixe a IA estruturar sua rotina, dieta, finanças ou casa.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Gerador */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
                        <BrainCircuit className="text-primary-500" />
                        Gerador
                    </h3>
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Plano</label>
                    <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mb-4 outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option>Treino</option>
                        <option>Plano Alimentar</option>
                        <option>Limpeza Doméstica</option>
                        <option>Financeiro</option>
                        <option>Estudos</option>
                        <option>Produtividade</option>
                        <option>Espiritual</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contexto Extra</label>
                    <textarea 
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        placeholder={getContextPlaceholder(selectedType)}
                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mb-4 h-32 resize-none outline-none focus:ring-2 focus:ring-primary-500"
                    />

                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Gerar Plano com IA'}
                    </button>
                </div>

                {/* Lista de Planos Salvos */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Planos Salvos</h3>
                    <div className="space-y-3">
                        {plans.length === 0 && <p className="text-sm text-gray-500">Nenhum plano salvo.</p>}
                        {plans.map(p => (
                            <div key={p.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3" onClick={() => setGeneratedContent(p.content)}>
                                <div className="p-2 bg-white dark:bg-dark-800 rounded-md shadow-sm">
                                    {getIcon(p.type)}
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.title}</div>
                                    <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coluna de Exibição de Conteúdo */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
                    {generatedContent ? (
                        <>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-primary-600">Resultado do Plano</h2>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{generatedContent}</ReactMarkdown>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <BrainCircuit size={64} className="mb-4" />
                            <p className="text-lg">O plano gerado aparecerá aqui.</p>
                            <p className="text-sm mt-2">Escolha um tipo ao lado e clique em Gerar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default PlanosInteligentes;