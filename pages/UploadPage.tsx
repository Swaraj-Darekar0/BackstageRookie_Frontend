
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle, faAws } from '@fortawesome/free-brands-svg-icons';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRepoInfo } = useApp();
  
  const [url, setUrl] = useState('');
  const [sector, setSector] = useState('');
  const [framework, setFramework] = useState('django'); // Restored state
  const [error, setError] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const validateGithubUrl = (input: string) => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubRegex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateGithubUrl(url)) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setRepoInfo(url, sector, framework); // Pass framework
    navigate('/plan');
  };

  return (
    <div className="py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold mono uppercase tracking-tight neon-red">Connect_Repository</h2>
          <p className="text-gray-400">Specify the target codebase and vertical sector for contextual analysis.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 glass p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mono">GitHub URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/organization/project"
              className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-red-500 transition-all mono`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1 mono">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mono">Sector Hint (Optional)</label>
            <select
            title='Sector'
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
            >
              <option value="">General Purpose</option>
              <option value="fintech">Fintech (PCI-DSS Focus)</option>
              <option value="healthcare">Healthcare (HIPAA Focus)</option>
              <option value="government">Government (FedRAMP Focus)</option>
              <option value="crypto">Web3 / Crypto (Audit Focus)</option>
            </select>
          </div>

          {/* Restored Backend Framework Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mono">Backend Framework</label>
            <select
                title='Backend Framework'
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all appearance-none"
            >
              <option value="django">Django</option>
              <option value="fastapi">FastAPI</option>
              <option value="flask">Flask</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-sm"
          >
            Configure Plan &rarr;
          </button>
        </form>

        <div className="flex justify-center space-x-8">
          <FontAwesomeIcon
            icon={faGithub}
            bounce={hoveredIcon === 'github'}
            size="2x"
            onMouseEnter={() => setHoveredIcon('github')}
            onMouseLeave={() => setHoveredIcon(null)}
          />
          <FontAwesomeIcon
            icon={faGoogle}
            bounce={hoveredIcon === 'google'}
            size="2x"
            onMouseEnter={() => setHoveredIcon('google')}
            onMouseLeave={() => setHoveredIcon(null)}
          />
          <FontAwesomeIcon
            icon={faAws}
            bounce={hoveredIcon === 'aws'}
            size="2x"
            onMouseEnter={() => setHoveredIcon('aws')}
            onMouseLeave={() => setHoveredIcon(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

