
import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSuccess }) => {
  if (!isOpen) return null;

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      onSuccess();
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-800">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-800/50 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Select Your API Key</h2>
          <p className="text-slate-400 mb-6">
            To use the advanced Gemini 3 Pro reasoning features, you need to select a billing-enabled API key.
          </p>
          <div className="bg-amber-900/20 border border-amber-900/50 rounded-2xl p-4 mb-8 text-sm text-amber-200 text-left">
            <strong className="block mb-1 text-amber-400 uppercase tracking-wider text-[10px]">Requirements:</strong>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>Must be a paid GCP project</li>
              <li>Billing must be enabled</li>
              <li>Check <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-medium hover:text-amber-300">billing docs</a></li>
            </ul>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25"
          >
            Select API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
