
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AppState, Task, Goal, JournalEntry, Plan, ChatMessage, Report, Notification, UserProfile, Integration, Memory, SmartDevice, SmartHub, Transaction, Habit, HealthMetric } from '../types';

// --- PROTEÇÃO CONTRA CÓPIA E CLONAGEM ---
const APP_SIGNATURE = "ULTRA_IA_SECURE_BUILD_V4.2_SALES_ENGINE";

interface AppContextType extends AppState {
  setTheme: (theme: 'light' | 'dark') => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  upgradePlan: () => void;
  completeOnboarding: (name: string) => void;
  acceptTerms: () => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'status'>) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => void;
  addReport: (report: Omit<Report, 'id'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  markNotificationAsRead: (id: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastChatMessage: (text: string) => void;
  clearChat: () => void;
  updateIntegration: (integration: Integration) => void;
  addMemory: (memory: Omit<Memory, 'id'>) => void;
  updateSmartDevice: (id: string, updates: Partial<SmartDevice> | Partial<SmartDevice['settings']>) => void;
  addSmartDevice: (device: Omit<SmartDevice, 'id' | 'status' | 'settings'>) => void;
  toggleSmartHub: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleHabit: (id: string, date: string) => void;
  addHealthMetric: (metric: Omit<HealthMetric, 'id' | 'date'>) => void;
}

const defaultState: AppState = {
  user: { 
      name: 'Usuário', 
      email: 'usuario@ultraia.com', 
      plan: 'free',
      trialStartDate: new Date().toISOString(),
      hasConsentedToTerms: false
  },
  userProfile: {
    profession: 'Geral',
    focusArea: 'Produtividade',
    communicationStyle: 'Motivacional',
    aiName: 'UltraIA',
    dailyWorkHours: '09:00 - 18:00',
    salesProduct: 'Mentoria Premium',
    salesOffer: 'Consultoria Estratégica de 30 dias',
    targetAudience: 'Empreendedores Digitais'
  },
  isOnboardingCompleted: false,
  tasks: [],
  goals: [],
  journal: [],
  plans: [],
  reports: [],
  notifications: [],
  chatHistory: [],
  integrations: [
    { id: 'cal', name: 'Google Agenda / Outlook', status: 'inactive', lastSync: '-', contextData: '' },
    { id: 'social', name: 'Redes Sociais / WhatsApp', status: 'inactive', lastSync: '-', contextData: '' },
    { id: 'health', name: 'Apple Health / Strava', status: 'inactive', lastSync: '-', contextData: '' },
    { id: 'notes', name: 'Notion / Evernote', status: 'inactive', lastSync: '-', contextData: '' }
  ],
  memories: [],
  smartHubs: [
      { id: 'alexa', name: 'Amazon Alexa', status: 'disconnected', icon: 'mic', description: 'Controle por voz e rotinas Echo.' },
      { id: 'google', name: 'Google Home', status: 'disconnected', icon: 'home', description: 'Google Assistant.' },
      { id: 'smartthings', name: 'Samsung SmartThings', status: 'disconnected', icon: 'smartphone', description: 'Hub central Samsung.' },
      { id: 'tuya', name: 'Tuya Smart', status: 'disconnected', icon: 'globe', description: 'Dispositivos genéricos.' },
      { id: 'hue', name: 'Philips Hue', status: 'disconnected', icon: 'lightbulb', description: 'Iluminação.' }
  ],
  smartDevices: [],
  transactions: [],
  habits: [],
  healthMetrics: [],
  theme: 'dark'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ultraia_db_v2');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Critical fix: Ensure all arrays are initialized even if saved state has them as undefined
            // This prevents the "white screen" crash when .filter or .map is called on undefined
            return {
                ...defaultState,
                ...parsed,
                user: { ...defaultState.user, ...parsed.user },
                userProfile: { ...defaultState.userProfile, ...parsed.userProfile },
                tasks: parsed.tasks || [],
                goals: parsed.goals || [],
                journal: parsed.journal || [],
                plans: parsed.plans || [],
                reports: parsed.reports || [],
                notifications: parsed.notifications || [],
                chatHistory: parsed.chatHistory || [],
                integrations: parsed.integrations || defaultState.integrations,
                memories: parsed.memories || [],
                smartDevices: parsed.smartDevices || [],
                smartHubs: parsed.smartHubs || defaultState.smartHubs,
                transactions: parsed.transactions || [],
                habits: parsed.habits || [],
                healthMetrics: parsed.healthMetrics || []
            };
        } catch (e) {
            console.error("Erro ao carregar estado", e);
            return defaultState;
        }
    }
    return defaultState;
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        localStorage.setItem('ultraia_db_v2', JSON.stringify(state));
    }, 800); 
    return () => clearTimeout(timeoutId);
  }, [state]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const setTheme = useCallback((theme: 'light' | 'dark') => setState(prev => ({ ...prev, theme })), []);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profile }
    }));
  }, []);

  const upgradePlan = useCallback(() => {
      setState(prev => ({
          ...prev,
          user: { ...prev.user, plan: 'pro' }
      }));
  }, []);

  const completeOnboarding = useCallback((name: string) => {
      setState(prev => ({
          ...prev,
          user: { ...prev.user, name, trialStartDate: new Date().toISOString() },
          isOnboardingCompleted: true
      }));
  }, []);

  const acceptTerms = useCallback(() => {
      setState(prev => ({
          ...prev,
          user: { ...prev.user, hasConsentedToTerms: true }
      }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
    const newNotif: Notification = { 
      ...notification, 
      id: Date.now().toString(), 
      date: new Date().toISOString(),
      read: false 
    };
    setState(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...task, id: Date.now().toString(), completed: false };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'progress' | 'status'>) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), progress: 0, status: 'Em andamento' };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  }, []);

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, progress } : g)
    }));
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: Date.now().toString() };
    setState(prev => ({ ...prev, journal: [newEntry, ...prev.journal] }));
  }, []);

  const addPlan = useCallback((plan: Omit<Plan, 'id' | 'createdAt'>) => {
    const newPlan: Plan = { ...plan, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, plans: [newPlan, ...prev.plans] }));
  }, []);

  const addReport = useCallback((report: Omit<Report, 'id'>) => {
    const newReport: Report = { ...report, id: Date.now().toString() };
    setState(prev => ({ ...prev, reports: [newReport, ...prev.reports] }));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, msg] }));
  }, []);

  const updateLastChatMessage = useCallback((text: string) => {
    setState(prev => {
        const history = [...prev.chatHistory];
        if (history.length > 0) {
            history[history.length - 1].text = text;
        }
        return { ...prev, chatHistory: history };
    });
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({ ...prev, chatHistory: [] }));
  }, []);

  const updateIntegration = useCallback((integration: Integration) => {
    setState(prev => ({
        ...prev,
        integrations: prev.integrations.map(i => i.id === integration.id ? integration : i)
    }));
  }, []);

  const addMemory = useCallback((memory: Omit<Memory, 'id'>) => {
      const newMemory: Memory = { ...memory, id: Date.now().toString() };
      setState(prev => ({ ...prev, memories: [newMemory, ...prev.memories] }));
  }, []);

  const updateSmartDevice = useCallback((id: string, updates: any) => {
      setState(prev => ({
          ...prev,
          smartDevices: prev.smartDevices.map(d => {
              if (d.id === id) {
                  return { ...d, settings: { ...d.settings, ...updates }, ...updates };
              }
              return d;
          })
      }));
  }, []);

  const addSmartDevice = useCallback((device: Omit<SmartDevice, 'id' | 'status' | 'settings'>) => {
      const newDevice: SmartDevice = {
          ...device,
          id: Date.now().toString(),
          status: 'off' as any,
          settings: { temperature: 24, volume: 15, brightness: 100, color: '#FFFFFF' }
      };
      setState(prev => ({ ...prev, smartDevices: [...prev.smartDevices, newDevice] }));
  }, []);

  const toggleSmartHub = useCallback((id: string) => {
      setState(prev => ({
          ...prev,
          smartHubs: prev.smartHubs.map(h => {
              if (h.id === id) return { ...h, status: h.status === 'connected' ? 'disconnected' : 'connected' };
              return h;
          })
      }));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
      const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
      setState(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
      const newHabit: Habit = { ...habit, id: Date.now().toString(), streak: 0, completedDates: [] };
      setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  }, []);

  const toggleHabit = useCallback((id: string, date: string) => {
      setState(prev => ({
          ...prev,
          habits: prev.habits.map(h => {
              if (h.id === id) {
                  const isCompleted = h.completedDates.includes(date);
                  let newDates = isCompleted ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date];
                  return { ...h, completedDates: newDates, streak: newDates.length };
              }
              return h;
          })
      }));
  }, []);

  const addHealthMetric = useCallback((metric: Omit<HealthMetric, 'id' | 'date'>) => {
      const newMetric: HealthMetric = { ...metric, id: Date.now().toString(), date: new Date().toISOString() };
      setState(prev => ({ ...prev, healthMetrics: [newMetric, ...prev.healthMetrics] }));
  }, []);

  const contextValue = useMemo(() => ({
      ...state,
      setTheme, updateUserProfile, upgradePlan, completeOnboarding, acceptTerms,
      addTask, toggleTask, deleteTask, addGoal, updateGoalProgress,
      addJournalEntry, addPlan, addReport, addNotification, markNotificationAsRead,
      addChatMessage, updateLastChatMessage, clearChat, updateIntegration, addMemory,
      updateSmartDevice, addSmartDevice, toggleSmartHub, addTransaction, addHabit,
      toggleHabit, addHealthMetric
  }), [state, setTheme, updateUserProfile, upgradePlan, completeOnboarding, acceptTerms, addTask, toggleTask, deleteTask, addGoal, updateGoalProgress, addJournalEntry, addPlan, addReport, addNotification, markNotificationAsRead, addChatMessage, updateLastChatMessage, clearChat, updateIntegration, addMemory, updateSmartDevice, addSmartDevice, toggleSmartHub, addTransaction, addHabit, toggleHabit, addHealthMetric]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
