import React from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { CheckCircle2, Target, Calendar, TrendingUp, BrainCircuit } from 'lucide-react';

const Dashboard = () => {
  const { user, tasks, goals } = useApp();

  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  
  const tasksData = [
    { name: 'Concluídas', value: completedTasks, color: '#10b981' },
    { name: 'Pendentes', value: pendingTasks, color: '#f59e0b' },
  ];

  // Simulated activity data for the line chart
  const activityData = [
    { day: 'Seg', progress: 20 },
    { day: 'Ter', progress: 45 },
    { day: 'Qua', progress: 30 },
    { day: 'Qui', progress: 60 },
    { day: 'Sex', progress: 85 },
    { day: 'Sab', progress: 70 },
    { day: 'Dom', progress: 90 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Olá, {user.name} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">Aqui está o resumo da sua produtividade hoje.</p>
        </div>
        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tarefas Pendentes</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{pendingTasks}</h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-xl">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tarefas Concluídas</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{completedTasks}</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Metas Ativas</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{goals.filter(g => g.status === 'Em andamento').length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
              <Target size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Foco Semanal</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">85%</h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Distribuição de Tarefas</h3>
          <div className="h-64">
             {tasks.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={tasksData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {tasksData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Sem dados de tarefas</div>
             )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Evolução Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="progress" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <BrainCircuit size={24} className="text-yellow-300" />
          Insight do Dia
        </h3>
        <p className="opacity-90 leading-relaxed max-w-2xl">
          "Seu padrão de produtividade mostra que você realiza mais tarefas pela manhã. 
          Tente agendar suas atividades mais complexas antes das 11h para maximizar seus resultados hoje."
        </p>
      </div>
    </div>
  );
};

export default Dashboard;