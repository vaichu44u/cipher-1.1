
import React from 'react';

interface Props {
  reasoning: string[];
}

const AgentLog: React.FC<Props> = ({ reasoning }) => {
  return (
    <div className="glass rounded-[2rem] border border-indigo-500/20 p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-20 font-mono text-[8px] tracking-tighter text-indigo-400">
        UPLINK_STABLE_v2.5
      </div>
      
      <div className="flex items-center space-x-2 mb-6 border-b border-indigo-500/10 pb-4">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/30"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/10"></div>
        </div>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] ml-4 font-mono">Neural Pathfinder Feed</span>
      </div>
      
      <div className="space-y-3 font-mono">
        {reasoning.map((log, i) => (
          <div key={i} className="flex space-x-4 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="text-indigo-500 font-bold shrink-0 text-[10px] mt-1">[{i.toString().padStart(2, '0')}]</span>
            <p className="text-[11px] text-slate-400 leading-relaxed group">
              <span className="text-indigo-300 font-bold mr-2 tracking-tighter">PATH_FIND:</span>
              {log}
            </p>
          </div>
        ))}
        <div className="flex space-x-4">
          <span className="text-indigo-500 font-bold shrink-0 text-[10px] mt-1">[{reasoning.length.toString().padStart(2, '0')}]</span>
          <div className="flex items-center">
            <span className="text-indigo-400/80 mr-2 text-[11px] font-bold">READY_FOR_SYNC:</span>
            <div className="w-1.5 h-3 bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLog;
