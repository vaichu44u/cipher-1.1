
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ProfileInputs, 
  AnalysisState, 
  CareerPath 
} from './types';
import { analyzeCareer } from './services/geminiService';
import RadarChart from './components/RadarChart';
import Roadmap from './components/Roadmap';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<ProfileInputs>({
    dreamCareer: '',
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

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInputs(prev => ({ ...prev, resumeFile: e.target.files![0] }));
    }
  };

  const runAnalysis = async (customDreamCareer?: string) => {
    const activeInputs = {
      ...inputs,
      dreamCareer: customDreamCareer || inputs.dreamCareer
    };
    
    if (customDreamCareer) {
      setInputs(activeInputs);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, sources } = await analyzeCareer(activeInputs);
      setState({
        isLoading: false,
        result: data,
        sources: sources,
        error: null,
      });
      // Scroll to top on new result
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
          error: "An unexpected error occurred during analysis. Please check your profiles and try again.",
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

      {/* Header */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini 3 Pro Online</span>
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
                Your path to the top, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">mapped by AI.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Unlock your personalized career roadmap. We analyze your professional footprint to build a data-driven path to your dream role.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden">
              <div className="p-8 sm:p-12 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                    Target Career Path
                  </label>
                  <input
                    type="text"
                    name="dreamCareer"
                    required
                    value={inputs.dreamCareer}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-900/30 transition-all outline-none text-white placeholder:text-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-600 font-bold text-sm">@</span>
                      </div>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={inputs.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/username"
                        className="w-full pl-10 pr-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </div>
                      <input
                        type="url"
                        name="githubUrl"
                        value={inputs.githubUrl}
                        onChange={handleInputChange}
                        placeholder="github.com/username"
                        className="w-full pl-12 pr-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white placeholder:text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                    Resume Upload
                  </label>
                  <div className="relative border-2 border-dashed border-slate-800 rounded-3xl p-10 hover:border-indigo-600/50 hover:bg-indigo-900/10 transition-all group cursor-pointer text-center">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold">{inputs.resumeFile ? inputs.resumeFile.name : "Choose a file or drag here"}</p>
                        <p className="text-slate-500 text-sm mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="px-4 text-[10px] font-black text-slate-600 uppercase">OR PASTE DIRECTLY</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <textarea
                  name="resumeText"
                  rows={4}
                  value={inputs.resumeText}
                  onChange={handleInputChange}
                  placeholder="Paste your resume content here..."
                  className="w-full px-6 py-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none text-white placeholder:text-slate-700 font-medium"
                ></textarea>
              </div>

              <div className="bg-slate-950/50 p-10 sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-slate-800">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                   </div>
                   <div className="text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Engine</p>
                     <p className="text-xs text-slate-500">Live Web & Market Analysis</p>
                   </div>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-12 rounded-[2rem] transition-all shadow-2xl shadow-indigo-600/20 hover:scale-105 active:scale-95 flex items-center justify-center text-sm uppercase tracking-widest"
                >
                  Assemble Roadmap
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : state.isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-12">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-[6px] border-slate-900"></div>
              <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-3xl font-black text-white tracking-tight">Processing Career Intelligence</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Scanning professional profiles, cross-referencing market data, and synthesizing your growth strategy...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Analysis Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Assessment, Outlook, Vibe Check */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-5 flex items-center">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                    Current Assessment
                  </h3>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/50">
                    <p className="text-slate-300 leading-relaxed text-sm">
                      {state.result?.currentAssessment}
                    </p>
                  </div>
                </div>

                {/* 30-Day Vibe Check */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-950 rounded-[2rem] p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 pointer-events-none">
                    <svg className="w-16 h-16 text-indigo-500/10 group-hover:text-indigo-500/20 transition-all duration-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">
                        Coach's Note
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">{state.result?.vibeCheck30Day.title}</h3>
                    <p className="text-indigo-200/60 text-xs italic leading-relaxed mb-6 border-l-2 border-indigo-500/40 pl-4">
                      "{state.result?.vibeCheck30Day.description}"
                    </p>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Early Progress Targets</p>
                      {state.result?.vibeCheck30Day.milestones.map((m, i) => (
                        <div key={i} className="flex items-center text-xs text-indigo-100/80 bg-slate-950/40 p-3 rounded-xl border border-indigo-500/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-3 shrink-0 shadow-[0_0_12px_rgba(129,140,248,0.8)]"></div>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Lab */}
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white flex items-center">
                      <svg className="h-5 w-5 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Profile Lab
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 relative">
                      <button 
                        onClick={copyKeywords}
                        className="absolute top-4 right-4 text-[10px] font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Target Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {state.result?.profileOptimization.keywords.map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] rounded-lg font-bold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">LinkedIn Enhancements</p>
                        <ul className="space-y-2.5">
                          {state.result?.profileOptimization.linkedinTips.map((tip, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start bg-slate-950/30 p-3 rounded-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3 mt-1.5 shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Resume Pivot Advice</p>
                        <ul className="space-y-2.5">
                          {state.result?.profileOptimization.resumeTips.map((tip, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start bg-slate-950/30 p-3 rounded-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3 mt-1.5 shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grounding Sources */}
                <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest text-center">Market Validation Logic</h3>
                  <div className="space-y-2">
                    {state.sources.length > 0 ? state.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        className="flex items-center p-4 rounded-2xl border border-slate-800 hover:bg-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <svg className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-400 truncate group-hover:text-slate-100">{source.title}</span>
                      </a>
                    )) : (
                      <p className="text-xs text-slate-600 italic text-center">No search grounding required for this context.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Skills, Roadmap, Learning */}
              <div className="lg:col-span-2 space-y-8">
                {/* Skills Analysis */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-20">
                      <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                   </div>
                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <h3 className="text-2xl font-black text-white tracking-tight">Skills Gap Map</h3>
                    <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center text-indigo-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> You</span>
                      <span className="flex items-center text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Industry</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-3xl border border-slate-800/50 p-6">
                    <RadarChart data={state.result?.skillsGap || []} />
                  </div>
                </div>

                {/* The Roadmap (Checklist) */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">The Mission Plan</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">A sequence-controlled roadmap focusing on your highest priority growth areas.</p>
                  </div>
                  <Roadmap 
                    steps={state.result?.roadmap || []} 
                    nextPaths={state.result?.suggestedNextPaths || []}
                    onChooseNextPath={handleChooseNextPath}
                  />
                </div>

                {/* Suggested Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {state.result?.projects.map((project, i) => (
                    <div key={i} className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col shadow-lg">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          project.difficulty === 'Beginner' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' :
                          project.difficulty === 'Intermediate' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
                        }`}>
                          {project.difficulty}
                        </span>
                        <svg className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      </div>
                      <h4 className="text-xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors leading-tight">{project.title}</h4>
                      <p className="text-slate-400 text-xs mb-8 leading-relaxed flex-grow">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800">
                        {project.techStack.map((tech, j) => (
                          <span key={j} className="text-[10px] font-mono font-black bg-slate-950 text-indigo-400/80 px-2.5 py-1 rounded-lg border border-slate-800">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Learning Path */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-xl">
                  <h3 className="text-2xl font-black text-white tracking-tight mb-8">Curated Intelligence</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.result?.learningResources.map((res, i) => (
                      <div key={i} className="flex flex-col p-6 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-600/30 transition-all group/res">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                            res.type === 'Course' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/20' :
                            res.type === 'Article' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' :
                            res.type === 'Open Source' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {res.type}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{res.platform}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover/res:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-6">{res.title}</h4>
                        <div className="mt-auto flex justify-end">
                           <a 
                             href={res.url !== 'URL if known or placeholder' ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.title + " " + res.platform)}`} 
                             target="_blank" 
                             className="text-[10px] font-black text-indigo-400 flex items-center hover:translate-x-1 transition-transform uppercase tracking-widest group-hover/res:underline underline-offset-4"
                           >
                             Execute Path
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                             </svg>
                           </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-20">
              <button 
                onClick={() => setState({ isLoading: false, result: null, error: null, sources: [] })}
                className="bg-slate-900 border-2 border-slate-800 hover:border-slate-700 text-slate-400 font-black py-4 px-12 rounded-[2rem] transition-all flex items-center space-x-3 text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span>New Strategy Session</span>
              </button>
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
                Attempt Recovery
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Persistent CTA on mobile */}
      {state.result && (
        <div className="fixed bottom-8 right-8 lg:hidden z-50">
          <button className="bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl shadow-indigo-600/40 active:scale-95 transition-transform border border-indigo-400/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
