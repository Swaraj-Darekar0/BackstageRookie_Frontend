
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backstagerookie-backend2.onrender.com/',
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth failure
api.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const securityApi = {
  // NEW: called after OAuth redirect
  exchangeToken: async () => {
    const res = await api.get('/api/auth/google/callback');
    return res.data;
  },

  login: () => {
    window.location.href = `${api.defaults.baseURL}api/auth/google/login`;
  },

  logout: async () => {
    return api.post('/api/auth/logout');
  },

  changePlan: async (plan: string) => {
    const res = await api.post('/api/change-plan', { plan });
    return res.data;
  },

  getPlan: async () => {
    const res = await api.get('/api/get-plan');
    return res.data;
  },

  getUserProfile: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  listModels: async () => {
    const res = await api.get('/api/models');
    return res.data;
  },

  analyzeRepo: async (payload: {
    github_url: string;
    sector_hint: string;
    plan: string;
    backend_framework: string;
  }) => {
    const res = await api.post("/api/analyze", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },



  
  fetchSessionToken: async () => {
  const res = await api.get("/api/auth/google/session");
    return res.data;
  },

  generateReport: async (scanId: string, reportType: string, modelName: string) => {
    const res = await api.post('/api/generate-report', { 
      scan_id: scanId, 
      report_type: reportType,
      model_name: modelName // Pass the selected model name
    }, {
      responseType: 'blob'
    });
    return res;
  }
};


export default api;
