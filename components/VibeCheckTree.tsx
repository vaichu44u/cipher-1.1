
import React from 'react';

interface Props {
  data: {
    title: string;
    description: string;
    milestones: string[];
  };
  checkedMilestones: Record<number, boolean>;
  onToggleMilestone: (index: number) => void;
}

const VibeCheckTree: React.FC<Props> = ({ data, checkedMilestones, onToggleMilestone }) => {
  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
              30-Day Evolution
            </span>
            <h3 className="text-2xl font-black text-white mt-2 tracking-tight">{data.title}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-inner">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed mb-12 max-w-lg border-l-2 border-indigo-500/30 pl-6 italic">
          "{data.description}"
        </p>

        <div className="relative flex flex-col items-center py-4">
          <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-indigo-500/20 to-transparent"></div>

          <div className="w-full space-y-12">
            {data.milestones.map((milestone, index) => {
              const isEven = index % 2 === 0;
              const isChecked = !!checkedMilestones[index];
              
              return (
                <div key={index} className="relative flex items-center justify-center">
                  {/* Interactive Node Dot */}
                  <button 
                    onClick={() => onToggleMilestone(index)}
                    className={`z-20 w-5 h-5 rounded-full border-2 transition-all duration-500 shadow-lg flex items-center justify-center ${
                      isChecked 
                        ? 'bg-indigo-500 border-indigo-400 shadow-indigo-500/50' 
                        : 'bg-slate-950 border-indigo-900 hover:border-indigo-500'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {!isChecked && <div className="w-1 h-1 rounded-full bg-indigo-500/50 animate-pulse"></div>}
                  </button>

                  <div className={`absolute w-[42%] sm:w-[45%] ${isEven ? 'right-0 pl-6 text-left' : 'left-0 pr-6 text-right'}`}>
                    <button 
                      onClick={() => onToggleMilestone(index)}
                      className={`group/node p-4 rounded-2xl border transition-all text-left w-full ${
                        isChecked 
                          ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-100/60' 
                          : 'bg-slate-950/40 backdrop-blur-sm border-slate-800 hover:border-indigo-500/40 hover:-translate-y-1 text-slate-200'
                      }`}
                    >
                      <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isChecked ? 'text-indigo-400/50' : 'text-indigo-400'}`}>
                        Evolution {index + 1}
                      </p>
                      <p className={`text-xs font-bold leading-snug ${isChecked ? 'line-through opacity-40' : ''}`}>
                        {milestone}
                      </p>
                    </button>
                  </div>

                  <div className={`absolute h-0.5 w-[15%] transition-colors duration-500 ${isEven ? 'right-[45%] translate-x-1/2' : 'left-[45%] -translate-x-1/2'} ${isChecked ? 'bg-indigo-500/40' : 'bg-indigo-500/10'}`}></div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 z-20 flex flex-col items-center">
             <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
               </svg>
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">Base State</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeCheckTree;
