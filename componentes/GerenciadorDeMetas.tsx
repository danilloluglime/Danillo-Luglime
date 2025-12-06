import React, { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import { Target, Plus } from 'lucide-react';

const GerenciadorDeMetas = () => {
  const { goals, addGoal, updateGoalProgress } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', deadline: '' });

  const handleAdd = () => {
      addGoal(newGoal);
      setShowModal(false);
      setNewGoal({ title: '', description: '', deadline: '' });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Metas de Longo Prazo</h1>
        <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
            <Plus size={20} /> Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                        <Target size={24} />
                    </div>
                    <span className="text-xs text-gray-400">Prazo: {goal.deadline}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{goal.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{goal.description}</p>
                
                <div className="mb-2 flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-blue-600"
                />
            </div>
        ))}
      </div>

       {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Criar Meta</h2>
                <input 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4"
                    placeholder="Título da meta"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                />
                <textarea 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 h-24 resize-none"
                    placeholder="Descrição"
                    value={newGoal.description}
                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                />
                <input 
                    type="date"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-6"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
                    <button onClick={handleAdd} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default GerenciadorDeMetas;