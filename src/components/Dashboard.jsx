import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, ChevronRight, Target, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

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
        color: 'text-slate-500 bg-slate-100 border-slate-200',
        icon: <Calendar className="w-5 h-5" />,
        desc: 'Add semesters and course grades to check academic standing.'
      };
    }
    if (cgpaValue >= 3.75) {
      return {
        label: 'First Class Distinction',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        desc: 'Excellent! You are on track for Great Distinction honors.'
      };
    }
    if (cgpaValue >= 3.50) {
      return {
        label: 'Distinction',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        icon: <Award className="w-5 h-5 text-indigo-600" />,
        desc: 'Outstanding performance. Maintain this to graduate with honors.'
      };
    }
    if (cgpaValue >= 2.0) {
      return {
        label: 'Satisfactory / Pass',
        color: 'text-blue-700 bg-blue-50 border-blue-200',
        icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        desc: 'Good standing. Keep working to push your scores higher.'
      };
    }
    if (cgpaValue >= 1.75) {
      return {
        label: 'Academic Warning',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        desc: 'Academic Warning! Your CGPA is below satisfactory. Focus on raising grades next semester.'
      };
    }
    return {
      label: 'Academic Dismissal Risk',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      desc: 'Critical Status! Your CGPA is below 1.75. Seek academic advising immediately.'
    };
  };

  const standing = getAcademicStanding(cgpa);

  return (
    <div className="space-y-8">
      {/* Overview Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* CGPA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight mt-2 block">{cgpa.toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Out of 4.00 Scale</span>
          </div>
        </div>

        {/* Graduation Credits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Credits Completed</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight mt-2 block">{totalCredits} <span className="text-sm font-semibold text-slate-400">/ {gradCreditsGoal}</span></span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-1">
              <span>Degree progress</span>
              <span>{creditsPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${creditsPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Target GPA Goal status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target GPA Status</span>
            <span className="text-3xl font-black text-slate-800 tracking-tight mt-2 block">{targetCgpa.toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            {cgpa >= targetCgpa ? (
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                Target Met 🎉
              </span>
            ) : (
              <span className="text-slate-500">
                Behind by <strong className="text-rose-600 font-bold">{(targetCgpa - cgpa).toFixed(2)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Academic Standing */}
        <div className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between ${standing.color}`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-75 block">Academic Status</span>
            <span className="text-lg font-black tracking-tight mt-2 block leading-snug">{standing.label}</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium border-t border-current/10 pt-3">
            {standing.icon}
            <span className="truncate" title={standing.desc}>{standing.desc}</span>
          </div>
        </div>
      </div>

      {/* Grid of Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GPA Trend Line Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Semester-wise GPA Trend
          </h3>
          <div className="h-64 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 4.0]} ticks={[0, 1.0, 2.0, 3.0, 4.0]} stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="GPA" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 font-medium text-sm">
                No semester records found. Add data in the GPA Calculator.
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col">
          <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
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
              <div className="h-full flex flex-col justify-center items-center text-slate-400 font-medium text-xs">
                No grades found.
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold text-slate-500 max-h-16 overflow-y-auto">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Graduation Goal Planner
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              Track how many load hours you have left and what performance level you must sustain to graduate with your target.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 text-xs font-semibold">
                <span className="text-slate-400">Remaining Credits</span>
                <span className="text-slate-700">{remainingCredits} Hrs</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-slate-100 text-xs font-semibold">
                <span className="text-slate-400">Required Target CGPA</span>
                <span className="text-slate-700">{targetCgpa.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-xs font-semibold">
                <span className="text-slate-400">Target status</span>
                {remainingCredits <= 0 ? (
                  <span className="text-emerald-600">Completed degree!</span>
                ) : requiredAverageGpa > 4.0 ? (
                  <span className="text-rose-600">Mathematically Impossible (Gpa &gt; 4.0)</span>
                ) : requiredAverageGpa <= 0 ? (
                  <span className="text-emerald-600">Safe (Target met)</span>
                ) : (
                  <span className="text-slate-700">Average GPA needed: <strong className="text-indigo-600 text-sm font-bold">{requiredAverageGpa.toFixed(2)}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
            {remainingCredits > 0 && requiredAverageGpa > 4.0 && (
              <span className="text-rose-500 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" /> Note: To achieve {targetCgpa.toFixed(2)} CGPA, you must earn grades higher than a 4.0 average. Try taking extra elective credits or modifying your target GPA.
              </span>
            )}
            {remainingCredits > 0 && requiredAverageGpa <= 4.0 && requiredAverageGpa > 0 && (
              <span className="text-indigo-500 flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-500" /> Keep it up! Aiming for an average of {requiredAverageGpa.toFixed(2)} on your remaining {remainingCredits} credit hours will land you exactly at your CGPA target of {targetCgpa.toFixed(2)}.
              </span>
            )}
            {remainingCredits <= 0 && (
              <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Graduation credit threshold reached! Adjust your Profile Settings if you have additional requirements.
              </span>
            )}
          </div>
        </div>

        {/* Credit Hours Load Distribution Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Semester-wise Credit Load
          </h3>
          <div className="h-56 w-full">
            {semesterData.length > 0 && totalCredits > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#94a3b8' }}
                  />
                  <Bar dataKey="Credits" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 font-medium text-sm">
                No semester credit data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
