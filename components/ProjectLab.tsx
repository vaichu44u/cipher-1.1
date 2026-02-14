
import React from 'react';
import { ProjectSuggestion } from '../types';

interface Props {
  projects: ProjectSuggestion[];
  checkedProjects: Record<number, boolean>;
  onToggleProject: (index: number) => void;
}

const ProjectLab: React.FC<Props> = ({ projects, checkedProjects, onToggleProject }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-black text-white tracking-tight">Project Laboratory</h3>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
          Hands-on Skill Validation
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, i) => {
          const isChecked = !!checkedProjects[i];
          return (
            <div 
              key={i} 
              onClick={() => onToggleProject(i)}
              className={`relative flex flex-col p-8 rounded-[2rem] border transition-all cursor-pointer group shadow-xl ${
                isChecked 
                  ? 'bg-indigo-950/20 border-indigo-500/30' 
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:-translate-y-1'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                  project.difficulty === 'Beginner' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' :
                  project.difficulty === 'Intermediate' ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 
                  'bg-rose-950/40 text-rose-400 border-rose-900/50'
                }`}>
                  {project.difficulty}
                </span>
                
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  isChecked 
                    ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                    : 'bg-slate-950 border-slate-700'
                }`}>
                  {isChecked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              <h4 className={`text-xl font-black mb-4 leading-tight transition-colors ${isChecked ? 'text-indigo-200/50' : 'text-white group-hover:text-indigo-400'}`}>
                {project.title}
              </h4>
              
              <p className={`text-xs mb-8 leading-relaxed flex-grow transition-opacity ${isChecked ? 'opacity-40 line-through' : 'text-slate-400'}`}>
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800/50">
                {project.techStack.map((tech, j) => (
                  <span key={j} className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-lg border ${
                    isChecked ? 'bg-slate-950/50 text-indigo-900 border-slate-900' : 'bg-slate-950 text-indigo-400/80 border-slate-800'
                  }`}>
                    {tech}
                  </span>
                ))}
              </div>

              {isChecked && (
                <div className="absolute inset-0 bg-slate-950/10 pointer-events-none rounded-[2rem] backdrop-grayscale-[0.5]"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectLab;
