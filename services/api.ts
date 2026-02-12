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
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url} (Token attached)`);
  } else {
    console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url} (No token)`);
  }
  return config;
});

// Handle response & auth failure
api.interceptors.response.use(
  res => {
    console.debug(`[API Success] ${res.status} ${res.config.url}`);
    return res;
  },
  err => {
    if (err.response) {
      console.error(
        `[API Error] ${err.response.status} ${err.response.config.url}`,
        `\n  Data:`, err.response.data
      );
    } else {
      console.error('[API Error] Network or other error', err.message);
    }

    if (err.response?.status === 401) {
      console.warn('[Auth] Unauthorized (401). Clearing session and redirecting.');
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(err);
  }
);

export const securityApi = {
  exchangeToken: async () => {
    console.log('[Auth] Exchanging OAuth code for tokens...');
    const res = await api.get('/api/auth/google/callback');
    return res.data;
  },

  getScanUsage: async () => {
    const res = await api.get("/api/scan-usage");
    console.log(`[Usage] Scans remaining: ${res.data.remaining}`);
    return res.data;
  },

  login: () => {
    const loginUrl = `${api.defaults.baseURL}/api/auth/google/login`;
    console.log('[Auth] Redirecting to Google Login...');
    window.location.href = loginUrl;
  },

  logout: async () => {
    console.log('[Auth] Logging out...');
    return api.post('/api/auth/logout');
  },

  changePlan: async (plan: string) => {
    console.log(`[Billing] Changing plan to: ${plan}`);
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
    console.group('[Analysis] Starting Repository Scan');
    console.log('Payload:', payload);
    try {
      const res = await api.post("/api/analyze", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log('Task ID Received:', res.data.task_id);
      console.groupEnd();
      return res.data;
    } catch (err) {
      console.groupEnd();
      throw err;
    }
  },

  fetchSessionToken: async () => {
    const res = await api.get("/api/auth/google/session");
    return res.data;
  },

  // Polling Logs
  getScanStatus: async (taskId: string) => {
    const res = await api.get(`/api/scan/status/${taskId}`);
    console.debug(`[Status] Scan ${taskId}: ${res.data.status}`);
    return res.data;
  },

  getReportStatus: async (taskId: string) => {
    const res = await api.get(`/api/report/status/${taskId}`);
    console.debug(`[Status] Report ${taskId}: ${res.data.status}`);
    return res.data;
  },

// Inside securityApi in api.ts

// Inside securityApi in api.ts
downloadReport: async (filename: string) => {
  try {
    // 1. Get the Signed URL from your backend first
    const { data } = await api.get(`/api/reports/download/${filename}`);
    const signedUrl = data.download_url;

    // 2. Fetch the actual binary data from Supabase
    // We use a clean axios call (withCredentials: false) so Supabase doesn't reject our Flask headers
    const response = await axios.get(signedUrl, { 
      responseType: 'blob', 
      withCredentials: false 
    });

    // 3. Create the Blob and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // 4. Cleanup to prevent memory leaks
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    
  } catch (err) {
    console.error('[Download] Failed to transfer PDF:', err);
    throw err;
  }
},

  generateReport: async (scanId: string, reportType: string) => {
    console.log(`[Report] Requesting ${reportType} for Scan ID: ${scanId}`);
    const res = await api.post('/api/generate-report', { 
      scan_id: scanId, 
      report_type: reportType,
      model_name: 'gemini-2.5-flash' 
    });
    console.log('[Report] Generation Task ID:', res.data.task_id);
    return res.data;
  }
};

export default api;