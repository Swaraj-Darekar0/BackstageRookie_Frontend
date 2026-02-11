
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { securityApi } from '../services/api';
import { ReportType, AnalyzeResponse, Model, LlmEnrichedEndpoint, Finding } from '../types';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// ### NEW: Modal Component ###
const EndpointDetailModal: React.FC<{
  endpoint: LlmEnrichedEndpoint;
  onClose: () => void;
}> = ({ endpoint, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass p-8 rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          title='close'
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <h3 className="text-2xl font-bold mono text-red-400 mb-2">{endpoint.path}</h3>
        <div className="flex items-center space-x-2 mb-6">
          {endpoint.methods.map(method => (
            <span key={method} className="px-2 py-0.5 bg-gray-700 text-white text-[10px] font-bold rounded mono">{method}</span>
          ))}
        </div>

        <div className="space-y-6">
          {/* Request Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-gray-400 mb-3">Request Details</h4>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-500/30 space-y-2">
              <p className="text-sm text-gray-300">
                <span className="font-bold">Content Type:</span> {endpoint.request.content_type}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-bold">Fields:</span> {endpoint.request.fields.length > 0 ? endpoint.request.fields.map(f => f.name).join(', ') : 'None'}
              </p>
            </div>
          </div>

          {/* Response Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-gray-400 mb-3">Response Details</h4>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-500/30 space-y-2">
              <p className="text-sm text-gray-300">
                <span className="font-bold">Content Type:</span> {endpoint.response.content_type}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-bold">Status Codes:</span> {endpoint.response.status_codes.join(', ')}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-bold">Contains Sensitive Data:</span>{' '}
                {endpoint.response.contains_sensitive_data ? (
                  <span className="text-red-400">Yes</span>
                ) : (
                  <span className="text-green-400">No</span>
                )}
              </p>
            </div>
          </div>

          {/* Security Risks Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-gray-400 mb-3">Security Risks</h4>
            {endpoint.security_risks?.length > 0 ? (
              <div className="space-y-3">
                {endpoint.security_risks.map((risk, index) => (
                  <div key={index} className="bg-red-900/50 p-4 rounded-lg border border-red-500/30">
                    <p className="font-bold mono text-red-300">{risk.id} <span className={`ml-2 text-xs uppercase px-2 py-0.5 rounded ${risk.severity === 'high' ? 'bg-red-500' : risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'} text-black`}>{risk.severity}</span></p>
                    <p className="text-sm text-gray-300 mt-1">{risk.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No typical security risks identified.</p>
            )}
          </div>

          {/* Compliance Analysis Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-gray-400 mb-3">Compliance Analysis</h4>
            {endpoint.compliance_analysis && Object.keys(endpoint.compliance_analysis).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(endpoint.compliance_analysis).map(([key, value]) => (
                  <div key={key} className="bg-blue-900/50 p-4 rounded-lg border border-blue-500/30">
                    <p className="font-bold mono text-blue-300">{key} <span className={`ml-2 text-xs uppercase px-2 py-0.5 rounded ${value.applicable ? 'bg-blue-400' : 'bg-gray-600'} text-black`}>{value.applicable ? 'Applicable' : 'Not Applicable'}</span></p>
                    {value.applicable && <p className="text-sm text-gray-300 mt-1">{value.reason}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No compliance analysis provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// ###########################

const VulnerabilityDetailModal: React.FC<{
  finding: Finding;
  onClose: () => void;
}> = ({ finding, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass p-8 rounded-3xl border border-red-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          title="close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        <div className="flex items-center space-x-3 mb-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase mono ${finding.severity.toLowerCase() === 'critical' ? 'bg-red-700 text-red-100' :
              finding.severity.toLowerCase() === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
            }`}>
            {finding.severity}
          </span>
          <span className="text-gray-500 text-xs mono">{finding.id}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-6">{finding.title}</h3>

        <div className="space-y-6">
          {/* Overview Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-red-400 mb-3">Overview</h4>
            <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
              {finding.overview}
            </p>
          </div>

          {/* Evidence Section */}
          <div>
            <h4 className="text-lg font-bold mono uppercase tracking-widest text-gray-400 mb-3">Evidence</h4>
            <div className="space-y-2">
              {finding.evidence.map((ev, idx) => (
                <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-500/20">
                  <p className="text-blue-400 font-bold mono text-sm mb-1">{ev.name}</p>
                  <p className="text-xs text-gray-400">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Remediation Section */}
          {finding.prompts_to_solve_the_vulnerability && (
            <div>
              <h4 className="text-lg font-bold mono uppercase tracking-widest text-green-400 mb-3">AI Remediation Guidance</h4>
              <div className="bg-green-900/20 p-4 rounded-lg border border-purple-500/30">
                <p className="text-sm text-gray-300  mb-4">Copy & Paste Prompt:</p>
                <div className="bg-black/40 p-4 rounded border border-purple-500/20 font-mono text-xs text-purple-200 whitespace-pre-wrap">
                  {finding.prompts_to_solve_the_vulnerability}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QUIRKY_MESSAGES = [
  "Staring at your code a little longer than is strictly professional.",
  "I’ve seen your vulnerabilities, and I still think you’re a catch.",
  "Don’t mind me, I’m just admiring your architecture.",
  "Don't look at me like that, I'm trying to stay focused on your open ports!",
  "Don't worry, vulnerabilities dhoond raha hoon, teri buraiyaan nahi. Woh toh bohot hain.",
  "Critical findings toh aayengi, par tera 'plan' kya hai? Dinner?",
  "Checking your perimeter... you look very secure today.",
  "Finding a \"critical\" just so I have an excuse to keep talking to you.",
  "Is it hot in this server room, or is it just your firewall?",
  "I’m not just scanning; I’m looking for a deep connection.",
  "Your encryption is strong, but I think I’m breaking through.",
  "Shhh... I’m whispering sweet nothings to your database.",
  "Don't worry, your secrets are safe with me. I'm a vault.",
  "I like my code like I like my coffee: secure and kept hot.",
  "I’ve got my eye on you (and your open ports).",
  "Just a second, I’m making sure no one else is looking at you.",
  "Searching for vulnerabilities... and a reason to keep simping for this code.",
  "Giving your documentation the \"once-over.\" Looking good.",
  "Scanning for threats, but mostly just enjoying the view.",
  "Logic is 10/10. Security is... let's just talk about the logic.",
  "I promise to be gentle with your legacy systems.",
  "Your infrastructure really knows how to treat an AI right.",
  "Just polishing the report so you look like a hero.",
  "Wait for it... the reveal is going to be stunning. Just like you.",
  "I’m making sure the only thing \"exposed\" here is your talent.",
  "Counting down the seconds until I can show you what I found.",
  "I’ve got a \"crush\" on your clean syntax.",
  "Almost done. Grab a coffee, you look like you need it.",
  "Scanning... Don't worry, I've seen worse. Much worse."
];


const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/upload'); // Navigate directly to the upload page
  };
  const { githubUrl, sectorHint, backendFramework, plan, scanId, setScanId } = useApp();
  const [analysisTaskId, setAnalysisTaskId] = useState<string | null>(null);
  const [reportTaskId, setReportTaskId] = useState<string | null>(null);
  // ### FIX: Added state for current report type ###
  const [currentReportType, setCurrentReportType] = useState<ReportType | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('models/gemini-1.5-pro-latest');
  const [selectedEndpoint, setSelectedEndpoint] = useState<LlmEnrichedEndpoint | null>(null);
  const effectRan = useRef(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  // Add this with your other useState hooks
  const [taskProgressMessage, setTaskProgressMessage] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % QUIRKY_MESSAGES.length);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);


  useEffect(() => {
    if (effectRan.current === false) {
      const triggerAnalysis = async () => {
        // ### SAFETY GUARD: Redirect if no repo is provided ###
        if (!githubUrl || githubUrl.trim() === "") {
          console.warn("No repository URL found in context. Redirecting to upload...");
          navigate('/upload');
          return;
        }

        try {
          setIsAnalyzing(true);
          const res = await securityApi.analyzeRepo({
            github_url: githubUrl,
            plan: plan,
            sector_hint: sectorHint,
            backend_framework: backendFramework
          });
          setAnalysisTaskId(res.task_id);
          setScanId(res.scan_id);
          setMessage('Analysis started. Waiting for results...');
        } catch (err: any) {
          console.error('Analysis error', err);
          setError('System breach: Repository analysis failed.');
          setIsAnalyzing(false);
        }
      };

      triggerAnalysis();

      return () => {
        effectRan.current = true;
      };
    }
  }, [githubUrl, navigate, plan, sectorHint, backendFramework, setScanId]); // Ensure dependencies are correct

  // Effect for polling analysis task status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (analysisTaskId) { // Poll only if analysisTaskId exists
      intervalId = setInterval(async () => {

        try {

          const statusRes = await securityApi.getScanStatus(analysisTaskId);
          if (statusRes.progress_message) {
            setTaskProgressMessage(statusRes.progress_message);
          }
          if (statusRes.status === 'SUCCESS') {
            clearInterval(intervalId);
            setAnalysisResult(statusRes.result); // Set the actual analysis result
            setIsAnalyzing(false);
            setMessage('Analysis complete!');
          } else if (statusRes.status === 'FAILURE') {
            clearInterval(intervalId);
            setError(`Analysis failed: ${statusRes.result?.error || 'Unknown error'}`);
            setIsAnalyzing(false);
          } else {
            setMessage(`Analysis status: ${statusRes.status}...`);
          }
        } catch (err: any) {
          clearInterval(intervalId);
          console.error('Polling error', err);
          setError(`System breach: Failed to get analysis status. ${err.message || ''}`);
          setIsAnalyzing(false);
        }
      }, 20000); // Poll every 20 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [analysisTaskId, setAnalysisResult, setIsAnalyzing, setError, scanId, setScanId, setMessage]); // Dependencies

  const modelsEffectRan = useRef(false);

  useEffect(() => {
    if (modelsEffectRan.current === false) {
      const fetchModels = async () => {
        try {
          const availableModels = await securityApi.listModels();
          setModels(availableModels);
        } catch (err) {
          console.error("Failed to fetch models", err);
        }
      };
      fetchModels();
    }
    return () => {
      modelsEffectRan.current = true;
    };
  }, []);

  const handleGenerate = async (type: ReportType) => {
    if (!scanId) return;

    setIsGenerating(true);
    // ### FIX: Set the report type state ###
    setCurrentReportType(type);
    setMessage(`Generating Your report now...`);

    try {
      const generationResponse = await securityApi.generateReport(scanId, type);
      setReportTaskId(generationResponse.task_id);
      setMessage('Report generation started. Waiting for report...');
    } catch (err) {
      console.error('Report generation error', err);
      setMessage('Critical error generating report.');
      setIsGenerating(false);
      setCurrentReportType(null); // Reset on error
    }
  };

  // Effect for polling report task status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const downloadFile = async (url: string, suggestedFilename: string) => {
      try {
        const fileResponse = await securityApi.downloadReport(url);
        const blob = new Blob([fileResponse.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', suggestedFilename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        return true;
      } catch (err) {
        console.error(`Failed to download file from ${url}`, err);
        return false;
      }
    };

    if (reportTaskId && currentReportType) { // Poll only if task ID and type exist
      intervalId = setInterval(async () => {
        try {
          const statusRes = await securityApi.getReportStatus(reportTaskId);
          if (statusRes.status === 'SUCCESS') {
            clearInterval(intervalId);
            const { pdf_report_url, docx_report_url } = statusRes.result;

            let downloadedPdf = false;

            // ### FIX: Use the state variable for the filename ###
            if (pdf_report_url) {
              setMessage('Downloading PDF report...');
              downloadedPdf = await downloadFile(
                pdf_report_url,
                `report_${scanId}_${currentReportType}.pdf`
              );
              if (downloadedPdf) {
                setMessage('Success: PDF report downloaded.');
              } else {
                setMessage('Failed to download PDF report.');
              }
            }

            if (docx_report_url) {
              console.log(`DOCX report generated at: ${docx_report_url}`);
            }

            if (!downloadedPdf) {
              setMessage('No reports were successfully downloaded.');
            }
            setIsGenerating(false);
            setCurrentReportType(null); // Clear type after completion
          } else if (statusRes.status === 'FAILURE') {
            clearInterval(intervalId);
            setError(`Report generation failed: ${statusRes.result?.error || 'Unknown error'}`);
            setIsGenerating(false);
            setCurrentReportType(null);
          } else {
            setMessage(`Report generation status: ${statusRes.status}...`);
          }
        } catch (err: any) {
          clearInterval(intervalId);
          console.error('Polling error', err);
          setError(`System breach: Failed to get report status. ${err.message || ''}`);
          setIsGenerating(false);
          setCurrentReportType(null);
        }
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [reportTaskId, currentReportType, scanId, setError, setMessage]); // Dependencies

  if (isAnalyzing) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-red-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold mono uppercase flicker">Scanning_Repository</h2>
          <p className="text-gray-500 mono text-xs animate-pulse">PATH: {githubUrl}</p>
          <div className="bg-white/5 border border-white/10 py-2 px-4 rounded-full inline-block mb-2">
            <p className="text-[10px] text-green-400 mono uppercase tracking-widest">
              <span className={`mr-2 ${!taskProgressMessage ? 'text-yellow-500 animate-pulse' : 'text-green-400'}`}>●</span>
              {taskProgressMessage ? (
                <>
                  {taskProgressMessage}<span className="flicker">.</span>
                </>
              ) : (
                <span className="text-gray-400">SERVER BUSY: INITIALIZING UPLINK...</span>
              )}
            </p>
          </div>
          {/* THE QUIRKY TEXT CONTAINER */}
          <div className="h-12 flex items-center justify-center">
            <p className="text-sm text-red-400/90 italic mono text-center transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
              &gt; {QUIRKY_MESSAGES[loadingTextIndex]}<span className="flicker">.</span>
            </p>
          </div>

          <div className="text-[10px] text-gray-700 mono mt-4 border-t border-white/5 pt-4">
            [SYS_LOG]: Decompiling artifacts...<br />
            [SYS_LOG]: Identifying dependencies...
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

  const endpoints = analysisResult?.framework_analysis?.llm_enriched?.endpoints || [];
  const findings = analysisResult?.findings || [];
  return (
    <div className="py-8 space-y-12">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors"
        title="Go Back"
      >
        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
      </button>
      {selectedEndpoint && (
        <EndpointDetailModal endpoint={selectedEndpoint} onClose={() => setSelectedEndpoint(null)} />
      )}
      {selectedFinding && (
        <VulnerabilityDetailModal finding={selectedFinding} onClose={() => setSelectedFinding(null)} />
      )}
      <div className="glass p-8 rounded-3xl border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded uppercase mono">Complete</span>
            <span className="text-gray-500 text-xs mono">SCAN_ID: {scanId}</span>
          </div>
          <h2 className="text-3xl font-bold">Analysis Completed.</h2>
          <p className="text-gray-400">Total of <span className="text-red-500 font-bold">{analysisResult?.total_findings}</span> findings identified in codebase.</p>
        </div>
      </div>

      {/* Found Vulnerabilities Section */}
      {findings.length > 0 && (
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">Found Vulnerabilities</h3>
            <span className="text-xs text-gray-500 mono">click to view details</span>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/10">
            <div className="grid grid-cols-3 gap-4 font-mono text-xs text-gray-400 mb-4 px-4">
              <div>ID</div>
              <div>Title</div>
              <div>Severity</div>
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-lg mb-2 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedFinding(finding)}
                >
                  <div className="text-red-400 truncate">{finding.id}</div>
                  <div className="truncate">{finding.title}</div>
                  <div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${finding.severity.toLowerCase() === 'critical' ? 'bg-red-700 text-red-100' :
                      finding.severity.toLowerCase() === 'high' ? 'bg-red-500 text-white' :
                        finding.severity.toLowerCase() === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-gray-500 text-white'
                      }`}>
                      {finding.severity}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ### NEW: API Endpoints Section ### */}
      {endpoints.length > 0 && (
            <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">API Endpoints Analytics</h3>
            <span className="text-xs text-gray-500 mono">click to view details</span>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/10 h-72 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endpoints.map((endpoint, index) => {
                const hasRisks = endpoint.security_risks && endpoint.security_risks.length > 0;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${hasRisks
                        ? 'bg-red-900/50 hover:bg-red-900/60'
                        : 'bg-white/5 hover:bg-white/10'
                      }`}
                  >
                    <p className="font-mono text-sm text-red-400 truncate">{endpoint.path}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      {endpoint.methods.map(method => (
                        <span key={method} className="px-1.5 py-0.5 bg-gray-700 text-white text-[9px] font-bold rounded mono">{method}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ################################ */}

      {/* Model Selection UI */}
      {/* <div className="space-y-6">
        <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">Select Generative Model</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              onClick={() => setSelectedModel(model.name)}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all h-full flex flex-col glass ${selectedModel === model.name
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
      </div> */}

      <div className="space-y-6">
        <h3 className="text-xl font-bold mono uppercase tracking-widest text-gray-400">Generate_Reporting_Artifacts</h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col opacity-40 pointer-events-none select-none">
            <h4 className="text-lg font-bold mb-4">Technical Report</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Deep dive into CVEs, dependency trees, and direct remediation code snippets.</p>
            <button
              disabled={true}
              className="w-full bg-red-600 py-3 rounded-lg text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
            >
              coming soon
            </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col opacity-40 pointer-events-none select-none">
            <h4 className="text-lg font-bold mb-4">Business Compliance</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Summary for stakeholders. Mapped to SOC2, HIPAA, and ISO27001 requirements.</p>
            <button
              disabled={true}
              className="w-full bg-blue-600 py-3 rounded-lg text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
            >
              coming soon
            </button>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
            <h4 className="text-lg font-bold mb-4">Complete security report</h4>
            <p className="text-gray-500 text-xs mb-8 flex-grow">Complete report with all findings, recommendations, and compliance mapping.</p>
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
