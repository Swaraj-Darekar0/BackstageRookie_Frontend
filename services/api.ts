
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backstagerookie-backend3.onrender.com',
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
  getScanUsage: async () => {
    const res = await api.get("/api/scan-usage");
    return res.data; // Expected: { remaining: 3 }
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

  // Original analyzeRepo function (commented out)
  /*
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
    console.log(payload)
    console.log(res.data)
    console.log(typeof res.data)
    return res.data;
  },
  */

  // New analyzeRepo function
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

    // Expecting res.data to be { status: 'success', message: 'Analysis started', task_id: '...' }
    return res.data; // Return the full response which includes task_id
  },



  
  fetchSessionToken: async () => {
    const res = await api.get("/api/auth/google/session");
    return res.data;
  },

  // NEW: Functions for polling Celery task status
  getScanStatus: async (taskId: string) => {
    const res = await api.get(`/api/scan/status/${taskId}`);
    return res.data;
  },

  getReportStatus: async (taskId: string) => {
    const res = await api.get(`/api/report/status/${taskId}`);
    return res.data;
  },

  downloadReport: async (url: string) => {
    // Axios will automatically include the token via the interceptor
    const res = await api.get(url, {
      responseType: 'blob' // Important: responseType must be 'blob' for binary files
    });
    return res;
  },

  // Original generateReport function (commented out)
  /*
  generateReport: async (scanId: string, reportType: string, modelName: string) => {
    const res = await api.post('/api/generate-report', { 
      scan_id: scanId, 
      report_type: reportType,
      model_name: modelName // Pass the selected model name
    });
    return res;
  }
  */

  // New generateReport function
  generateReport: async (scanId: string, reportType: string) => {
    const res = await api.post('/api/generate-report', { 
      scan_id: scanId, 
      report_type: reportType,
      model_name: 'gemini-2.5-flash' // Pass the selected model name
    });

    // Expecting res.data to be { status: 'success', message: 'Report generation started.', task_id: '...' }
    return res.data; // Return the full response which includes task_id
  }
};


export default api;
