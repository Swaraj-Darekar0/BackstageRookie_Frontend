
import React, { createContext, useContext, useState, useEffect } from 'react';
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
      console.log('[Initialize] Checking for existing session...');
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('[Initialize] Token found. Syncing state with backend...');
        try {
          // Fetch plan and user profile in parallel
          const [planRes, userProfile] = await Promise.all([
            securityApi.getPlan(),
            securityApi.getUserProfile()
          ]);
          
          console.log('[Initialize] getPlan response:', planRes);
          setPlanState(planRes.plan);

          console.log('[Initialize] getUserProfile response:', userProfile);
          setUser(userProfile);
          localStorage.setItem('user_profile', JSON.stringify(userProfile));
          console.log('[Initialize] State synced successfully.');

        } catch (error) {
          console.error('[Initialize] Failed to sync state with backend.', error);
          // Token might be invalid, Axios interceptor will handle 401
        }
      } else {
        console.log('[Initialize] No token found.');
      }
      setIsLoading(false);
    };
    initialize();
  }, [isLoggedIn]);

  const login = async () => {
  try {
    const { access_token } = await securityApi.exchangeToken();
    localStorage.setItem('access_token', access_token);
    setIsLoggedIn(true);

    const userProfile = await securityApi.getUserProfile();
    setUser(userProfile);
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    
  } catch (err) {
    console.error('OAuth login failed', err);
    throw err;
  }
};


  const handleLoginCallback = async () => {
    try {
      console.log('[LoginCallback] Fetching session token...');
      const response = await securityApi.fetchSessionToken();
      const accessToken = response.access_token;
      localStorage.setItem("access_token", accessToken);
      console.log('[LoginCallback] Access token stored. Setting isLoggedIn=true.');
      setIsLoggedIn(true);
      
      console.log('[LoginCallback] Fetching user profile...');
      const userProfile = await securityApi.getUserProfile();
      setUser(userProfile);
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      console.log('[LoginCallback] User profile stored.', userProfile);

    } catch (error) {
      console.error('[LoginCallback] Failed to complete login.', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    setUser(null);
    setIsLoggedIn(false);
  };

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
      console.error('Error changing plan', err);
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
