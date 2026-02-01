import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import imageUrl from '../assets/login-hero.jpg';

declare global {
  interface Window {
    google: any;
  }
}

const LoginPage: React.FC = () => {
  const { isLoggedIn } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google/login";
  };

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50">
      <div className="flex flex-col md:flex-row h-full w-full">
        {/* Left Half - Hero Image (Desktop only) */}
        <div 
          className="hidden md:flex md:w-1/2 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${imageUrl}')`
          }}
        />

        {/* Right Half - Login Component */}
        <div className="w-full md:w-1/2 h-full bg-black relative flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          {/* Mobile only: background image with dark overlay - NOW COVERS FULL HEIGHT */}
          <div 
            className="block md:hidden absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: `url('${imageUrl}')`
            }}
          />
          <div className="block md:hidden absolute inset-0 w-full h-full bg-black/75 z-0" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-md my-auto">
            <h1 className=" text-center  text-6xl md:text-8xl lg:text-6xl mb-8 font-yesteryear leading-tight">
                  Backstage <span className="text-red-600">Rookie</span>
                </h1>
            <div className="glass p-8 md:p-12 rounded-3xl border-neon text-center space-y-6 md:space-y-8 relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-600 rounded-full blur-3xl opacity-30"></div>

              <div className="space-y-3 md:space-y-4">
                
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed px-2">
                  Your space. Your rules. No data tracking. <br></br>Start fresh always. No hidden fees.<br></br> Advanced scan tech. Pro reports included
                </p>
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full py-3 md:py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base shadow-lg hover:shadow-red-600/50"
              >
                Continue with Google
              </button>

              <div className="pt-3 md:pt-4 flex justify-between text-[9px] md:text-[10px] text-gray-700 mono">
                <span>SEC_LVL: ALPHA</span>
                <span>ENCRYPTION: AES-256</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-8 text-center text-gray-600 mono text-[9px] md:text-[10px] uppercase tracking-widest max-w-xs md:max-w-sm mx-auto leading-relaxed">
              Notice: All access is logged and audited. Attempting unauthorized access is a protocol violation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;