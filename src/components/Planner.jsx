import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import AssignmentTracker from './AssignmentTracker';
import StudyTimeTracker from './StudyTimeTracker';

export default function Planner({
  assignments,
  onAssignmentsUpdate,
  studyLogs,
  onStudyLogsUpdate,
  semesters,
}) {
  const [section, setSection] = useState('assignments');

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 w-fit">
        <button
          onClick={() => setSection('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            section === 'assignments'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Assignments & Exams
        </button>
        <button
          onClick={() => setSection('study')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            section === 'study'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Study Time
        </button>
      </div>

      {section === 'assignments' && (
        <AssignmentTracker
          assignments={assignments}
          onAssignmentsUpdate={onAssignmentsUpdate}
        />
      )}
      {section === 'study' && (
        <StudyTimeTracker
          studyLogs={studyLogs}
          onStudyLogsUpdate={onStudyLogsUpdate}
          semesters={semesters}
        />
      )}
    </div>
  );
}
