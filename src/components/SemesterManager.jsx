import React, { useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, RotateCcw, HelpCircle } from 'lucide-react';
import {
  GRADE_SCALE,
  COURSE_CATEGORIES,
  COURSE_STATUSES,
  calculateSemesterStats,
  calculateGlobalStats,
  normalizeGrade,
  formatGpa,
} from '../utils/gpa';

function AutoResizeTextarea({ value, onChange, placeholder, className }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={onChange}
      onInput={resize}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function SemesterManager({ semesters, onSemestersUpdate, profile }) {
  const updateSemesters = (updater) => {
    onSemestersUpdate((prev) => updater(prev));
  };

  const updateCourse = (semesterId, courseId, field, value) => {
    updateSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;

        return {
          ...sem,
          courses: sem.courses.map((course) => {
            if (course.id !== courseId) return course;

            return {
              ...course,
              [field]: field === 'credits' ? (value === '' ? '' : parseInt(value, 10) || 0) : value,
            };
          }),
        };
      })
    );
  };

  const addCourseRow = (semesterId) => {
    updateSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;

        const newCourse = {
          id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: '',
          credits: 3,
          grade: 'A',
          category: 'core',
          status: 'passed',
          isRetake: false,
        };

        return { ...sem, courses: [...sem.courses, newCourse] };
      })
    );
  };

  const deleteCourseRow = (semesterId, courseId) => {
    updateSemesters((prev) => {
      const sem = prev.find((s) => s.id === semesterId);
      if (!sem || sem.courses.length <= 1) {
        alert('A semester must have at least one course row.');
        return prev;
      }

      return prev.map((s) => {
        if (s.id !== semesterId) return s;
        return {
          ...s,
          courses: s.courses.filter((c) => c.id !== courseId),
        };
      });
    });
  };

  const addSemester = () => {
    const ts = Date.now();
    const newSem = {
      id: `sem-${ts}`,
      description: '',
      number: semesters.length + 1,
      courses: [
        { id: `course-${ts}-1`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
        { id: `course-${ts}-2`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
        { id: `course-${ts}-3`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
      ],
    };
    onSemestersUpdate((prev) => [...prev, newSem]);
  };

  const renameSemester = (semesterId, description) => {
    updateSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== semesterId) return sem;
        return { ...sem, description };
      })
    );
  };

  const deleteSemester = (semesterId) => {
    if (confirm('Are you sure you want to delete this semester?')) {
      updateSemesters((prev) => {
        const filtered = prev.filter((sem) => sem.id !== semesterId);
        return filtered.map((sem, idx) => ({
          ...sem,
          number: idx + 1,
        }));
      });
    }
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to clear all semesters and entries?')) {
      const ts = Date.now();
      const defaultSem = [{
        id: `sem-${ts}`,
        description: '',
        number: 1,
        courses: [
          { id: `course-${ts}-1`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
          { id: `course-${ts}-2`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
          { id: `course-${ts}-3`, name: '', credits: 3, grade: 'A', category: 'core', status: 'passed', isRetake: false },
        ],
      }];
      onSemestersUpdate(() => defaultSem);
    }
  };

  const globalStatsRaw = calculateGlobalStats(semesters);
  const globalStats = {
    cgpa: globalStatsRaw.cgpa,
    totalCredits: globalStatsRaw.totalCredits,
    totalPoints: globalStatsRaw.totalPoints,
  };
  const targetGap = profile ? profile.targetCgpa - globalStats.cgpa : 0;

  const getCgpaProgressColor = (cgpa) => {
    if (cgpa >= 3.6) return 'bg-emerald-500';
    if (cgpa >= 3.0) return 'bg-indigo-500';
    if (cgpa >= 2.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-[#0C0C0E] p-4 border border-[#E5DCCE] dark:border-[#212124] rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-[#6E685F] dark:text-[#A1A1A5]">
            Total Semesters: <strong className="text-[#2A2723] dark:text-[#F3F3F5] font-semibold">{semesters.length}</strong>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={addSemester}
              className="bg-[#B45309] hover:bg-[#92400E] dark:bg-[#EAB308] dark:hover:bg-[#CA8A04] text-white dark:text-[#08080A] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Semester
            </button>
            <button
              onClick={resetAll}
              className="border border-[#E5DCCE] dark:border-[#212124] hover:bg-[#F4EFE6] dark:hover:bg-[#121216] text-[#6E685F] dark:text-[#A1A1A5] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
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
              className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-200"
            >
              <div className="px-6 py-4 bg-[#F4EFE6]/70 dark:bg-[#121216]/40 border-b border-[#E5DCCE] dark:border-[#212124] flex justify-between items-center">
                <div className="flex items-center gap-3 w-full max-w-lg">
                  <span className="bg-[#F4EFE6] dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] text-[#B45309] dark:text-[#EAB308] font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
                    Semester {semester.number}
                  </span>
                  <input
                    type="text"
                    value={semester.description}
                    onChange={(e) => renameSemester(semester.id, e.target.value)}
                    placeholder="Optional Description (e.g., Year 1, Sem I)"
                    className="bg-transparent font-semibold text-xs md:text-sm text-[#2A2723] dark:text-[#F3F3F5] border-none outline-none focus:ring-0 placeholder:text-[#A1A1A5] w-full"
                  />
                </div>
                <button
                  onClick={() => deleteSemester(semester.id)}
                  className="text-[#A1A1A5] hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-200 cursor-pointer"
                  title="Delete Semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="hidden lg:grid grid-cols-12 gap-2 text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider mb-3 px-1">
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
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-[#F4EFE6]/40 dark:bg-[#121216]/40 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[#E5DCCE]/50 dark:border-[#212124]/50 sm:border-none"
                    >
                      <div className="sm:col-span-4 lg:col-span-3">
                        <label className="block sm:hidden text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-[#6E685F] dark:text-[#A1A1A5] mb-0.5 md:mb-1">Course Name</label>
                        <AutoResizeTextarea
                          value={course.name}
                          onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                          placeholder="e.g. Introduction to Calculus"
                          className="w-full bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] rounded-lg md:rounded-xl px-2.5 py-1.5 text-xs md:px-3 md:py-2 md:text-sm focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-medium placeholder:text-[#A1A1A5] text-[#2A2723] dark:text-[#F3F3F5] resize-none overflow-hidden min-h-[34px] md:min-h-[42px]"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block sm:hidden text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-[#6E685F] dark:text-[#A1A1A5] mb-0.5 md:mb-1">Credit Hrs</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={course.credits}
                          onChange={(e) => updateCourse(semester.id, course.id, 'credits', e.target.value)}
                          placeholder="3"
                          className="course-credits w-full min-w-[3.5rem] md:min-w-[4rem] bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] rounded-lg md:rounded-xl px-2.5 py-1.5 text-xs md:px-3 md:py-2 md:text-sm focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-bold text-center text-[#2A2723] dark:text-[#F3F3F5]"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block sm:hidden text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-[#6E685F] dark:text-[#A1A1A5] mb-0.5 md:mb-1">Grade</label>
                        <select
                          value={normalizeGrade(course.grade)}
                          onChange={(e) => updateCourse(semester.id, course.id, 'grade', e.target.value)}
                          className="course-grade w-full bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] rounded-lg md:rounded-xl px-1.5 py-1.5 text-xs md:px-2 md:py-2 md:text-sm focus:border-[#B45309] dark:focus:border-[#EAB308] focus:ring-1 focus:ring-[#B45309] dark:focus:ring-[#EAB308] outline-none transition-all duration-200 font-bold text-[#2A2723] dark:text-[#F3F3F5]"
                        >
                          {GRADE_SCALE.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block lg:hidden text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-[#6E685F] dark:text-[#A1A1A5] mb-0.5 md:mb-1">Category</label>
                        <select
                          value={course.category || 'core'}
                          onChange={(e) => updateCourse(semester.id, course.id, 'category', e.target.value)}
                          className="w-full bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] rounded-lg md:rounded-xl px-1.5 py-1.5 text-[11px] md:px-2 md:py-2 md:text-xs font-bold text-[#2A2723] dark:text-[#F3F3F5]"
                        >
                          {COURSE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block lg:hidden text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-[#6E685F] dark:text-[#A1A1A5] mb-0.5 md:mb-1">Status</label>
                        <select
                          value={course.status || 'passed'}
                          onChange={(e) => {
                            const status = e.target.value;
                            updateSemesters((prev) =>
                              prev.map((sem) => {
                                if (sem.id !== semester.id) return sem;
                                return {
                                  ...sem,
                                  courses: sem.courses.map((c) => {
                                    if (c.id !== course.id) return c;
                                    return {
                                      ...c,
                                      status,
                                      ...(status === 'failed' ? { grade: 'F' } : {}),
                                    };
                                  }),
                                };
                              })
                            );
                          }}
                          className="w-full bg-white dark:bg-[#121216] border border-[#E5DCCE] dark:border-[#212124] rounded-lg md:rounded-xl px-1.5 py-1.5 text-[11px] md:px-2 md:py-2 md:text-xs font-bold text-[#2A2723] dark:text-[#F3F3F5]"
                        >
                          {COURSE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1 text-right sm:text-center">
                        <button
                          onClick={() => deleteCourseRow(semester.id, course.id)}
                          className="text-[#A1A1A5] hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 sm:hover:bg-transparent transition-colors duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5DCCE] dark:border-[#212124] flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    onClick={() => addCourseRow(semester.id)}
                    className="text-[#B45309] hover:text-[#92400E] dark:text-[#EAB308] dark:hover:text-[#CA8A04] font-bold text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-[#F4EFE6]/50 dark:hover:bg-[#121216]/50 transition-colors duration-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Course Row
                  </button>

                  <div className="bg-[#F4EFE6] dark:bg-[#121216] border border-[#E5DCCE]/60 dark:border-[#212124]/60 rounded-xl px-4 py-2 flex items-center gap-6 text-xs font-semibold text-[#6E685F] dark:text-[#A1A1A5]">
                    <div>Load Hrs: <span className="text-[#2A2723] dark:text-[#F3F3F5] font-bold">{semStats.credits}</span></div>
                    <div className="h-4 w-[1px] bg-[#E5DCCE] dark:bg-[#212124]"></div>
                    <div>Semester GPA: <span className="text-[#B45309] dark:text-[#EAB308] font-bold text-sm">{formatGpa(semStats.gpa)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="sticky top-24 space-y-6">
          <div className="bg-gradient-to-br from-[#2A2723] via-[#1a1917] to-[#3d2e10] text-white dark:from-[#0C0C0E] dark:via-[#121216] dark:to-[#1a1506] rounded-2xl p-6 shadow-xl relative overflow-hidden border border-[#3d3830] dark:border-[#212124]">
            <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl font-bold select-none uppercase">CGPA</div>
            <p className="text-sm font-semibold text-[#EAB308] uppercase tracking-wider">Cumulative GPA (CGPA)</p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">{formatGpa(globalStats.cgpa)}</span>
              <span className="text-[#EAB308]/70 text-sm">/ 4.00</span>
            </div>

            {profile && (
              <div className="mt-2 text-xs flex items-center gap-1 text-[#EAB308]/80">
                {targetGap <= 0 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Target Met 🎉
                  </span>
                ) : (
                  <span>
                    Need <strong className="text-white font-bold">{formatGpa(targetGap)}</strong> more to hit target ({profile.targetCgpa.toFixed(2)})
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getCgpaProgressColor(globalStats.cgpa)}`}
                style={{ width: `${Math.min((globalStats.cgpa / 4.0) * 100, 100)}%` }}
              ></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs text-[#EAB308]/70">
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

          <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Scale Reference
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#6E685F] dark:text-[#A1A1A5]">
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>A+</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">4.00</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>A</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">4.00</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>A-</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">3.75</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>B+</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">3.50</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>B</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">3.00</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>B-</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">2.75</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>C+</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">2.50</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>C</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">2.00</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>C-</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">1.75</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>D</span> <span className="text-[#B45309] dark:text-[#EAB308] font-bold">1.00</span></div>
              <div className="flex justify-between p-2 bg-[#F4EFE6] dark:bg-[#121216] rounded-lg"><span>F</span> <span className="text-rose-600 font-bold">0.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
