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
      <div className="flex flex-col max-md:flex-col sm:flex-row w-full max-md:w-full sm:w-fit bg-[#F4EFE6] dark:bg-[#161B22] p-1.5 rounded-2xl border border-[#E5DCCE]/50 dark:border-[#30363D]/30">
        <button
          onClick={() => setSection('assignments')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 max-md:py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
            section === 'assignments'
              ? 'bg-white dark:bg-[#0D1117] text-[#B45309] dark:text-[#22C55E] shadow-sm border border-[#E5DCCE] dark:border-[#30363D]'
              : 'text-[#6E685F] dark:text-[#8B949E] hover:text-[#2A2723] dark:hover:text-[#E6EDF3]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Assignments & Exams
        </button>
        <button
          onClick={() => setSection('study')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 max-md:py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
            section === 'study'
              ? 'bg-white dark:bg-[#0D1117] text-[#B45309] dark:text-[#22C55E] shadow-sm border border-[#E5DCCE] dark:border-[#30363D]'
              : 'text-[#6E685F] dark:text-[#8B949E] hover:text-[#2A2723] dark:hover:text-[#E6EDF3]'
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
