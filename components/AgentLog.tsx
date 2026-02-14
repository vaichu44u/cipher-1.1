
import React from 'react';

interface Props {
  reasoning: string[];
}

const AgentLog: React.FC<Props> = ({ reasoning }) => {
  return (
    <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-xl overflow-hidden relative">
      <div className="flex items-center space-x-2 mb-6">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Agent Strategy Log</span>
      </div>
      
      <div className="space-y-4 font-mono">
        {reasoning.map((log, i) => (
          <div key={i} className="flex space-x-4 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 150}ms` }}>
            <span className="text-indigo-500 font-bold shrink-0">[{i + 1}]</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-emerald-400/80 mr-2">EXEC_STRAT:</span>
              {log}
            </p>
          </div>
        ))}
        <div className="flex space-x-4">
          <span className="text-indigo-500 font-bold shrink-0">[{reasoning.length + 1}]</span>
          <div className="flex items-center">
            <span className="text-emerald-400/80 mr-2 text-xs">AWAITING_INPUT:</span>
            <div className="w-1.5 h-4 bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLog;
