
import React, { useState } from 'react';
import { RoadmapStep } from '../types';

interface Props {
  steps: RoadmapStep[];
  nextPaths: string[];
  checkedTasks: Record<string, boolean>;
  onToggleTask: (phaseIndex: number, taskIndex: number) => void;
  onChooseNextPath: (path: string) => void;
  onAuditProgress: (state: Record<string, boolean>) => void;
  onResetProgress: () => void;
}

const Roadmap: React.FC<Props> = ({ 
  steps, nextPaths, checkedTasks, onToggleTask, 
  onChooseNextPath, onAuditProgress, onResetProgress
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0);
  const totalChecked = Object.values(checkedTasks).filter(Boolean).length;
  const isAllComplete = totalChecked === totalTasks && totalTasks > 0;

  const activeStep = steps[activeStepIndex];
  const phaseTasks = activeStep.tasks;
  const phaseCheckedCount = phaseTasks.filter((_, i) => checkedTasks[`${activeStepIndex}-${i}`]).length;
  const phaseProgress = phaseTasks.length > 0 ? (phaseCheckedCount / phaseTasks.length) * 100 : 0;

  if (isAllComplete) {
    return (
      <div className="glass rounded-[3rem] border-emerald-500/30 p-16 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
        <div className="absolute -top-12 -right-12 text-[14rem] font-black text-emerald-500 opacity-[0.05] select-none pointer-events-none italic tracking-tighter">
          LEGEND
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-5xl font-black text-white tracking-tighter italic uppercase">Synchronization Complete</h4>
          <p className="text-slate-400 max-w-lg leading-relaxed font-medium">
            Maximum synchronization achieved. Your neural profile is now fully aligned with your objective tier.
          </p>
          <div className="w-full pt-12 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {nextPaths.map((path, i) => (
              <button 
                key={i} onClick={() => onChooseNextPath(path)}
                className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl text-left hover:border-indigo-500/40 hover:bg-slate-800 transition-all group"
              >
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 font-mono">Unlock Next Evolution</p>
                <p className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase italic">{path}</p>
              </button>
            ))}
          </div>
          <button onClick={onResetProgress} className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest font-mono">Review Trajectory History</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 no-scrollbar border-b border-slate-800/50">
        {steps.map((_, index) => {
          const isPhaseComplete = steps[index].tasks.every((_, taskIdx) => checkedTasks[`${index}-${taskIdx}`]);
          return (
            <button
              key={index}
              onClick={() => setActiveStepIndex(index)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] font-mono transition-all shrink-0 border ${
                activeStepIndex === index
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  : isPhaseComplete 
                    ? 'bg-emerald-950/20 text-emerald-500 border-emerald-900/30'
                    : 'glass text-slate-500 border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              Uplink_{index + 1}
              {isPhaseComplete && <svg className="w-3 h-3 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
            </button>
          );
        })}
      </div>

      <div className="glass rounded-[3rem] border-indigo-500/10 p-10 shadow-2xl relative group min-h-[500px] flex flex-col">
        <div className="absolute -top-10 -right-10 text-[14rem] font-black text-white opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity italic leading-none">
          {activeStepIndex + 1}
        </div>

        <div className="relative z-10 flex flex-col flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8 mb-12">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 font-mono">Tactical Objective</span>
              <h4 className="text-3xl sm:text-4xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">{activeStep.title}</h4>
              <p className="text-slate-500 font-mono text-[10px] uppercase">{activeStep.duration} Duration</p>
            </div>
            
            <div className="glass p-4 rounded-3xl border-indigo-500/10 flex items-center space-x-6 self-start backdrop-blur-3xl shadow-2xl">
               <div className="relative w-16 h-16">
                 <svg className="w-full h-full -rotate-90">
                   <circle className="text-slate-900" strokeWidth="5" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                   <circle 
                    className="text-indigo-500 transition-all duration-1000" 
                    strokeWidth="5" strokeDasharray={175.9} 
                    strokeDashoffset={175.9 - (175.9 * phaseProgress) / 100} 
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" 
                   />
                 </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white font-mono">{Math.round(phaseProgress)}%</span>
               </div>
               <div className="pr-4">
                  <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] font-mono mb-1">Module Sync</span>
                  <span className="block text-sm font-black text-white uppercase italic">{phaseCheckedCount}/{phaseTasks.length} OBJ_DONE</span>
               </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mb-12 font-medium italic">"{activeStep.description}"</p>

          <div className="space-y-4 flex-grow">
            <div className="flex items-center mb-6">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] font-mono">Mission Objectives</h5>
              <div className="ml-6 flex-grow border-t border-indigo-500/10"></div>
              <button onClick={() => onAuditProgress(checkedTasks)} className="ml-6 text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest font-mono flex items-center bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10 hover:bg-indigo-500/20 transition-all">RE_SYNC_ADAPT</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {phaseTasks.map((task, i) => {
                const isChecked = !!checkedTasks[`${activeStepIndex}-${i}`];
                return (
                  <div 
                    key={i} onClick={() => onToggleTask(activeStepIndex, i)}
                    className={`flex items-start p-6 rounded-3xl border transition-all cursor-pointer group/item ${
                      isChecked ? 'bg-indigo-950/20 border-indigo-500/20 text-slate-500' : 'glass border-slate-800 hover:border-indigo-500/40 text-slate-100 shadow-lg'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-xl border flex items-center justify-center mr-5 mt-0.5 shrink-0 transition-all duration-300 ${
                      isChecked ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'border-slate-700 group-hover/item:border-indigo-400'
                    }`}>
                      {isChecked && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm select-none font-bold uppercase italic tracking-tight ${isChecked ? 'line-through opacity-30' : ''}`}>{task}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-900/50">
             <button 
               disabled={activeStepIndex === 0}
               onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
               className="text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-0 transition-all flex items-center py-2 px-6 rounded-2xl glass font-mono uppercase"
             >
               PREV_UPLINK
             </button>
             <button 
               disabled={activeStepIndex === steps.length - 1}
               onClick={() => setActiveStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
               className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-4 px-10 rounded-[2rem] transition-all disabled:opacity-0 flex items-center shadow-xl shadow-indigo-600/20 uppercase tracking-widest italic"
             >
               NEXT_TRAJECTORY
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
