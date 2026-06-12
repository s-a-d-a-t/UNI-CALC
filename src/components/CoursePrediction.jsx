import React, { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Target, Plus, Trash2 } from 'lucide-react';
import {
  GRADE_SCALE,
  calculateGlobalStats,
  predictCgpa,
  predictBestWorstCase,
  requiredGradeForTarget,
  normalizeGrade,
  formatGpa,
} from '../utils/gpa';

export default function CoursePrediction({ semesters, profile }) {
  const inProgressFromSemesters = useMemo(() => {
    const courses = [];
    (semesters || []).forEach((sem) => {
      (sem.courses || []).forEach((course) => {
        if (course.status === 'in_progress' && course.name) {
          courses.push({
            id: course.id,
            name: course.name,
            credits: course.credits || 3,
            grade: course.grade || 'B+',
          });
        }
      });
    });
    return courses;
  }, [semesters]);

  const [hypotheticalCourses, setHypotheticalCourses] = useState([]);
  const [remainingCredits, setRemainingCredits] = useState(15);

  const activeCourses =
    hypotheticalCourses.length > 0 ? hypotheticalCourses : inProgressFromSemesters;

  const completedSemesters = useMemo(() => {
    return (semesters || []).map((sem) => ({
      ...sem,
      courses: (sem.courses || []).filter((c) => c.status !== 'in_progress'),
    }));
  }, [semesters]);

  const prediction = predictCgpa(completedSemesters, activeCourses);
  const { best, worst } = predictBestWorstCase(completedSemesters, activeCourses);
  const targetCgpa = profile?.targetCgpa ?? 3.5;
  const required = requiredGradeForTarget(
    completedSemesters,
    remainingCredits,
    targetCgpa
  );

  const addCourse = () => {
    setHypotheticalCourses((prev) => [
      ...prev,
      {
        id: `hyp-${Date.now()}`,
        name: '',
        credits: 3,
        grade: 'B+',
      },
    ]);
  };

  const updateCourse = (id, field, value) => {
    const source = hypotheticalCourses.length > 0 ? hypotheticalCourses : inProgressFromSemesters;
    if (hypotheticalCourses.length === 0 && inProgressFromSemesters.length > 0) {
      setHypotheticalCourses(
        inProgressFromSemesters.map((c) =>
          c.id === id ? { ...c, [field]: field === 'credits' ? parseInt(value, 10) || 0 : value } : c
        )
      );
      return;
    }
    setHypotheticalCourses(
      source.map((c) =>
        c.id === id ? { ...c, [field]: field === 'credits' ? parseInt(value, 10) || 0 : value } : c
      )
    );
  };

  const removeCourse = (id) => {
    setHypotheticalCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const displayCourses =
    hypotheticalCourses.length > 0 ? hypotheticalCourses : inProgressFromSemesters;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Course Prediction System
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#8B949E] mb-6">
          Enter expected grades for current or upcoming courses to predict your future CGPA.
          Mark courses as &quot;In Progress&quot; in the GPA Calculator, or add hypothetical courses below.
        </p>

        {displayCourses.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <p>No in-progress courses found.</p>
            <button
              onClick={addCourse}
              className="mt-4 text-[#B45309] dark:text-[#22C55E] font-bold text-xs flex items-center gap-1 mx-auto hover:text-[#92400E] dark:hover:text-[#4ADE80]"
            >
              <Plus className="w-3.5 h-3.5" /> Add a course to predict
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCourses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-1 max-md:grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#FAF6EE] dark:bg-[#161B22] p-3 rounded-xl border border-[#E5DCCE] dark:border-[#30363D]"
              >
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  placeholder="Course name"
                  className="sm:col-span-5 bg-white dark:bg-[#0D1117] border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-3 py-2 text-sm font-medium text-[#2A2723] dark:text-[#E6EDF3] w-full"
                />
                <div className="grid grid-cols-2 gap-3 sm:contents">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  className="sm:col-span-2 bg-white dark:bg-[#0D1117] border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-3 py-2 text-sm text-center font-bold text-[#2A2723] dark:text-[#E6EDF3] w-full"
                />
                <select
                  value={normalizeGrade(course.grade)}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="sm:col-span-4 bg-white dark:bg-[#0D1117] border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-2 py-2 text-sm font-bold text-[#2A2723] dark:text-[#E6EDF3] w-full"
                >
                  {GRADE_SCALE.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="sm:col-span-1 text-slate-400 hover:text-rose-500 justify-self-end sm:justify-self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addCourse}
              className="text-[#B45309] dark:text-[#22C55E] font-bold text-xs flex items-center gap-1 py-2 hover:text-[#92400E] dark:hover:text-[#4ADE80]"
            >
              <Plus className="w-3.5 h-3.5" /> Add another course
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 max-md:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 max-md:gap-3 md:gap-4">
        <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-450 dark:text-[#8B949E] uppercase">Current CGPA</span>
          <span className="text-3xl font-black text-slate-800 dark:text-[#E6EDF3] block mt-2">
            {formatGpa(prediction.currentCgpa)}
          </span>
        </div>
        <div className="bg-[#F4EFE6] dark:bg-[#22C55E]/10 border border-[#E5DCCE] dark:border-[#22C55E]/20 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-[#B45309] dark:text-[#22C55E] uppercase">Predicted CGPA</span>
          <span className="text-3xl font-black text-[#B45309] dark:text-[#22C55E] block mt-2">
            {activeCourses.length > 0 ? formatGpa(prediction.predictedCgpa) : '—'}
          </span>
          {activeCourses.length > 0 && (
            <span className="text-xs text-[#22C55E]/80 dark:text-[#4ADE80]/80 mt-1 block">
              {prediction.predictedCgpa >= prediction.currentCgpa ? '+' : ''}
              {formatGpa(prediction.predictedCgpa - prediction.currentCgpa)} change
            </span>
          )}
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Best Case
          </span>
          <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300 block mt-2">
            {activeCourses.length > 0 ? formatGpa(best) : '—'}
          </span>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">All A grades</span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Worst Case
          </span>
          <span className="text-3xl font-black text-rose-700 dark:text-rose-300 block mt-2">
            {activeCourses.length > 0 ? formatGpa(worst) : '—'}
          </span>
          <span className="text-[10px] text-rose-600/80 mt-1 block">All F grades</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-sm text-slate-800 dark:text-[#E6EDF3] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Required Grade for Target CGPA
        </h4>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase block mb-1">
              Remaining credits
            </label>
            <input
              type="number"
              min="1"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(parseInt(e.target.value, 10) || 0)}
              className="w-24 bg-[#FAF6EE] dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-xl px-3 py-2 text-sm font-bold text-[#2A2723] dark:text-[#E6EDF3]"
            />
          </div>
          <div className="text-xs text-[#6E685F] dark:text-[#8B949E]">
            Target: <strong className="text-[#B45309] dark:text-[#22C55E]">{targetCgpa.toFixed(2)}</strong> CGPA
          </div>
        </div>
        {required && !required.possible ? (
          <p className="text-sm text-rose-600 font-semibold">
            Mathematically impossible — you would need an average above 4.0 on remaining credits.
          </p>
        ) : required ? (
          <p className="text-sm text-[#6E685F] dark:text-[#8B949E]">
            To reach <strong>{targetCgpa.toFixed(2)}</strong> CGPA, maintain an average of{' '}
            <strong className="text-[#B45309] dark:text-[#22C55E] text-lg">{formatGpa(required.requiredGpa)}</strong>{' '}
            ({required.letter}) on your next {remainingCredits} credit hours.
          </p>
        ) : null}
      </div>
    </div>
  );
}
