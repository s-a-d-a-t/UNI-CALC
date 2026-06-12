import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Plus, Trash2, Clock, BookOpen } from 'lucide-react';
import { calculateSemesterStats, truncateGpa } from '../utils/gpa';

export default function StudyTimeTracker({ studyLogs, onStudyLogsUpdate, semesters }) {
  const [logs, setLogs] = useState(studyLogs || []);

  useEffect(() => {
    setLogs(studyLogs || []);
  }, [studyLogs]);

  const persist = (updated) => {
    setLogs(updated);
    onStudyLogsUpdate(updated);
  };

  const courseNamesFromSemesters = useMemo(() => {
    const names = new Set();
    (semesters || []).forEach((sem) => {
      (sem.courses || []).forEach((c) => {
        if (c.name) names.add(c.name);
      });
    });
    return [...names];
  }, [semesters]);

  const courseGpaMap = useMemo(() => {
    const map = {};
    (semesters || []).forEach((sem) => {
      (sem.courses || []).forEach((course) => {
        if (!course.name) return;
        const stats = calculateSemesterStats([course]);
        if (stats.credits > 0) {
          if (!map[course.name]) map[course.name] = { points: 0, credits: 0 };
          map[course.name].points += stats.points;
          map[course.name].credits += stats.credits;
        }
      });
    });
    Object.keys(map).forEach((name) => {
      map[name] = map[name].credits > 0 ? map[name].points / map[name].credits : 0;
    });
    return map;
  }, [semesters]);

  const hoursByCourse = useMemo(() => {
    const byCourse = {};
    logs.forEach((log) => {
      const name = log.courseName || 'Other';
      byCourse[name] = (byCourse[name] || 0) + (parseFloat(log.hours) || 0);
    });
    return Object.entries(byCourse).map(([name, hours]) => ({
      name: name.length > 12 ? `${name.slice(0, 12)}…` : name,
      fullName: name,
      hours: parseFloat(hours.toFixed(1)),
      gpa: courseGpaMap[name] != null ? truncateGpa(courseGpaMap[name]) : null,
    }));
  }, [logs, courseGpaMap]);

  const correlationData = hoursByCourse.filter((d) => d.gpa != null);

  const addLog = () => {
    persist([
      ...logs,
      {
        id: `log-${Date.now()}`,
        courseName: courseNamesFromSemesters[0] || '',
        hours: 2,
        logDate: new Date().toISOString().slice(0, 10),
        notes: '',
      },
    ]);
  };

  const updateLog = (id, field, value) => {
    persist(logs.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const removeLog = (id) => {
    persist(logs.filter((l) => l.id !== id));
  };

  const totalHours = logs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
  const isDark = document.documentElement.classList.contains('dark');
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-6">
      <div className="flex flex-col max-md:flex-col sm:flex-row justify-between items-stretch max-md:items-stretch sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-[#E6EDF3] flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Study Time Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {totalHours.toFixed(1)} total hours logged across {hoursByCourse.length} courses
          </p>
        </div>
        <button
          onClick={addLog}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 w-full max-md:w-full sm:w-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Log Hours
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-xs text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider">
            Study Hours by Course
          </h4>
          <div className="h-48 chart-scroll">
            {hoursByCourse.length > 0 ? (
              <div className="chart-scroll-inner h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByCourse}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Log study hours to see chart
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm min-w-0">
          <h4 className="font-bold text-xs text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Study Hours vs GPA
          </h4>
          <div className="h-48 chart-scroll">
            {correlationData.length > 1 ? (
              <div className="chart-scroll-inner h-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    type="number"
                    dataKey="hours"
                    name="Hours"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="gpa"
                    name="GPA"
                    domain={[0, 4]}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />
                  <ZAxis range={[80, 200]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '11px',
                    }}
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name === 'gpa' ? 'GPA' : 'Hours',
                    ]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName || ''
                    }
                  />
                  <Scatter data={correlationData} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
                Add study logs for courses that exist in your GPA Calculator to see correlation
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-8 text-center text-slate-400 text-sm">
            No study sessions logged yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4 flex flex-wrap gap-3 items-center"
            >
              <input
                type="text"
                list="course-names"
                value={log.courseName}
                onChange={(e) => updateLog(log.id, 'courseName', e.target.value)}
                placeholder="Course name"
                className="flex-1 min-w-[140px] bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
              <datalist id="course-names">
                {courseNamesFromSemesters.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={log.hours}
                onChange={(e) => updateLog(log.id, 'hours', parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-center"
              />
              <span className="text-xs text-slate-500">hrs</span>
              <input
                type="date"
                value={log.logDate}
                onChange={(e) => updateLog(log.id, 'logDate', e.target.value)}
                className="bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm"
              />
              <button onClick={() => removeLog(log.id)} className="text-slate-400 hover:text-rose-500 ml-auto">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
