import React from 'react';
import { Plus, Trash2, RotateCcw, HelpCircle } from 'lucide-react';
import {
  GRADE_SCALE,
  COURSE_CATEGORIES,
  COURSE_STATUSES,
  calculateSemesterStats,
  calculateGlobalStats,
} from '../utils/gpa';

export default function SemesterManager({ semesters, onSemestersUpdate, profile }) {

  // Update a course field inside a semester
  const updateCourse = (semesterId, courseId, field, value) => {
    const updated = semesters.map(sem => {
      if (sem.id !== semesterId) return sem;
      
      const updatedCourses = sem.courses.map(course => {
        if (course.id !== courseId) return course;
        
        return {
          ...course,
          [field]: field === 'credits' ? (value === '' ? '' : parseInt(value) || 0) : value
        };
      });
      
      return { ...sem, courses: updatedCourses };
    });
    onSemestersUpdate(updated);
  };

  // Add course row
  const addCourseRow = (semesterId) => {
    const updated = semesters.map(sem => {
      if (sem.id !== semesterId) return sem;
      
      const newCourse = {
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: '',
        credits: 3,
        grade: '4.00',
        category: 'core',
        status: 'passed',
        isRetake: false,
      };
      
      return { ...sem, courses: [...sem.courses, newCourse] };
    });
    onSemestersUpdate(updated);
  };

  // Delete course row
  const deleteCourseRow = (semesterId, courseId) => {
    const sem = semesters.find(s => s.id === semesterId);
    if (sem.courses.length <= 1) {
      alert("A semester must have at least one course row.");
      return;
    }
    
    const updated = semesters.map(s => {
      if (s.id !== semesterId) return s;
      return {
        ...s,
        courses: s.courses.filter(c => c.id !== courseId)
      };
    });
    onSemestersUpdate(updated);
  };

  // Add semester
  const addSemester = () => {
    const newSem = {
      id: `sem-${Date.now()}`,
      description: '',
      number: semesters.length + 1,
      courses: [
        { id: `course-${Date.now()}-1`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
        { id: `course-${Date.now()}-2`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
        { id: `course-${Date.now()}-3`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
      ],
    };
    onSemestersUpdate([...semesters, newSem]);
  };

  // Rename semester description
  const renameSemester = (semesterId, description) => {
    const updated = semesters.map(sem => {
      if (sem.id !== semesterId) return sem;
      return { ...sem, description };
    });
    onSemestersUpdate(updated);
  };

  // Delete semester
  const deleteSemester = (semesterId) => {
    if (confirm('Are you sure you want to delete this semester?')) {
      const filtered = semesters.filter(sem => sem.id !== semesterId);
      // Renumber semesters
      const renumbered = filtered.map((sem, idx) => ({
        ...sem,
        number: idx + 1
      }));
      onSemestersUpdate(renumbered);
    }
  };

  // Reset calculator
  const resetAll = () => {
    if (confirm('Are you sure you want to clear all semesters and entries?')) {
      const defaultSem = [{
        id: `sem-${Date.now()}`,
        description: '',
        number: 1,
        courses: [
          { id: `course-${Date.now()}-1`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
          { id: `course-${Date.now()}-2`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
          { id: `course-${Date.now()}-3`, name: '', credits: 3, grade: '4.00', category: 'core', status: 'passed', isRetake: false },
        ]
      }];
      onSemestersUpdate(defaultSem);
    }
  };

  const globalStatsRaw = calculateGlobalStats(semesters);
  const globalStats = {
    cgpa: globalStatsRaw.cgpa,
    totalCredits: globalStatsRaw.totalCredits,
    totalPoints: globalStatsRaw.totalPoints,
  };
  const targetGap = profile ? profile.targetCgpa - globalStats.cgpa : 0;

  // Determine progress bar color based on CGPA achievement
  const getCgpaProgressColor = (cgpa) => {
    if (cgpa >= 3.6) return 'bg-emerald-500';
    if (cgpa >= 3.0) return 'bg-indigo-500';
    if (cgpa >= 2.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left/Middle Column: Semesters */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-slate-500">
            Total Semesters: <strong className="text-slate-800 font-semibold">{semesters.length}</strong>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={addSemester}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm shadow-indigo-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Semester
            </button>
            <button
              onClick={resetAll}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {semesters.map((semester) => {
          const semStatsRaw = calculateSemesterStats(semester.courses);
          const semStats = { credits: semStatsRaw.credits, gpa: semStatsRaw.gpa };
          
          return (
            <div
              key={semester.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3 w-full max-w-lg">
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
                    Semester {semester.number}
                  </span>
                  <input
                    type="text"
                    value={semester.description}
                    onChange={(e) => renameSemester(semester.id, e.target.value)}
                    placeholder="Optional Description (e.g., Year 1, Sem I)"
                    className="bg-transparent font-semibold text-sm text-slate-700 border-none outline-none focus:ring-0 placeholder:text-slate-400 w-full"
                  />
                </div>
                <button
                  onClick={() => deleteSemester(semester.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors duration-200 cursor-pointer"
                  title="Delete Semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Table Body / Course Rows */}
              <div className="p-6">
                {/* Desktop Headers */}
                <div className="hidden lg:grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                  <div className="col-span-3">Course Name</div>
                  <div className="col-span-2 text-center">Credits</div>
                  <div className="col-span-2">Grade</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3">
                  {semester.courses.map((course) => (
                    <div
                      key={course.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/40 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-none"
                    >
                      {/* Course Name */}
                      <div className="sm:col-span-4 lg:col-span-3">
                        <label className="block sm:hidden text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Course Name</label>
                        <input
                          type="text"
                          value={course.name}
                          onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                          placeholder="e.g. Introduction to Calculus"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-medium placeholder:text-slate-300 text-slate-700 dark:text-slate-100"
                        />
                      </div>

                      {/* Credit Hours */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block sm:hidden text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Credit Hrs</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={course.credits}
                          onChange={(e) => updateCourse(semester.id, course.id, 'credits', e.target.value)}
                          placeholder="3"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-bold text-center text-slate-700 dark:text-slate-100"
                        />
                      </div>

                      {/* Grade Selector */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block sm:hidden text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Grade</label>
                        <select
                          value={course.grade}
                          onChange={(e) => updateCourse(semester.id, course.id, 'grade', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 font-bold text-slate-700 dark:text-slate-100"
                        >
                          {GRADE_SCALE.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block lg:hidden text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Category</label>
                        <select
                          value={course.category || 'core'}
                          onChange={(e) => updateCourse(semester.id, course.id, 'category', e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-100"
                        >
                          {COURSE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block lg:hidden text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Status</label>
                        <select
                          value={course.status || 'passed'}
                          onChange={(e) => {
                            const status = e.target.value;
                            updateCourse(semester.id, course.id, 'status', status);
                            if (status === 'failed') {
                              updateCourse(semester.id, course.id, 'grade', '0.00');
                            }
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-100"
                        >
                          {COURSE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Delete Row Button */}
                      <div className="sm:col-span-1 text-right sm:text-center">
                        <button
                          onClick={() => deleteCourseRow(semester.id, course.id)}
                          className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 sm:hover:bg-transparent transition-colors duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Row and Totals Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={() => addCourseRow(semester.id)}
                    className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors duration-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Course Row
                  </button>
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 flex items-center gap-6 text-xs font-semibold text-slate-500">
                    <div>Load Hrs: <span className="text-slate-800 dark:text-slate-100 font-bold">{semStats.credits}</span></div>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <div>Semester GPA: <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{semStats.gpa.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Live Summary & Reference Guides */}
      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-24 space-y-6">
          {/* Live CGPA Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-900 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl font-bold select-none uppercase">CGPA</div>
            <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Cumulative GPA (CGPA)</p>
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">{globalStats.cgpa.toFixed(2)}</span>
              <span className="text-indigo-400 text-sm">/ 4.00</span>
            </div>

            {/* Target Status Check */}
            {profile && (
              <div className="mt-2 text-xs flex items-center gap-1 text-indigo-200">
                {targetGap <= 0 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Target Met 🎉
                  </span>
                ) : (
                  <span>
                    Need <strong className="text-white font-bold">{targetGap.toFixed(2)}</strong> more to hit target ({profile.targetCgpa.toFixed(2)})
                  </span>
                )}
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="mt-6 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getCgpaProgressColor(globalStats.cgpa)}`}
                style={{ width: `${Math.min((globalStats.cgpa / 4.0) * 100, 100)}%` }}
              ></div>
            </div>

            {/* Small Details Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-indigo-300">
              <div>
                <span className="block text-white font-bold text-lg">{globalStats.totalCredits}</span>
                Total Load Hours
              </div>
              <div>
                <span className="block text-white font-bold text-lg">{globalStats.totalPoints.toFixed(2)}</span>
                Total Grade Points
              </div>
            </div>
          </div>

          {/* Scale Reference Accordion */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" /> Scale Reference
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>A / A+</span> <span className="text-indigo-600 font-bold">4.00</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>A-</span> <span className="text-indigo-600 font-bold">3.75</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>B+</span> <span className="text-indigo-600 font-bold">3.50</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>B</span> <span className="text-indigo-600 font-bold">3.00</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>B-</span> <span className="text-indigo-600 font-bold">2.75</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>C+</span> <span className="text-indigo-600 font-bold">2.50</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>C</span> <span className="text-indigo-600 font-bold">2.00</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>C-</span> <span className="text-indigo-600 font-bold">1.75</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>D</span> <span className="text-indigo-600 font-bold">1.00</span></div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg"><span>F</span> <span className="text-rose-600 font-bold">0.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
