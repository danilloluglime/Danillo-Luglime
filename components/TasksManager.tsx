import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Calendar, Tag } from 'lucide-react';

const TasksManager = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: 'Pessoal', priority: 'Média', dueDate: '' });

  const handleAdd = () => {
    addTask({
        title: newTask.title,
        category: newTask.category as any,
        priority: newTask.priority as any,
        dueDate: newTask.dueDate
    });
    setShowModal(false);
    setNewTask({ title: '', category: 'Pessoal', priority: 'Média', dueDate: '' });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Minhas Tarefas</h1>
        <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/30">
            <Plus size={20} /> Nova Tarefa
        </button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 && <p className="text-gray-500 text-center py-10">Nenhuma tarefa pendente.</p>}
        {tasks.map((task) => (
          <div key={task.id} className={`group bg-white dark:bg-dark-800 p-5 rounded-2xl border ${task.completed ? 'border-green-200 dark:border-green-900/30 opacity-60' : 'border-gray-100 dark:border-gray-700'} shadow-sm flex items-center justify-between transition-all hover:shadow-md`}>
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'}`}>
                  {task.completed && <span className="text-white text-xs">✓</span>}
               </button>
               <div>
                  <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                     <span className="flex items-center gap-1"><Calendar size={14} /> {task.dueDate || 'Sem data'}</span>
                     <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"><Tag size={12} /> {task.category}</span>
                     <span className={`text-xs px-2 py-0.5 rounded ${task.priority === 'Alta' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{task.priority}</span>
                  </div>
               </div>
            </div>
            <button 
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Criar Tarefa</h2>
                <input 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4"
                    placeholder="Título da tarefa"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <select 
                        className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                        value={newTask.category}
                        onChange={e => setNewTask({...newTask, category: e.target.value})}
                    >
                        <option>Trabalho</option>
                        <option>Pessoal</option>
                        <option>Saúde</option>
                        <option>Estudo</option>
                    </select>
                    <select 
                        className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                        value={newTask.priority}
                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                        <option>Alta</option>
                        <option>Média</option>
                        <option>Baixa</option>
                    </select>
                </div>
                <input 
                    type="date"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-6"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
                    <button onClick={handleAdd} className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TasksManager;