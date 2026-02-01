
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBurst,faFile,faBoltLightning } from '@fortawesome/free-solid-svg-icons';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
   const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  return (
    <div className="space-y-12 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome, <span className="text-red-500">{user?.name}</span>.
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          Your centralized command for software security compliance. Automate your documentation 
          and audit preparation using our high-fidelity scanning engine.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div onMouseEnter={() => setHoveredIcon('Meteor')} onMouseLeave={() => setHoveredIcon(null)} className="glass items-center justify-center p-8 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all group">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon 
            icon={faBurst} 
            beatFade={hoveredIcon === 'Meteor'}
            size="2x"
             />
          </div>
          <h3 className="text-lg font-bold mb-2">Continuous Auditing</h3>
          <p className="text-gray-500 text-sm">Real-time vulnerability tracking mapped to industry standards.</p>
        </div>

        <div onMouseEnter={() => setHoveredIcon('File')} onMouseLeave={() => setHoveredIcon(null)}  className="glass p-8 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all group">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
           <FontAwesomeIcon icon={faFile} 
            beatFade={hoveredIcon === 'File'}
            size="2x"
            /> 
          </div>
          <h3 className="text-lg font-bold mb-2">Automated Reports</h3>
          <p className="text-gray-500 text-sm">Generate SOC2, HIPAA, and custom technical reports instantly.</p>
        </div>

        <div onMouseEnter={() => setHoveredIcon('Bolt')} onMouseLeave={() => setHoveredIcon(null)} className="glass p-8 rounded-2xl border border-white/10  hover:border-purple-500/30 transition-all group">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon 
            icon={faBoltLightning}
            beatFade={hoveredIcon === 'Bolt'}
            size="2x"
             />
          </div>
          <h3 className="text-lg font-bold mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-500 text-sm">Context-aware risk assessment powered by Large Language Models.</p>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-white font-medium">Ready to secure your codebase?</p>
          <p className="text-gray-500 text-sm">Start by connecting your GitHub repository.</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] uppercase tracking-widest text-sm"
        >
          Initialize Security Scan
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
