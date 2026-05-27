import React, { useState } from 'react';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { GRADE_SCALE, analyzeRetakes, simulateRetake, calculateGlobalStats } from '../utils/gpa';

export default function RetakeAnalyzer({ semesters }) {
  const [retakeTargetGrade, setRetakeTargetGrade] = useState('3.50');
  const currentCgpa = calculateGlobalStats(semesters).cgpa;
  const retakes = analyzeRetakes(semesters, retakeTargetGrade);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-500" /> Smart Retake Analyzer
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          See which failed courses would improve your CGPA the most if retaken. Mark courses as
          &quot;Failed&quot; in the GPA Calculator or use grades below C (2.0).
        </p>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase">Retake target grade</label>
          <select
            value={retakeTargetGrade}
            onChange={(e) => setRetakeTargetGrade(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold"
          >
            {GRADE_SCALE.filter((g) => parseFloat(g.value) >= 2.0).map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {retakes.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No retake candidates found.</p>
            <p className="text-xs mt-1">Failed courses (grade &lt; 2.0) will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {retakes.map((item, index) => {
              const projectedCgpa = simulateRetake(semesters, item.courseId, retakeTargetGrade);
              return (
                <div
                  key={item.courseId}
                  className={`p-4 rounded-xl border ${
                    index === 0
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      {index === 0 && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                          Highest impact
                        </span>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white">{item.courseName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.semester} · {item.credits} credits
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">
                        {item.oldLetter} → {item.newLetter}
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                        <TrendingUp className="w-4 h-4" />+{item.cgpaLift.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700">
                    Retaking <strong>{item.courseName}</strong> from {item.oldLetter} to {item.newLetter}{' '}
                    increases CGPA by <strong className="text-indigo-600">{item.cgpaLift.toFixed(2)}</strong>{' '}
                    (from {currentCgpa.toFixed(2)} to {projectedCgpa.toFixed(2)}).
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
