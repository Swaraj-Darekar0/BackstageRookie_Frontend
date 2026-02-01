
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { securityApi } from '../services/api';
import { ReportType, AnalyzeResponse, Model } from '../types';
import { useNavigate } from 'react-router-dom';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { githubUrl, sectorHint, plan, scanId, setScanId } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('models/gemini-1.5-pro-latest');

  useEffect(() => {
    const triggerAnalysis = async () => {
      if (!githubUrl) {
        setError('No repository information found. Please go back to the upload page.');
        setIsAnalyzing(false);
        return;
      }

      try {
        const res = await securityApi.analyzeRepo({github_url: githubUrl, plan: plan, sector_hint:sectorHint, backend_framework: '' });
        setAnalysisResult(res);
        setScanId(res.scan_id);
      } catch (err: any) {
        console.error('Analysis error', err);
        setError('System breach: Repository analysis failed. Please verify the URL.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    triggerAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await securityApi.listModels();
        setModels(availableModels);
      } catch (err) {
        console.error("Failed to fetch models", err);
        // Do not set a page-level error, as report generation can still proceed with a default model
      }
    };
    fetchModels();
  }, []);

  const handleGenerate = async (type: ReportType) => {
    if (!scanId) return;

    setIsGenerating(true);
    setMessage(`Generating ${type} report using ${selectedModel}...`);
    try {
      const response = await securityApi.generateReport(scanId, type, selectedModel);
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${type}_report.docx`; // A fallback filename
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(url);

      setMessage(`Success: Report "${filename}" downloaded.`);
    } catch (err) {
      console.error('Report error', err);
      setMessage('Critical error generating document.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-red-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold mono uppercase flicker">Scanning_Repository</h2>
          <p className="text-gray-500 mono text-xs animate-pulse">PATH: {githubUrl}</p>
          <div className="text-[10px] text-gray-700 mono mt-4">
            [SYS_LOG]: Decompiling artifacts...<br/>
            [SYS_LOG]: Identifying dependencies...<br/>
            [SYS_LOG]: Running heuristics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-6">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold mono text-red-500 uppercase">{error}</h2>
        <button
          onClick={() => navigate('/upload')}
          className="bg-white text-black px-6 py-2 rounded-lg font-bold uppercase text-xs"
        >
          Return to Input
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12">
      <div className="glass p-8 rounded-3xl border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded uppercase mono">Complete</span>
            <span className="text-gray-500 text-xs mono">SCAN_ID: {scanId}</span>
          </div>
          <h2 className="text-3xl font-bold">Analysis Terminated.</h2>
          <p className="text-gray-400">Total of <span className="text-red-500 font-bold">{analysisResult?.total_findings}</span> findings identified in codebase.</p>
        </div>
        <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-xs text-gray-500 uppercase mono">Safety Score</div>
            <div className="text-4xl font-bold text-green-500">82<span className="text-sm text-gray-500">/100</span></div>
        </div>
      </div>

      {/* Model Selection UI */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">Select Generative Model</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              onClick={() => setSelectedModel(model.name)}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all h-full flex flex-col glass ${
                selectedModel === model.name
                  ? 'border-red-500'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <h4 className="text-lg font-bold mb-2">{model.display_name}</h4>
              <p className="text-gray-400 text-xs mb-4 flex-grow">{model.description}</p>
              {selectedModel === model.name && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">Generate_Reporting_Artifacts</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
            <h4 className="text-lg font-bold mb-4">Technical Report</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Deep dive into CVEs, dependency trees, and direct remediation code snippets.</p>
            <button
              onClick={() => handleGenerate('technical')}
              disabled={isGenerating}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Generate PDF
            </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
            <h4 className="text-lg font-bold mb-4">Business Compliance</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Summary for stakeholders. Mapped to SOC2, HIPAA, and ISO27001 requirements.</p>
            <button
              onClick={() => handleGenerate('business')}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Generate PDF
            </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
            <h4 className="text-lg font-bold mb-4">Custom Artifact</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Filter by specific findings or severity levels for internal jira-syncing.</p>
            <button
              onClick={() => handleGenerate('regulatory')}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-8 right-8 glass p-4 rounded-xl border-l-4 border-blue-500 shadow-2xl animate-bounce">
           <p className="text-xs mono">{message}</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
