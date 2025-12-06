
import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { analyzeFinancialData } from '../services/geminiService';
import { DollarSign, TrendingUp, TrendingDown, Plus, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, X } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

const Financeiro = () => {
  const { transactions, addTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newTrans, setNewTrans] = useState({ title: '', amount: '', type: 'expense', category: 'Alimentação' });
  
  // Estado para Análise IA
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Cálculos
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  // Dados para Gráfico
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

  const chartData = Object.keys(expensesByCategory).map(key => ({
      name: key,
      value: expensesByCategory[key]
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  const handleAdd = () => {
      if(!newTrans.title || !newTrans.amount) return;
      addTransaction({
          title: newTrans.title,
          amount: parseFloat(newTrans.amount),
          type: newTrans.type as any,
          category: newTrans.category as any,
          date: new Date().toISOString()
      });
      setShowModal(false);
      setNewTrans({ title: '', amount: '', type: 'expense', category: 'Alimentação' });
  };

  const handleAnalyze = async () => {
      setShowAnalysis(true);
      if (!analysisResult) {
          setAnalyzing(true);
          const result = await analyzeFinancialData(transactions);
          setAnalysisResult(result);
          setAnalyzing(false);
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <DollarSign className="text-green-600" size={32} /> Financeiro Pro
                </h1>
                <p className="text-gray-500">Controle inteligente e estratégico do seu dinheiro.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={handleAnalyze}
                    className="flex-1 md:flex-none bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
                    <Sparkles size={20} /> Análise IA
                </button>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex-1 md:flex-none bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/30 flex items-center justify-center gap-2">
                    <Plus size={20} /> Transação
                </button>
            </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Saldo Atual</p>
                        <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}`}>
                            R$ {balance.toFixed(2)}
                        </h3>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Receitas</p>
                        <h3 className="text-2xl font-bold text-green-600">R$ {income.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
                        <ArrowDownRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Despesas</p>
                        <h3 className="text-2xl font-bold text-red-600">R$ {expense.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Transações */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Histórico Recente</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {transactions.length === 0 && <p className="text-gray-500 text-center py-10">Nenhuma transação registrada.</p>}
                    {transactions.slice(0, 20).map(t => (
                        <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{t.title}</p>
                                    <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gráfico de Gastos */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Gastos por Categoria</h3>
                <div className="h-64">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Sem dados de despesas</div>
                    )}
                </div>
                <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {chartData.map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                            </div>
                            <span className="font-medium dark:text-white">R$ {entry.value.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Modal Adicionar */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Nova Transação</h2>
                    <div className="space-y-4">
                        <input 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                            placeholder="Descrição (Ex: Pizza)"
                            value={newTrans.title}
                            onChange={e => setNewTrans({...newTrans, title: e.target.value})}
                        />
                        <input 
                            type="number"
                            className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                            placeholder="Valor (Ex: 50.00)"
                            value={newTrans.amount}
                            onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
                        />
                        <div className="flex gap-4">
                            <select 
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                                value={newTrans.type}
                                onChange={e => setNewTrans({...newTrans, type: e.target.value})}
                            >
                                <option value="expense">Despesa</option>
                                <option value="income">Receita</option>
                            </select>
                            <select 
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                                value={newTrans.category}
                                onChange={e => setNewTrans({...newTrans, category: e.target.value})}
                            >
                                <option>Alimentação</option>
                                <option>Transporte</option>
                                <option>Moradia</option>
                                <option>Lazer</option>
                                <option>Saúde</option>
                                <option>Investimento</option>
                                <option>Salário</option>
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
                        <button onClick={handleAdd} className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Salvar</button>
                    </div>
                </div>
            </div>
        )}

        {/* Modal de Análise IA */}
        {showAnalysis && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAnalysis(false)}></div>
                <div className="relative bg-white dark:bg-dark-800 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col border border-indigo-500/30">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                        <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                            <Sparkles className="fill-indigo-500 text-indigo-500" /> Relatório Financeiro Inteligente
                        </h2>
                        <button onClick={() => setShowAnalysis(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="p-8 overflow-y-auto flex-1 text-gray-700 dark:text-gray-300">
                        {analyzing ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                <Loader2 size={40} className="animate-spin text-indigo-500" />
                                <p className="text-sm font-medium animate-pulse">Consultando o Agente Financeiro...</p>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{analysisResult}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Financeiro;
