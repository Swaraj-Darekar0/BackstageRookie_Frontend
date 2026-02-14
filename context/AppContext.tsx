
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, User, PlanType } from '../types';
import { securityApi } from '../services/api';

interface AppContextType extends AppState {
  login: () => Promise<void>;
  logout: () => void;
  setRepoInfo: (url: string, sector: string, framework: string) => void;
  setPlan: (plan: PlanType) => void;
  setScanId: (id: string) => void;
  isLoading: boolean;
  handleLoginCallback: () => Promise<void>;
  backendFramework: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [sectorHint, setSectorHint] = useState('');
  const [backendFramework, setBackendFramework] = useState('');
  const [plan, setPlanState] = useState<PlanType>('basic');
  const [scanId, setScanIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Fetch plan and user profile in parallel
          const [planRes, userProfile] = await Promise.all([
            securityApi.getPlan(),
            securityApi.getUserProfile()
          ]);
          setPlanState(planRes.plan);

          setUser(userProfile);
          localStorage.setItem('user_profile', JSON.stringify(userProfile));

        } catch (error) {
          // Token might be invalid, Axios interceptor will handle 401
          console.error('[AppProvider] Initialization error:', error);
        }
      } else {
      }
      setIsLoading(false);
    };
    initialize();
  }, [isLoggedIn]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const login = useCallback(async () => {
    try {
      const { access_token } = await securityApi.exchangeToken();
      localStorage.setItem('access_token', access_token);
      setIsLoggedIn(true);

      const userProfile = await securityApi.getUserProfile();
      setUser(userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));

    } catch (err) {
      console.error('[LoginCallback] Failed to SAVE user_profile.', err);
      throw err;
    }
  }, []);


  // In AppContext.tsx

  // In AppContext.tsx

  const handleLoginCallback = useCallback(async () => {
    try {
      let accessToken: string | null = null;

      // 1. BRAVE FIX: Try to get token from URL Fragment (#) first
      // This works even if cookies were blocked during the redirect
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        accessToken = params.get('access_token');
      }

      // 2. Standard Fallback: If no hash, try the session route
      // This handles cases where the user might rely on cookies (standard Chrome/Edge)
      if (!accessToken) {
        console.log('[Auth] No fragment token found, checking session...');
        const response = await securityApi.fetchSessionToken();
        accessToken = response.access_token;
      }

      if (!accessToken) throw new Error("No token received from Fragment or Session");

      // 3. Save to localStorage (Critical for the Interceptor in api.ts)
      localStorage.setItem("access_token", accessToken);

      // 4. SECURITY: Scrub the URL immediately
      // Remove the token from the address bar so it doesn't stay in browser history
      window.history.replaceState(null, "", window.location.pathname);

      // 5. Trigger Backend Sync (Using the Fallback Logic we added to main.py)
      const userProfile = await securityApi.getUserProfile();

      // 6. Update State
      setUser(userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));

      setIsLoggedIn(true);

    } catch (error) {
      console.error('[LoginCallback] Handshake failed:', error);
      logout();
      throw error;
    }
  }, [logout]);// Include logout in dependencies since it's now a stable callback

  const setRepoInfo = (url: string, sector: string, framework: string) => {
    setGithubUrl(url);
    setSectorHint(sector);
    setBackendFramework(framework);
  };

  const setPlan = async (newPlan: PlanType) => {
    try {
      const res = await securityApi.changePlan(newPlan);
      setPlanState(res.plan);
    } catch (err) {
    }
  };

  const setScanId = (id: string) => setScanIdState(id);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        githubUrl,
        sectorHint,
        backendFramework,
        plan,
        scanId,
        login,
        logout,
        setRepoInfo,
        setPlan,
        setScanId,
        isLoading,
        handleLoginCallback,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
