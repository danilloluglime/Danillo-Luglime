import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, CheckSquare, Target, BookOpen, BrainCircuit, Moon, Sun, PieChart } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { theme, setTheme } = useApp();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chat', icon: MessageSquare, label: 'Chat IA' },
    { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
    { to: '/goals', icon: Target, label: 'Metas' },
    { to: '/plans', icon: BrainCircuit, label: 'Planos IA' },
    { to: '/journal', icon: BookOpen, label: 'Diário' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          U
        </div>
        <span className="text-xl font-bold hidden md:block text-primary-600 dark:text-primary-500 tracking-tight">
          UltraIA
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="hidden md:block font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="hidden md:block font-medium">
            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;