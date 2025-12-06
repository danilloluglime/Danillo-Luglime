
export interface Task {
  id: string;
  title: string;
  category: 'Trabalho' | 'Pessoal' | 'Saúde' | 'Estudo' | 'Outro';
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
  linkedGoalId?: string; 
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number; 
  status: 'Em andamento' | 'Concluída' | 'Pausada';
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'Feliz' | 'Neutro' | 'Triste' | 'Ansioso' | 'Motivado';
  aiAnalysis?: string;
}

export interface Plan {
  id: string;
  type: 'Treino' | 'Estudos' | 'Produtividade' | 'Espiritual' | 'Financeiro' | 'Plano Alimentar' | 'Limpeza Doméstica';
  title: string;
  content: string; 
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: 'PDF' | 'Análise' | 'Resumo';
  url?: string; 
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: {
    type: 'image' | 'audio' | 'pdf';
    mimeType: string;
    data: string; 
  };
}

export interface Memory {
    id: string;
    content: string;
    tags: string[];
    date: string;
    imageUrl?: string;
}

export interface UserProfile {
  profession: string;
  focusArea: string;
  communicationStyle: 'Direto e Curto' | 'Detalhado e Explicativo' | 'Motivacional' | 'Formal';
  aiName: string;
  dailyWorkHours: string;
  // Novos campos para Modo Vendas e Creator
  salesProduct?: string;
  salesOffer?: string;
  targetAudience?: string;
}

export interface Integration {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastSync: string;
  contextData: string;
}

export interface SmartHub {
    id: string;
    name: string; 
    status: 'connected' | 'disconnected';
    icon: string; 
    description: string;
}

export interface SmartDevice {
    id: string;
    name: string;
    type: 'AC' | 'TV' | 'LIGHT' | 'LOCK' | 'SPEAKER' | 'ROBOT' | 'CAMERA' | 'CURTAIN';
    brand?: string; 
    hubId: string; 
    status: 'on' | 'off' | 'locked' | 'unlocked' | 'open' | 'closed';
    settings: {
        temperature?: number;
        mode?: string;
        volume?: number;
        channel?: number | string;
        brightness?: number;
        color?: string;
        battery?: number;
        position?: number; 
    };
    room: string;
}

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: 'Alimentação' | 'Transporte' | 'Moradia' | 'Lazer' | 'Saúde' | 'Investimento' | 'Salário' | 'Outro';
    date: string;
}

export interface Habit {
    id: string;
    title: string;
    streak: number;
    completedDates: string[]; 
    frequency: 'Diário' | 'Semanal';
    category: 'Saúde' | 'Mente' | 'Trabalho' | 'Lazer';
}

export interface HealthMetric {
    id: string;
    date: string;
    type: 'sleep' | 'weight' | 'water' | 'energy' | 'stress';
    value: number;
    unit: string;
}

export interface AppState {
  user: {
    name: string;
    email: string;
    plan: 'free' | 'pro';
    trialStartDate?: string;
    hasConsentedToTerms?: boolean;
  };
  userProfile: UserProfile;
  tasks: Task[];
  goals: Goal[];
  journal: JournalEntry[];
  plans: Plan[];
  reports: Report[];
  notifications: Notification[];
  chatHistory: ChatMessage[];
  integrations: Integration[];
  memories: Memory[];
  smartDevices: SmartDevice[];
  smartHubs: SmartHub[]; 
  transactions: Transaction[];
  habits: Habit[];
  healthMetrics: HealthMetric[];
  theme: 'light' | 'dark';
  isOnboardingCompleted: boolean;
}