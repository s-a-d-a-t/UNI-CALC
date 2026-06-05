import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Calendar,
  Target,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  calculateGlobalStats,
  getSemesterChartData,
  getGradeLetter,
  getGraduationStats,
  getPassFailStats,
  getStrongestWeakestSemesters,
  getCreditLoadVsGpaData,
  requiredGradeForTarget,
  formatGpa,
} from '../utils/gpa';

const COLORS = ['#B45309', '#EAB308', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#6E685F'];

export default function Dashboard({ semesters, profile }) {
  const semesterData = getSemesterChartData(semesters);
  const { totalCredits, cgpa: cgpaRaw } = calculateGlobalStats(semesters);
  const cgpa = cgpaRaw;

  const gradeCounts = {};
  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      const credits = parseFloat(course.credits);
      if (!isNaN(credits) && credits > 0) {
        const letter = getGradeLetter(course.grade);
        gradeCounts[letter] = (gradeCounts[letter] || 0) + 1;
      }
    });
  });

  const gradeDistributionData = Object.keys(gradeCounts).map((key) => ({
    name: key,
    value: gradeCounts[key],
  }));

  const targetCgpa = profile ? profile.targetCgpa : 3.5;
  const gradCreditsGoal = profile ? profile.graduationCredits : 145;
  const grad = getGraduationStats(semesters, profile);
  const passFailData = getPassFailStats(semesters);
  const { strongest, weakest } = getStrongestWeakestSemesters(semesterData);
  const creditGpaData = getCreditLoadVsGpaData(semesterData);

  const remainingCredits = grad.remainingCredits;
  const required = requiredGradeForTarget(semesters, remainingCredits, targetCgpa);

  const getAcademicStanding = (cgpaValue) => {
    if (cgpaValue === 0 && totalCredits === 0) {
      return {
        label: 'No Data',
        color: 'text-slate-500 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400 border-slate-200 dark:border-slate-800',
        icon: <Calendar className="w-5 h-5" />,
        desc: 'Add semesters and course grades to check academic standing.',
      };
    }
    if (cgpaValue >= 3.75) {
      return {
        label: 'First Class Distinction',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-250 dark:border-emerald-900/30',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        desc: 'Excellent! You are on track for Great Distinction honors.',
      };
    }
    if (cgpaValue >= 3.5) {
      return {
        label: 'Distinction',
        color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-300 border-indigo-250 dark:border-indigo-900/30',
        icon: <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        desc: 'Outstanding performance. Maintain this to graduate with honors.',
      };
    }
    if (cgpaValue >= 2.0) {
      return {
        label: 'Satisfactory / Pass',
        color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300 border-blue-250 dark:border-blue-900/30',
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        desc: 'Good standing. Keep working to push your scores higher.',
      };
    }
    if (cgpaValue >= 1.75) {
      return {
        label: 'Academic Warning',
        color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 border-amber-250 dark:border-amber-900/30',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-455" />,
        desc: 'Academic Warning! Your CGPA is below satisfactory.',
      };
    }
    return {
      label: 'Academic Dismissal Risk',
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-300 border-rose-250 dark:border-rose-900/30',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      desc: 'Critical Status! Seek academic advising immediately.',
    };
  };

  const standing = getAcademicStanding(cgpa);
  const isDark = document.documentElement.classList.contains('dark');
  const gridStroke = isDark ? '#212124' : '#E5DCCE';

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-[#2A2723] dark:text-[#F3F3F5] tracking-tight mt-2 block">{formatGpa(cgpa)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5DCCE] dark:border-[#212124]">
            <span className="text-xs text-[#6E685F] dark:text-[#A1A1A5] font-bold">Out of 4.00 Scale</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider block">Credits Completed</span>
            <span className="text-3xl font-black text-[#2A2723] dark:text-[#F3F3F5] tracking-tight mt-2 block">
              {totalCredits} <span className="text-sm font-semibold text-[#6E685F] dark:text-[#A1A1A5]">/ {gradCreditsGoal}</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-[10px] text-[#6E685F] dark:text-[#A1A1A5] font-bold mb-1">
              <span>Degree progress</span>
              <span>{grad.progressPercent}%</span>
            </div>
            <div className="w-full bg-[#F4EFE6] dark:bg-[#121216]/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#B45309] dark:bg-[#EAB308] h-full rounded-full transition-all duration-500"
                style={{ width: `${grad.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase tracking-wider block">Target GPA Status</span>
            <span className="text-3xl font-black text-[#2A2723] dark:text-[#F3F3F5] tracking-tight mt-2 block">{targetCgpa.toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5DCCE] dark:border-[#212124] flex items-center justify-between text-xs font-semibold">
            {cgpa >= targetCgpa ? (
              <span className="text-emerald-650 dark:text-emerald-400 flex items-center gap-1 font-bold">Target Met</span>
            ) : (
              <span className="text-[#6E685F] dark:text-[#A1A1A5]">
                Behind by <strong className="text-rose-650 dark:text-rose-400 font-bold">{formatGpa(targetCgpa - cgpa)}</strong>
              </span>
            )}
          </div>
        </div>

        <div className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors ${standing.color}`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-75 block">Academic Status</span>
            <span className="text-lg font-black tracking-tight mt-2 block leading-snug">{standing.label}</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold border-t border-current/10 pt-3">
            {standing.icon}
            <span className="truncate" title={standing.desc}>{standing.desc}</span>
          </div>
        </div>
      </div>

      {/* Graduation Requirement Tracker */}
      <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Graduation Requirement Tracker
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] mb-2">
              <span>Total Credits</span>
              <span>{grad.totalCredits} / {grad.gradGoal}</span>
            </div>
            <div className="w-full bg-[#F4EFE6] dark:bg-[#121216]/50 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#B45309] dark:bg-[#EAB308] h-full rounded-full"
                style={{ width: `${grad.progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6E685F] dark:text-[#A1A1A5] mt-1">{grad.remainingCredits} credits remaining</p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] mb-2">
              <span>Core Courses</span>
              <span>{grad.coreCredits} / {grad.coreRequired}</span>
            </div>
            <div className="w-full bg-[#F4EFE6] dark:bg-[#121216]/50 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(Math.round((grad.coreCredits / grad.coreRequired) * 100), 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#6E685F] dark:text-[#A1A1A5] mt-1">{grad.coreRemaining} core credits left</p>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] mb-2">
              <span>Electives</span>
              <span>{grad.electiveCredits} / {grad.electiveRequired}</span>
            </div>
            <div className="w-full bg-[#F4EFE6] dark:bg-[#121216]/50 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${Math.min(Math.round((grad.electiveCredits / grad.electiveRequired) * 100), 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#6E685F] dark:text-[#A1A1A5] mt-1">{grad.electiveRemaining} elective credits left</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-rose-500/10 rounded-xl p-3 text-center border border-rose-200/50 dark:border-rose-900/30">
              <span className="text-2xl font-black text-rose-600">{grad.failedCount}</span>
              <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">Failed</p>
            </div>
            <div className="flex-1 bg-[#F4EFE6] dark:bg-[#121216] rounded-xl p-3 text-center border border-[#E5DCCE] dark:border-[#212124]">
              <span className="text-2xl font-black text-[#B45309] dark:text-[#EAB308]">{grad.retakeCount}</span>
              <p className="text-[10px] font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase mt-1">Retakes</p>
            </div>
          </div>
        </div>
        {grad.failedCourses.length > 0 && (
          <div className="border-t border-[#E5DCCE] dark:border-[#212124] pt-4">
            <p className="text-xs font-bold text-[#6E685F] dark:text-[#A1A1A5] uppercase mb-2">Failed / Repeated Courses</p>
            <div className="flex flex-wrap gap-2">
              {grad.failedCourses.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-200/40 dark:border-rose-900/30"
                >
                  {c.name} ({c.grade}) — {c.semester}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strongest / Weakest Semesters */}
      {(strongest || weakest) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strongest && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 flex items-center gap-4">
              <ThumbsUp className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase">Strongest Semester</p>
                <p className="font-black text-[#2A2723] dark:text-[#F3F3F5]">{strongest.name}</p>
                <p className="text-sm text-emerald-600 font-bold">GPA {formatGpa(strongest.GPA)}</p>
              </div>
            </div>
          )}
          {weakest && semesterData.length > 1 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 flex items-center gap-4">
              <ThumbsDown className="w-8 h-8 text-amber-550 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase">Weakest Semester</p>
                <p className="font-black text-[#2A2723] dark:text-[#F3F3F5]">{weakest.name}</p>
                <p className="text-sm text-amber-600 font-bold">GPA {formatGpa(weakest.GPA)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm lg:col-span-2 transition-colors">
          <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Semester-wise GPA Trend
          </h3>
          <div className="h-64 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 4.0]} ticks={[0, 1.0, 2.0, 3.0, 4.0]} stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? '#121216' : '#FAF6EE', border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`, borderRadius: '12px', color: isDark ? '#F3F3F5' : '#2A2723', fontSize: '12px' }}
                    itemStyle={{ color: isDark ? '#EAB308' : '#B45309', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: isDark ? '#A1A1A5' : '#6E685F' }}
                  />
                  <Line type="monotone" dataKey="GPA" stroke={isDark ? '#EAB308' : '#B45309'} strokeWidth={3} activeDot={{ r: 6 }} dot={{ stroke: isDark ? '#EAB308' : '#B45309', strokeWidth: 2, r: 4, fill: isDark ? '#0C0C0E' : '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#A1A1A5] font-semibold text-sm">
                No semester records found. Add data in the GPA Calculator.
              </div>
            )}
          </div>
        </div>        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col transition-colors">
          <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Grade Distribution
          </h3>
          <div className="h-48 w-full relative flex-1">
            {gradeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#121216' : '#FAF6EE', border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`, borderRadius: '12px', color: isDark ? '#F3F3F5' : '#2A2723', fontSize: '11px' }} itemStyle={{ fontWeight: 'bold', color: isDark ? '#EAB308' : '#B45309' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#A1A1A5] font-semibold text-xs text-center">No grades found.</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold text-[#6E685F] dark:text-[#A1A1A5] max-h-16 overflow-y-auto">
            {gradeDistributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm transition-colors">
          <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Pass / Fail Statistics
          </h3>
          <div className="h-48">
            {passFailData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={passFailData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#121216' : '#FAF6EE', border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`, borderRadius: '12px', fontSize: '11px', color: isDark ? '#F3F3F5' : '#2A2723' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6E685F] dark:text-[#A1A1A5] text-sm">No course data</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm lg:col-span-2 transition-colors">
          <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Credit Load vs GPA
          </h3>
          <div className="h-48">
            {creditGpaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={creditGpaData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#6E685F" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#6E685F" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 4]} stroke={isDark ? '#EAB308' : '#B45309'} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#121216' : '#FAF6EE', border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`, borderRadius: '12px', fontSize: '11px', color: isDark ? '#F3F3F5' : '#2A2723' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Credits" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="GPA" stroke={isDark ? '#EAB308' : '#B45309'} strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6E685F] dark:text-[#A1A1A5] text-sm">No semester data</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Graduation Goal Planner
            </h3>
            <p className="text-xs text-[#6E685F] dark:text-[#A1A1A5] font-bold leading-relaxed mb-6">
              Track remaining credits and required performance to reach your target CGPA.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-[#E5DCCE] dark:border-[#212124] text-xs font-semibold">
                <span className="text-[#6E685F] dark:text-[#A1A1A5]">Remaining Credits</span>
                <span className="text-[#2A2723] dark:text-[#F3F3F5]">{remainingCredits} Hrs</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5DCCE] dark:border-[#212124] text-xs font-semibold">
                <span className="text-[#6E685F] dark:text-[#A1A1A5]">Required Target CGPA</span>
                <span className="text-[#2A2723] dark:text-[#F3F3F5]">{targetCgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-xs font-semibold">
                <span className="text-[#6E685F] dark:text-[#A1A1A5]">Target status</span>
                {remainingCredits <= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Completed degree!</span>
                ) : required && !required.possible ? (
                  <span className="text-rose-655 font-bold">Impossible (&gt; 4.0)</span>
                ) : required && required.requiredGpa <= 0 ? (
                  <span className="text-emerald-650 dark:text-emerald-400 font-bold">Safe (Target met)</span>
                ) : required ? (
                  <span className="text-slate-750 dark:text-slate-300 font-bold">
                    Needed avg: <strong className="text-[#B45309] dark:text-[#EAB308] text-sm font-black">{formatGpa(required.requiredGpa)}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0C0C0E] border border-[#E5DCCE] dark:border-[#212124] rounded-2xl p-5 shadow-sm lg:col-span-2 transition-colors">
          <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#F3F3F5] mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B45309] dark:text-[#EAB308]" /> Semester-wise Credit Load
          </h3>
          <div className="h-56 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: isDark ? '#121216' : '#F4EFE6' }}
                    contentStyle={{ backgroundColor: isDark ? '#121216' : '#FAF6EE', border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`, borderRadius: '12px', color: isDark ? '#F3F3F5' : '#2A2723', fontSize: '12px' }}
                    itemStyle={{ color: isDark ? '#EAB308' : '#B45309', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: isDark ? '#A1A1A5' : '#6E685F' }}
                  />
                  <Bar dataKey="Credits" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#A1A1A5] font-semibold text-sm">No semester credit data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
