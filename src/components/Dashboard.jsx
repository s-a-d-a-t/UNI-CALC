import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, Target, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

// Map grade points back to letters for grade distribution
const getGradeLetter = (value) => {
  const g = parseFloat(value).toFixed(2);
  if (g === '4.00') return 'A / A+';
  if (g === '3.75') return 'A-';
  if (g === '3.50') return 'B+';
  if (g === '3.00') return 'B';
  if (g === '2.75') return 'B-';
  if (g === '2.50') return 'C+';
  if (g === '2.00') return 'C';
  if (g === '1.75') return 'C-';
  if (g === '1.00') return 'D';
  return 'F';
};

export default function Dashboard({ semesters, profile }) {
  
  // 1. Calculations
  const semesterData = semesters.map(sem => {
    let semCredits = 0;
    let semPoints = 0;
    
    sem.courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const gradeVal = parseFloat(course.grade);
      
      if (!isNaN(credits) && credits > 0) {
        semCredits += credits;
        semPoints += (credits * gradeVal);
      }
    });
    
    const gpa = semCredits > 0 ? (semPoints / semCredits) : 0;
    
    return {
      name: sem.description || `Sem ${sem.number}`,
      GPA: parseFloat(gpa.toFixed(2)),
      Credits: semCredits,
      points: semPoints
    };
  });

  const totalCredits = semesterData.reduce((acc, curr) => acc + curr.Credits, 0);
  const totalPoints = semesterData.reduce((acc, curr) => acc + curr.points, 0);
  const cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.00;

  // Grade distributions
  const gradeCounts = {};
  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      const credits = parseFloat(course.credits);
      if (!isNaN(credits) && credits > 0) {
        const letter = getGradeLetter(course.grade);
        gradeCounts[letter] = (gradeCounts[letter] || 0) + 1;
      }
    });
  });

  const gradeDistributionData = Object.keys(gradeCounts).map(key => ({
    name: key,
    value: gradeCounts[key]
  }));

  // Graduation status & goal planner
  const targetCgpa = profile ? profile.targetCgpa : 3.50;
  const gradCreditsGoal = profile ? profile.graduationCredits : 145;
  const creditsPercentage = Math.min(Math.round((totalCredits / gradCreditsGoal) * 100), 100);
  
  const remainingCredits = Math.max(gradCreditsGoal - totalCredits, 0);
  const requiredTotalPoints = targetCgpa * gradCreditsGoal;
  const remainingPointsNeeded = Math.max(requiredTotalPoints - totalPoints, 0);
  
  let requiredAverageGpa = 0;
  if (remainingCredits > 0) {
    requiredAverageGpa = remainingPointsNeeded / remainingCredits;
  }

  // Academic Standing according to Ethiopian standard rules
  const getAcademicStanding = (cgpaValue) => {
    if (cgpaValue === 0 && totalCredits === 0) {
      return {
        label: 'No Data',
        color: 'text-slate-500 bg-slate-100 dark:bg-slate-900/50 dark:text-slate-400 border-slate-200 dark:border-slate-800',
        icon: <Calendar className="w-5 h-5" />,
        desc: 'Add semesters and course grades to check academic standing.'
      };
    }
    if (cgpaValue >= 3.75) {
      return {
        label: 'First Class Distinction',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-250 dark:border-emerald-900/30',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        desc: 'Excellent! You are on track for Great Distinction honors.'
      };
    }
    if (cgpaValue >= 3.50) {
      return {
        label: 'Distinction',
        color: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-300 border-indigo-250 dark:border-indigo-900/30',
        icon: <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
        desc: 'Outstanding performance. Maintain this to graduate with honors.'
      };
    }
    if (cgpaValue >= 2.0) {
      return {
        label: 'Satisfactory / Pass',
        color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300 border-blue-250 dark:border-blue-900/30',
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        desc: 'Good standing. Keep working to push your scores higher.'
      };
    }
    if (cgpaValue >= 1.75) {
      return {
        label: 'Academic Warning',
        color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 border-amber-250 dark:border-amber-900/30',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-455" />,
        desc: 'Academic Warning! Your CGPA is below satisfactory. Focus on raising grades next semester.'
      };
    }
    return {
      label: 'Academic Dismissal Risk',
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-300 border-rose-250 dark:border-rose-900/30',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      desc: 'Critical Status! Your CGPA is below 1.75. Seek academic advising immediately.'
    };
  };

  const standing = getAcademicStanding(cgpa);
  
  // Dynamic grid stroke color for dark mode
  const isDark = document.documentElement.classList.contains('dark');
  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-8">
      {/* Overview Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* CGPA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-2 block">{cgpa.toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-105 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Out of 4.00 Scale</span>
          </div>
        </div>

        {/* Graduation Credits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">Credits Completed</span>
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-2 block">{totalCredits} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/ {gradCreditsGoal}</span></span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-450 font-bold mb-1">
              <span>Degree progress</span>
              <span>{creditsPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-650 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${creditsPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Target GPA Goal status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider block">Target GPA Status</span>
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mt-2 block">{targetCgpa.toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-105 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            {cgpa >= targetCgpa ? (
              <span className="text-emerald-650 dark:text-emerald-400 flex items-center gap-1 font-bold">
                Target Met 🎉
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Behind by <strong className="text-rose-650 dark:text-rose-400 font-bold">{(targetCgpa - cgpa).toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Academic Standing */}
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

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GPA Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 transition-colors">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Semester-wise GPA Trend
          </h3>
          <div className="h-64 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 4.0]} ticks={[0, 1.0, 2.0, 3.0, 4.0]} stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="GPA" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
                No semester records found. Add data in the GPA Calculator.
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col transition-colors">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" /> Grade Distribution
          </h3>
          <div className="h-48 w-full relative flex-1">
            {gradeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 font-semibold text-xs text-center">
                No grades found.
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 max-h-16 overflow-y-auto">
            {gradeDistributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Graduation Goal Planner & Credit Hour Load Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Goal Planner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Graduation Goal Planner
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed mb-6">
              Track how many load hours you have left and what performance level you must sustain to graduate with your target.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <span className="text-slate-450 dark:text-slate-400">Remaining Credits</span>
                <span className="text-slate-700 dark:text-slate-200">{remainingCredits} Hrs</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <span className="text-slate-450 dark:text-slate-400">Required Target CGPA</span>
                <span className="text-slate-700 dark:text-slate-200">{targetCgpa.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-xs font-semibold">
                <span className="text-slate-455 dark:text-slate-400">Target status</span>
                {remainingCredits <= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Completed degree!</span>
                ) : requiredAverageGpa > 4.0 ? (
                  <span className="text-rose-650 dark:text-rose-455 font-bold">Mathematically Impossible (&gt; 4.0)</span>
                ) : requiredAverageGpa <= 0 ? (
                  <span className="text-emerald-650 dark:text-emerald-400 font-bold">Safe (Target met)</span>
                ) : (
                  <span className="text-slate-750 dark:text-slate-300 font-bold">Needed avg: <strong className="text-indigo-650 dark:text-indigo-400 text-sm font-black">{requiredAverageGpa.toFixed(2)}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {remainingCredits > 0 && requiredAverageGpa > 4.0 && (
              <span className="text-rose-500 dark:text-rose-400/80 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Note: To achieve {targetCgpa.toFixed(2)} CGPA, you must earn grades higher than a 4.0 average. Try taking extra elective credits or modifying your target GPA.
              </span>
            )}
            {remainingCredits > 0 && requiredAverageGpa <= 4.0 && requiredAverageGpa > 0 && (
              <span className="text-indigo-500 dark:text-indigo-400/80 flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Keep it up! Aiming for an average of {requiredAverageGpa.toFixed(2)} on your remaining {remainingCredits} credit hours will land you exactly at your CGPA target of {targetCgpa.toFixed(2)}.
              </span>
            )}
            {remainingCredits <= 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Graduation credit threshold reached! Adjust your Profile Settings if you have additional requirements.
              </span>
            )}
          </div>
        </div>

        {/* Credit Hours Load Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 transition-colors">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Semester-wise Credit Load
          </h3>
          <div className="h-56 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="Credits" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-450 dark:text-slate-500 font-semibold text-sm">
                No semester credit data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
