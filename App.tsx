
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ProfileInputs, 
  AnalysisState, 
  CareerPath 
} from './types';
import { analyzeCareer } from './services/geminiService';
import RadarChart from './components/RadarChart';
import Roadmap from './components/Roadmap';
import VibeCheckTree from './components/VibeCheckTree';
import AgentLog from './components/AgentLog';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<ProfileInputs>({
    dreamCareer: '',
    experienceLevel: 'Mid',
    weeklyCommitment: 10,
    linkedinUrl: '',
    githubUrl: '',
    resumeFile: null,
    resumeText: '',
  });

  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    sources: [],
  });

  // Checklist states
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [checkedMilestones, setCheckedMilestones] = useState<Record<number, boolean>>({});

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Persistence management
  useEffect(() => {
    if (state.result) {
      const storageKey = `career_roadmap_${btoa(state.result.roadmap[0]?.title || 'default').slice(0, 16)}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCheckedTasks(parsed.tasks || {});
          setCheckedMilestones(parsed.milestones || {});
        } catch (e) {
          console.error("Failed to parse saved progress");
        }
      }
    }
  }, [state.result]);

  useEffect(() => {
    if (state.result) {
      const storageKey = `career_roadmap_${btoa(state.result.roadmap[0]?.title || 'default').slice(0, 16)}`;
      localStorage.setItem(storageKey, JSON.stringify({
        tasks: checkedTasks,
        milestones: checkedMilestones
      }));
    }
  }, [checkedTasks, checkedMilestones, state.result]);

  // Calculate completion ratio for the radar chart
  const completionRatio = useMemo(() => {
    if (!state.result) return 0;
    const totalTasks = state.result.roadmap.reduce((acc, step) => acc + step.tasks.length, 0);
    if (totalTasks === 0) return 0;
    const checkedCount = Object.values(checkedTasks).filter(Boolean).length;
    return checkedCount / totalTasks;
  }, [checkedTasks, state.result]);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (typeof window.aistudio !== 'undefined') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) setShowKeyModal(true);
      }
    };
    checkKey();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ 
      ...prev, 
      [name]: name === 'weeklyCommitment' ? parseInt(value) || 0 : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInputs(prev => ({ ...prev, resumeFile: e.target.files![0] }));
    }
  };

  const runAnalysis = async (customDreamCareer?: string, roadmapState?: Record<string, boolean>) => {
    const activeInputs: ProfileInputs = {
      ...inputs,
      dreamCareer: customDreamCareer || inputs.dreamCareer,
      roadmapState: roadmapState
    };
    
    if (customDreamCareer) {
      setInputs(activeInputs);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Clear checklist states on new analysis (if not an audit)
    if (!roadmapState && !customDreamCareer) {
      setCheckedTasks({});
      setCheckedMilestones({});
    }

    try {
      const { data, sources } = await analyzeCareer(activeInputs);
      setState({
        isLoading: false,
        result: data,
        sources: sources,
        error: null,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.message === "API_KEY_RESET") {
        setShowKeyModal(true);
        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        setState({
          isLoading: false,
          result: null,
          sources: [],
          error: err.message || "An unexpected error occurred during analysis.",
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis();
  };

  const handleChooseNextPath = (nextPath: string) => {
    runAnalysis(nextPath);
  };

  const handleAuditProgress = (roadmapState: Record<string, boolean>) => {
    runAnalysis(undefined, roadmapState);
  };

  const handleToggleTask = (phaseIndex: number, taskIndex: number) => {
    const key = `${phaseIndex}-${taskIndex}`;
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleMilestone = (index: number) => {
    setCheckedMilestones(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyKeywords = () => {
    if (state.result) {
      navigator.clipboard.writeText(state.result.profileOptimization.keywords.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <ApiKeyModal isOpen={showKeyModal} onSuccess={() => setShowKeyModal(false)} />

      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CareerCopilot<span className="text-indigo-400">AI</span></span>
            </div>
            <div className="hidden sm:block">
              <div className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Engine Sync Active</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {!state.result && !state.isLoading ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                Your career agent, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">at your service.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Personalized strategy based on your experience, availability, and professional footprint.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
              <div className="p-8 sm:p-12 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Target Career Goal</label>
                    <input
                      type="text"
                      name="dreamCareer"
                      required
                      value={inputs.dreamCareer}
                      onChange={handleInputChange}
                      placeholder="e.g. Lead Product Designer"
                      className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Current Level</label>
                    <select
                      name="experienceLevel"
                      value={inputs.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium appearance-none"
                    >
                      <option value="Entry">Entry/Junior</option>
                      <option value="Mid">Mid-Level</option>
                      <option value="Senior">Senior/Lead</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Weekly Time Commitment (Hours)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        name="weeklyCommitment"
                        min="2"
                        max="60"
                        step="2"
                        value={inputs.weeklyCommitment}
                        onChange={handleInputChange}
                        className="flex-grow accent-indigo-500"
                      />
                      <span className="w-12 text-center font-black text-indigo-400">{inputs.weeklyCommitment}h</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <svg className="w-5 h-5 mr-3 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Agent will calibrate task density to your {inputs.weeklyCommitment}h/week window.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">LinkedIn Profile</label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={inputs.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">GitHub Profile</label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={inputs.githubUrl}
                      onChange={handleInputChange}
                      placeholder="github.com/username"
                      className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Resume Attachment</label>
                  <div className="relative border-2 border-dashed border-slate-800 rounded-3xl p-8 hover:border-indigo-600/50 hover:bg-indigo-900/10 transition-all text-center">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <p className="text-white font-bold">{inputs.resumeFile ? inputs.resumeFile.name : "Drop Resume (PDF/JPG)"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/50 p-10 sm:px-12 flex justify-end border-t border-slate-800">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-12 rounded-[2rem] transition-all shadow-2xl flex items-center text-sm uppercase tracking-widest"
                >
                  Initiate Strategic Planning
                </button>
              </div>
            </form>
          </div>
        ) : state.isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-[4px] border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-white">Agent is Processing Strategy...</h2>
            <p className="text-slate-500 text-sm italic">"Deep thinking enabled: evaluating market trends and experience gaps..."</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {state.result?.agentReasoning && (
              <AgentLog reasoning={state.result.agentReasoning} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-5 flex items-center uppercase tracking-widest">Personal Brief</h3>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 mb-4 border-b border-slate-800 pb-2">
                       <span>LVL: {inputs.experienceLevel}</span>
                       <span>COMMIT: {inputs.weeklyCommitment}H/WK</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm">{state.result?.currentAssessment}</p>
                  </div>
                </div>

                {state.result?.vibeCheck30Day && (
                  <VibeCheckTree 
                    data={state.result.vibeCheck30Day} 
                    checkedMilestones={checkedMilestones}
                    onToggleMilestone={handleToggleMilestone}
                  />
                )}

                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm overflow-hidden">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest text-center">Market Validation</h3>
                  <div className="space-y-2">
                    {state.sources.map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" className="flex items-center p-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs text-slate-400 truncate">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl overflow-hidden relative">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight">Evolving Skills Discrepancy</h3>
                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[10px] font-black text-indigo-400 uppercase">
                      Progress: {Math.round(completionRatio * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-3xl p-6">
                    <RadarChart 
                      data={state.result?.skillsGap || []} 
                      completionRatio={completionRatio} 
                    />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-white">Active Roadmap</h3>
                    <div className="flex space-x-3">
                       <button 
                         onClick={() => {
                            if(window.confirm("Pivoting will reset current progress. Continue?")) {
                              setState({ isLoading: false, result: null, error: null, sources: [] });
                              setCheckedTasks({});
                              setCheckedMilestones({});
                            }
                         }}
                         className="text-[10px] font-black text-slate-500 hover:text-white transition-colors bg-slate-950 px-4 py-2 rounded-xl border border-slate-800"
                       >
                         Pivot Path
                       </button>
                    </div>
                  </div>
                  <Roadmap 
                    steps={state.result?.roadmap || []} 
                    nextPaths={state.result?.suggestedNextPaths || []}
                    checkedTasks={checkedTasks}
                    onToggleTask={handleToggleTask}
                    onChooseNextPath={handleChooseNextPath}
                    onAuditProgress={handleAuditProgress}
                    onResetProgress={() => {
                      if(window.confirm("Reset all current roadmap progress?")) {
                        setCheckedTasks({});
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {state.error && (
          <div className="mt-12 max-w-2xl mx-auto bg-rose-950/20 border-2 border-rose-900/50 text-rose-300 p-8 rounded-[2rem] flex items-start space-x-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-900/40 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-black mb-2 tracking-tight">System Fault</p>
              <p className="text-sm opacity-90 leading-relaxed mb-6">{state.error}</p>
              <button 
                onClick={() => runAnalysis()} 
                className="bg-rose-900/40 hover:bg-rose-900/60 text-rose-100 text-[10px] font-black py-3 px-6 rounded-xl transition-all border border-rose-800 uppercase tracking-widest"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
