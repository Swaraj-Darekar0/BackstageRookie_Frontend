
import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      {isLoggedIn && (
        <nav className="z-20 glass border-b border-red-500/20 px-6 py-4 flex justify-between items-center sticky top-0">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-red-500 font-yesteryear  text-4xl mono tracking-tighter ">
              Backstage<span className="text-white"> Rookie</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 mr-4 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              {user?.avatar && <img src={user.avatar} className="w-6 h-6 rounded-full" alt="avatar" />}
              <span className="text-sm text-gray-400 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 text-sm font-semibold transition-colors uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </div>
        </nav>
      )}

      <main className="flex-grow z-10 p-6 md:p-12 relative flex flex-col items-center justify-start">
        <div className="max-w-4xl w-full">
          {children}
        </div>
      </main>

      <footer className="z-10 p-6 text-center text-gray-600 text-xs mono uppercase tracking-widest">
        &copy; {new Date().getFullYear()} BackstageRookie. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
