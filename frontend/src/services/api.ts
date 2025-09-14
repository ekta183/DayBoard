const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token && config.headers) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  auth: {
    register: (userData: { username: string; email: string; password: string }) => api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
    login: (credentials: { email: string; password: string }) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  },

  tasks: {
    create: (taskData: { title: string; description: string; totalItems: number; date: string }) => api.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

    getByDate: (date: string) => api.request(`/tasks?date=${date}`),

    updateProgress: (taskId: string, progressData: { completedItems: number; note: string }) => api.request(`/tasks/${taskId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    }),

    delete: (taskId: string) => api.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
  },

  dayRecords: {
    endDay: (dayData: { date: string; summary: string }) => api.request('/day-records/end-day', {
      method: 'POST',
      body: JSON.stringify(dayData),
    }),

    getDay: (date: string) => api.request(`/day-records/day/${date}`),

    getCalendar: (month?: number, year?: number) => {
      const params = month && year ? `?month=${month}&year=${year}` : '';
      return api.request(`/day-records/calendar${params}`);
    },

    getPublicCalendar: (userId: string, month?: number, year?: number) => {
      const params = month && year ? `?month=${month}&year=${year}` : '';
      return api.request(`/day-records/public/${userId}/calendar${params}`);
    },

    getUsers: () => api.request('/day-records/users'),
  },
};

export default api;