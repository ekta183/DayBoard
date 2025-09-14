export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profileVisible: boolean;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  note?: string;
  date: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface DayRecord {
  _id: string;
  userId: string;
  date: string;
  isEnded: boolean;
  endedAt?: string;
  totalTasks: number;
  completedTasks: number;
  overallProductivity: number;
  productivityLabel: 'Not Productive' | 'Moderately Productive' | 'Productive';
  summary?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (userData: { username: string; email: string; password: string }) => Promise<any>;
  logout: () => void;
  loading: boolean;
}