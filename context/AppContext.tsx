
import React, { createContext, useContext, useState,useCallback, useEffect } from 'react';
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
  },[]);


  // In AppContext.tsx

  const handleLoginCallback = useCallback( async () => {
    try {
      console.log('[Auth] Fetching session token from backend...');

      // 1. Get the Access Token from the backend session
      const response = await securityApi.fetchSessionToken();
      const accessToken = response.access_token;

      if (!accessToken) {
        throw new Error("No access token received from backend");
      }

      // 2. CRITICAL: Save to LocalStorage IMMEDIATELY
      // This allows the api.ts interceptor to pick it up for the next request
      localStorage.setItem("access_token", accessToken);

      console.log('[Auth] Token saved. Syncing profile...');

      // 3. Force a Profile Fetch (Triggers Backend DB Upsert & Fallback)
      // We await this to ensure the backend validates us before we say "Logged In"
      const userProfile = await securityApi.getUserProfile();

      if (!userProfile || !userProfile.email) {
        throw new Error("Failed to retrieve user profile");
      }

      // 4. Update State only after success
      setUser(userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setIsLoggedIn(true);
      console.log('[Auth] Login complete. User:', userProfile.email);

    } catch (error) {
      console.error('[LoginCallback] Login failed:', error);
      // 5. Cleanup on failure so we don't get stuck
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      setIsLoggedIn(false);
      setUser(null);
      throw error; // Re-throw so OAuthCallbackPage knows to redirect to /login
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

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
