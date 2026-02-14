
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
import ProjectLab from './components/ProjectLab';
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

  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [checkedMilestones, setCheckedMilestones] = useState<Record<number, boolean>>({});
  const [checkedProjects, setCheckedProjects] = useState<Record<number, boolean>>({});
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Persistence
  useEffect(() => {
    if (state.result) {
      const storageKey = `career_ascension_${btoa(state.result.roadmap[0]?.title || 'default').slice(0, 16)}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCheckedTasks(parsed.tasks || {});
          setCheckedMilestones(parsed.milestones || {});
          setCheckedProjects(parsed.projects || {});
        } catch (e) { console.error("Sync Fault"); }
      }
    }
  }, [state.result]);

  useEffect(() => {
    if (state.result) {
      const storageKey = `career_ascension_${btoa(state.result.roadmap[0]?.title || 'default').slice(0, 16)}`;
      localStorage.setItem(storageKey, JSON.stringify({
        tasks: checkedTasks,
        milestones: checkedMilestones,
        projects: checkedProjects
      }));
    }
  }, [checkedTasks, checkedMilestones, checkedProjects, state.result]);

  const completionRatio = useMemo(() => {
    if (!state.result) return 0;
    const roadmapTotal = state.result.roadmap.reduce((acc, step) => acc + step.tasks.length, 0);
    const roadmapChecked = Object.values(checkedTasks).filter(Boolean).length;
    const roadmapScore = roadmapTotal > 0 ? (roadmapChecked / roadmapTotal) * 0.7 : 0;
    const projectsTotal = state.result.projects.length;
    const projectsChecked = Object.values(checkedProjects).filter(Boolean).length;
    const projectsScore = projectsTotal > 0 ? (projectsChecked / projectsTotal) * 0.3 : 0.3;
    return roadmapScore + projectsScore;
  }, [checkedTasks, checkedProjects, state.result]);

  const runAnalysis = async (customDreamCareer?: string, roadmapState?: Record<string, boolean>) => {
    const activeInputs: ProfileInputs = {
      ...inputs,
      dreamCareer: customDreamCareer || inputs.dreamCareer,
      roadmapState: roadmapState
    };
    if (customDreamCareer) setInputs(activeInputs);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    if (!roadmapState && !customDreamCareer) {
      setCheckedTasks({}); setCheckedMilestones({}); setCheckedProjects({});
    }
    try {
      const { data, sources } = await analyzeCareer(activeInputs);
      setState({ isLoading: false, result: data, sources: sources, error: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.message === "API_KEY_RESET") setShowKeyModal(true);
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); runAnalysis(); };

  return (
    <div className="min-h-screen pb-20 relative">
      <ApiKeyModal isOpen={showKeyModal} onSuccess={() => setShowKeyModal(false)} />

      {/* Navigation */}
      <nav className="glass sticky top-0 z-40 border-b border-indigo-500/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">Pathfinder<span className="text-indigo-400 font-normal ml-1">AI</span></span>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="px-4 py-1.5 rounded-full glass border-indigo-500/20 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></div>
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest font-mono">Neural Uplink Active</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 relative z-10">
        {!state.result && !state.isLoading ? (
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic animate-in fade-in zoom-in-95 duration-700">
                Ascend Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-600 drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">Career Path.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium tracking-tight">
                Neural architecture for the modern professional. Uplink your profiles to calculate your path to legend.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass rounded-[3rem] p-1 border-indigo-500/10 shadow-3xl overflow-hidden group">
              <div className="p-8 sm:p-12 space-y-8 bg-slate-950/40 rounded-[2.9rem]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-[0.3em] font-mono">Target Mission Objective</label>
                    <input
                      type="text"
                      name="dreamCareer"
                      required
                      value={inputs.dreamCareer}
                      onChange={(e) => setInputs(p => ({...p, dreamCareer: e.target.value}))}
                      placeholder="e.g. Senior Cloud Architect"
                      className="w-full px-8 py-5 bg-slate-900/50 border-2 border-slate-800/50 rounded-2xl focus:border-indigo-500 outline-none text-white font-black text-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-[0.3em] font-mono">Current Tier</label>
                    <select
                      name="experienceLevel"
                      value={inputs.experienceLevel}
                      onChange={(e) => setInputs(p => ({...p, experienceLevel: e.target.value as any}))}
                      className="w-full px-8 py-5 bg-slate-900/50 border-2 border-slate-800/50 rounded-2xl focus:border-indigo-500 outline-none text-white font-black appearance-none"
                    >
                      <option value="Entry">Tier 1: Entry</option>
                      <option value="Mid">Tier 2: Professional</option>
                      <option value="Senior">Tier 3: Elite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-6 rounded-3xl border-indigo-500/10">
                    <label className="block text-[10px] font-black text-indigo-400 mb-6 uppercase tracking-[0.3em] font-mono">Temporal Allocation ({inputs.weeklyCommitment}H/WK)</label>
                    <input
                      type="range"
                      min="2" max="60" step="2"
                      value={inputs.weeklyCommitment}
                      onChange={(e) => setInputs(p => ({...p, weeklyCommitment: parseInt(e.target.value)}))}
                      className="w-full accent-indigo-500 h-1.5 rounded-lg appearance-none bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-200 leading-relaxed font-mono">
                    <svg className="w-5 h-5 mr-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Trajectory will be calibrated to a {inputs.weeklyCommitment}h bandwidth window.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    type="url"
                    placeholder="LinkedIn Profile URL"
                    value={inputs.linkedinUrl}
                    onChange={(e) => setInputs(p => ({...p, linkedinUrl: e.target.value}))}
                    className="w-full px-8 py-5 bg-slate-900/50 border-2 border-slate-800/50 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium text-sm transition-all"
                  />
                  <input
                    type="url"
                    placeholder="GitHub Portfolio URL"
                    value={inputs.githubUrl}
                    onChange={(e) => setInputs(p => ({...p, githubUrl: e.target.value}))}
                    className="w-full px-8 py-5 bg-slate-900/50 border-2 border-slate-800/50 rounded-2xl focus:border-indigo-500 outline-none text-white font-medium text-sm transition-all"
                  />
                </div>

                <div className="relative group/file">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover/file:bg-indigo-500/10 transition-all"></div>
                  <div className="relative border-2 border-dashed border-slate-800 rounded-[2rem] p-12 hover:border-indigo-500/40 hover:bg-slate-900/20 transition-all text-center">
                    <input type="file" onChange={(e) => setInputs(p => ({...p, resumeFile: e.target.files?.[0] || null}))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-4 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover/file:text-indigo-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-white font-black tracking-tight uppercase text-sm">
                        {inputs.resumeFile ? inputs.resumeFile.name : "Inject Career Data (PDF)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-8 sm:px-12 flex justify-center sm:justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-6 px-16 rounded-[2rem] transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center text-sm uppercase tracking-[0.2em] italic glitch-hover"
                >
                  Initiate Uplink
                  <svg className="w-5 h-5 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : state.isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-12">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-[1px] border-cyan-500 border-b-transparent animate-spin duration-1000"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-indigo-400 animate-pulse font-mono">CALC_PATH</span>
              </div>
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Pathfinder Syncing...</h2>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Architecting Neural Trajectory | Market Intel Scanning</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {state.result?.agentReasoning && <AgentLog reasoning={state.result.agentReasoning} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-12">
                <div className="glass rounded-[2.5rem] p-10 border-indigo-500/10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
                  <h3 className="text-[10px] font-black text-indigo-400 mb-8 flex items-center uppercase tracking-[0.4em] font-mono">Tactical Briefing</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-b border-slate-800 pb-2">
                       <span className="bg-indigo-950 px-2 py-0.5 rounded text-indigo-400">STATUS: {inputs.experienceLevel}</span>
                       <span className="bg-indigo-950 px-2 py-0.5 rounded text-indigo-400">BANDWIDTH: {inputs.weeklyCommitment}H</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-medium italic text-sm">"{state.result?.currentAssessment}"</p>
                  </div>
                </div>

                {state.result?.vibeCheck30Day && (
                  <VibeCheckTree 
                    data={state.result.vibeCheck30Day} 
                    checkedMilestones={checkedMilestones}
                    onToggleMilestone={(idx) => setCheckedMilestones(p => ({...p, [idx]: !p[idx]}))}
                  />
                )}
              </div>

              <div className="lg:col-span-2 space-y-16">
                <div className="glass rounded-[3rem] p-12 border-indigo-500/10 shadow-2xl relative">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Neural Skill-Map</h3>
                    <div className="px-5 py-2 glass border-indigo-500/30 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">
                      SYNC: {Math.round(completionRatio * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-10 border border-slate-800/50">
                    <RadarChart data={state.result?.skillsGap || []} completionRatio={completionRatio} />
                  </div>
                </div>

                <div className="glass rounded-[3rem] p-12 border-indigo-500/10 shadow-2xl">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Ascension Roadmap</h3>
                    <button 
                      onClick={() => { if(window.confirm("Pivoting path. Progress will be recalibrated. Continue?")) setState(p => ({...p, result: null})) }}
                      className="text-[10px] font-black text-slate-500 hover:text-white transition-all bg-slate-950 px-6 py-2 rounded-xl border border-slate-800 uppercase font-mono"
                    >
                      Recalibrate Path
                    </button>
                  </div>
                  <Roadmap 
                    steps={state.result?.roadmap || []} 
                    nextPaths={state.result?.suggestedNextPaths || []}
                    checkedTasks={checkedTasks}
                    onToggleTask={(pi, ti) => setCheckedTasks(p => ({...p, [`${pi}-${ti}`]: !p[`${pi}-${ti}`]}))}
                    onChooseNextPath={(p) => runAnalysis(p)}
                    onAuditProgress={(rs) => runAnalysis(undefined, rs)}
                    onResetProgress={() => setCheckedTasks({})}
                  />
                </div>

                {state.result?.projects && state.result.projects.length > 0 && (
                  <ProjectLab 
                    projects={state.result.projects}
                    checkedProjects={checkedProjects}
                    onToggleProject={(idx) => setCheckedProjects(p => ({...p, [idx]: !p[idx]}))}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
