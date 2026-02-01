
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(
    `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
    `\n  Authorization: ${typeof config.headers.Authorization === 'string' ? 'Bearer ...' + config.headers.Authorization.slice(-10) : '(none)'}`
  );
  return config;
});

// Handle auth failure
api.interceptors.response.use(
  res => {
    console.log(`[API Response] ${res.status} ${res.config.url}`, res.data);
    return res;
  },
  err => {
    if (err.response) {
      console.error(
        `[API Error] ${err.response.status} ${err.response.config.url}`,
        `\n  Response:`, err.response.data
      );
    } else {
      console.error('[API Error] Network or other error', err);
    }

    if (err.response?.status === 401) {
      console.log('[Auth] Received 401, clearing local storage and redirecting to login.');
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
  }) => {
    const res = await api.post("/api/analyze", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(payload)
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
