
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';

const PlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { plan: currentPlan, setPlan } = useApp();
  const [selected, setSelected] = useState<PlanType>(currentPlan);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (newPlan: PlanType) => {
    setSelected(newPlan);
    setIsUpdating(true);
    await setPlan(newPlan);
    setIsUpdating(false);
  };

  const handleContinue = () => {
    navigate('/reports');
  };

  return (
    <div className="py-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold mono uppercase tracking-tight neon-red">Select_Operation_Mode</h2>
          <p className="text-gray-400">Choose the intensity of the security analysis engine.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <div
            onClick={() => handleSelect('basic')}
            className={`cursor-pointer group relative p-8 rounded-3xl border-2 transition-all h-full flex flex-col ${
              selected === 'basic' 
              ? 'border-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(220,38,38,0.1)]' 
              : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            {selected === 'basic' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter mono">
                Active Protocol
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight">Basic Scan</h3>
              <p className="text-gray-500 text-sm mt-1">Standard Vulnerability Checks</p>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>Static Analysis (SAST) for 10+ languages</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>Dependency vulnerability tracking</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>Secret detection (API keys, passwords)</span>
              </li>
            </ul>
            <div className="text-xl font-bold mono">$0 <span className="text-xs text-gray-600 font-normal">/ SCAN</span></div>
          </div>

          {/* Full Plan */}
          <div
            onClick={() => handleSelect('full')}
            className={`cursor-pointer group relative p-8 rounded-3xl border-2 transition-all h-full flex flex-col ${
              selected === 'full' 
              ? 'border-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(220,38,38,0.1)]' 
              : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            {selected === 'full' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter mono">
                Active Protocol
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight flex items-center">
                Full AI Scan
                <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded italic">AI</span>
              </h3>
              <p className="text-gray-500 text-sm mt-1">Deep Compliance Analysis</p>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>All Basic features included</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>AI-powered remediation suggestions</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>Business compliance mapping (SOC2/ISO)</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="text-red-500 mt-1">✓</span>
                <span>Architecture risk scoring</span>
              </li>
            </ul>
            <div className="text-xl font-bold mono">$99 <span className="text-xs text-gray-600 font-normal">/ SCAN</span></div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={handleContinue}
            disabled={isUpdating}
            className={`min-w-[300px] bg-white text-black font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm shadow-xl ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            {isUpdating ? 'Synchronizing...' : 'Initialize Full Analysis'}
          </button>
          <p className="text-[10px] text-gray-700 mono text-center">
            BY PROCEEDING, YOU AGREE TO DATA PROCESSING UNDER PROTOCOL-112B.<br/>
            ENCRYPTED COMMS ACTIVE.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;
