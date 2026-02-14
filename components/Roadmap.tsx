
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
  steps, 
  nextPaths, 
  checkedTasks, 
  onToggleTask, 
  onChooseNextPath, 
  onAuditProgress,
  onResetProgress
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Calculate global progress
  const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0);
  const totalChecked = Object.values(checkedTasks).filter(Boolean).length;
  const isAllComplete = totalChecked === totalTasks && totalTasks > 0;

  const activeStep = steps[activeStepIndex];
  const currentPhaseTasks = activeStep.tasks;
  const completedInCurrentPhase = currentPhaseTasks.filter((_, i) => checkedTasks[`${activeStepIndex}-${i}`]).length;
  const phaseProgress = currentPhaseTasks.length > 0 
    ? (completedInCurrentPhase / currentPhaseTasks.length) * 100 
    : 0;

  if (isAllComplete) {
    return (
      <div className="bg-slate-950 rounded-[2rem] border border-emerald-500/30 p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
        <div className="absolute -top-12 -right-12 text-[12rem] font-black text-emerald-500 opacity-[0.05] select-none pointer-events-none italic">
          Done
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h4 className="text-3xl font-black text-white tracking-tight">Mission Accomplished</h4>
          <p className="text-slate-400 max-w-lg leading-relaxed">
            You've successfully completed every milestone on your path. You are now fully prepared for your role.
          </p>

          <div className="w-full pt-10 border-t border-slate-900 mt-10">
             <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Choose Your Next Evolution</h5>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {nextPaths.map((path, i) => (
                 <button 
                   key={i}
                   onClick={() => onChooseNextPath(path)}
                   className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-left hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
                 >
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Advanced Specialization</p>
                   <p className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{path}</p>
                 </button>
               ))}
             </div>
             <button 
              onClick={onResetProgress}
              className="mt-8 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors"
             >
               Review Previous Steps
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-800/50">
        {steps.map((_, index) => {
          const isPhaseComplete = steps[index].tasks.every((_, taskIdx) => checkedTasks[`${index}-${taskIdx}`]);
          return (
            <button
              key={index}
              onClick={() => setActiveStepIndex(index)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border whitespace-nowrap flex items-center ${
                activeStepIndex === index
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                  : isPhaseComplete 
                    ? 'bg-emerald-950/20 text-emerald-500 border-emerald-900/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              Phase {index + 1}
              {isPhaseComplete && (
                <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-950 rounded-[2rem] border border-indigo-500/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden group min-h-[480px] flex flex-col">
        <div className="absolute -top-6 -right-6 text-[10rem] font-black text-white opacity-[0.02] select-none pointer-events-none group-hover:opacity-[0.04] transition-opacity italic leading-none">
          {activeStepIndex + 1}
        </div>

        <div className="relative z-10 flex flex-col flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                  Mission Milestone
                </span>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {activeStep.duration}
                </span>
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                {activeStep.title}
              </h4>
            </div>
            
            <div className="bg-slate-900/40 backdrop-blur-md p-3 rounded-2xl border border-slate-800/50 flex items-center space-x-4 self-start">
               <div className="relative w-12 h-12">
                 <svg className="w-full h-full -rotate-90">
                   <circle className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="transparent" r="22" cx="24" cy="24" />
                   <circle 
                    className="text-indigo-500 transition-all duration-700 ease-out" 
                    strokeWidth="4" 
                    strokeDasharray={138.2} 
                    strokeDashoffset={138.2 - (138.2 * phaseProgress) / 100} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="22" 
                    cx="24" 
                    cy="24" 
                   />
                 </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{Math.round(phaseProgress)}%</span>
               </div>
               <div className="pr-2">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Phase Progress</span>
                  <span className="block text-[10px] font-bold text-indigo-400">{completedInCurrentPhase}/{currentPhaseTasks.length} Done</span>
               </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              {activeStep.description}
            </p>
          </div>

          <div className="space-y-3 flex-grow">
            <div className="flex items-center mb-4">
              <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Execution Checklist</h5>
              <div className="ml-4 flex-grow border-t border-slate-900/50"></div>
              <button 
                onClick={() => onAuditProgress(checkedTasks)}
                className="ml-4 text-[8px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-colors flex items-center"
              >
                Audit Strategy
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {currentPhaseTasks.map((task, i) => {
                const isChecked = !!checkedTasks[`${activeStepIndex}-${i}`];
                return (
                  <div 
                    key={i} 
                    onClick={() => onToggleTask(activeStepIndex, i)}
                    className={`flex items-start p-4 rounded-2xl border transition-all cursor-pointer group/item ${
                      isChecked 
                        ? 'bg-indigo-950/20 border-indigo-500/20 text-slate-400' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/40 text-slate-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center mr-4 mt-0.5 shrink-0 transition-all duration-300 ${
                      isChecked 
                        ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]' 
                        : 'border-slate-700 group-hover/item:border-indigo-400'
                    }`}>
                      {isChecked && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm select-none font-medium leading-snug ${isChecked ? 'line-through opacity-40' : ''}`}>
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-900/80">
             <button 
               disabled={activeStepIndex === 0}
               onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
               className="text-[10px] font-black text-slate-500 hover:text-white disabled:opacity-0 transition-all flex items-center py-2 px-4 rounded-xl hover:bg-slate-900 uppercase tracking-widest"
             >
               Back
             </button>

             <button 
               disabled={activeStepIndex === steps.length - 1}
               onClick={() => setActiveStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
               className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-3 px-8 rounded-2xl transition-all disabled:opacity-0 flex items-center shadow-xl shadow-indigo-600/10 uppercase tracking-widest"
             >
               Proceed
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
