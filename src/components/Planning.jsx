import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import CoursePrediction from './CoursePrediction';
import RetakeAnalyzer from './RetakeAnalyzer';

export default function Planning({ semesters, profile }) {
  const [section, setSection] = useState('prediction');

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 w-fit">
        <button
          onClick={() => setSection('prediction')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            section === 'prediction'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Course Prediction
        </button>
        <button
          onClick={() => setSection('retake')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            section === 'retake'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retake Analyzer
        </button>
      </div>

      {section === 'prediction' && (
        <CoursePrediction semesters={semesters} profile={profile} />
      )}
      {section === 'retake' && <RetakeAnalyzer semesters={semesters} />}
    </div>
  );
}
