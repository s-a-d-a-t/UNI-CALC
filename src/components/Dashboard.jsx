import React, { useState } from 'react';
import {
  AreaChart,
  Area,
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
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
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
  getGradeDistributionData,
  getPerformanceAnalytics,
  getGraduationStats,
  getPassFailStats,
  getStrongestWeakestSemesters,
  getCreditLoadVsGpaData,
  requiredGradeForTarget,
  formatGpa,
  GRADE_COLORS,
} from '../utils/gpa';

const PASS_FAIL_COLORS = { Passed: '#10b981', Failed: '#f43f5e' };

function ChartTooltipShell({ active, payload, label, children, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5 shadow-lg text-xs"
      style={{
        backgroundColor: isDark ? '#121216' : '#FAF6EE',
        border: `1px solid ${isDark ? '#212124' : '#E5DCCE'}`,
        color: isDark ? '#F3F3F5' : '#2A2723',
      }}
    >
      {label && (
        <p className="font-bold mb-1.5" style={{ color: isDark ? '#A1A1A5' : '#6E685F' }}>
          {label}
        </p>
      )}
      {children || (
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.dataKey || entry.name} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GpaTrendTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <ChartTooltipShell active={active} payload={payload} label={label} isDark={isDark}>
      <div className="space-y-1.5 min-w-[160px]">
        <div className="flex justify-between gap-4">
          <span className="text-[#B45309] dark:text-[#22C55E]">Semester GPA</span>
          <span className="font-black">{formatGpa(data.GPA)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-blue-500">Cumulative CGPA</span>
          <span className="font-black">{formatGpa(data.cumulativeCGPA)}</span>
        </div>
        <div className="border-t border-current/10 pt-1.5 space-y-0.5 text-[10px] opacity-80">
          <div className="flex justify-between">
            <span>Credits</span>
            <span>{data.Credits} hrs</span>
          </div>
          <div className="flex justify-between">
            <span>Courses</span>
            <span>{data.courseCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Passed / Failed</span>
            <span>
              {data.passed} / {data.failed}
            </span>
          </div>
        </div>
      </div>
    </ChartTooltipShell>
  );
}

function GradeDistTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <ChartTooltipShell active={active} payload={payload} label={`Grade ${data.name} (${data.points})`} isDark={isDark}>
      <div className="space-y-1 min-w-[140px]">
        <div className="flex justify-between gap-4">
          <span>Courses</span>
          <span className="font-bold">
            {data.courses} ({data.coursePct}%)
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Credit hrs</span>
          <span className="font-bold">
            {data.credits} ({data.creditPct}%)
          </span>
        </div>
      </div>
    </ChartTooltipShell>
  );
}

function CreditGpaTooltip({ active, payload, label, isDark, avgCreditLoad }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  const loadDiff = data.Credits - avgCreditLoad;
  return (
    <ChartTooltipShell active={active} payload={payload} label={label} isDark={isDark}>
      <div className="space-y-1.5 min-w-[150px]">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-500">Credits</span>
          <span className="font-bold">{data.Credits} hrs</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#B45309] dark:text-[#22C55E]">GPA</span>
          <span className="font-bold">{formatGpa(data.GPA)}</span>
        </div>
        {avgCreditLoad > 0 && (
          <div className="text-[10px] opacity-75 border-t border-current/10 pt-1">
            {loadDiff > 0 ? '+' : ''}
            {loadDiff} hrs vs avg load ({avgCreditLoad})
          </div>
        )}
      </div>
    </ChartTooltipShell>
  );
}

function CreditLoadTooltip({ active, payload, label, isDark, avgCreditLoad }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <ChartTooltipShell active={active} payload={payload} label={label} isDark={isDark}>
      <div className="space-y-1 min-w-[140px]">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-500">Credits</span>
          <span className="font-bold">{data.Credits} hrs</span>
        </div>
        <div className="flex justify-between gap-4 text-[10px] opacity-80">
          <span>Courses</span>
          <span>{data.courseCount}</span>
        </div>
        {avgCreditLoad > 0 && (
          <div className="text-[10px] opacity-75 border-t border-current/10 pt-1">
            Avg load: {avgCreditLoad} hrs/sem
          </div>
        )}
      </div>
    </ChartTooltipShell>
  );
}

export default function Dashboard({ semesters, profile }) {
  const [activeTab, setActiveTab] = useState('overview');

  const semesterData = getSemesterChartData(semesters);
  const { totalCredits, cgpa: cgpaRaw } = calculateGlobalStats(semesters);
  const cgpa = cgpaRaw;

  const gradeDistributionData = getGradeDistributionData(semesters);
  const targetCgpa = profile ? profile.targetCgpa : 3.5;
  const gradCreditsGoal = profile ? profile.graduationCredits : 145;
  const grad = getGraduationStats(semesters, profile);
  const passFail = getPassFailStats(semesters);
  const analytics = getPerformanceAnalytics(semesters, semesterData, targetCgpa);
  const { strongest, weakest } = getStrongestWeakestSemesters(semesterData);
  const creditGpaData = getCreditLoadVsGpaData(semesterData);

  const remainingCredits = grad.remainingCredits;
  const required = requiredGradeForTarget(semesters, remainingCredits, targetCgpa);

  const gpaYMin = semesterData.length > 0
    ? Math.max(0, Math.floor(Math.min(...semesterData.map((s) => Math.min(s.GPA, s.cumulativeCGPA))) * 10) / 10 - 0.2)
    : 0;

  const getAcademicStanding = (cgpaValue) => {
    if (cgpaValue === 0 && totalCredits === 0) {
      return {
        label: 'No Data',
        color: 'text-slate-500 bg-slate-100 dark:bg-[#0D1117]/50 dark:text-[#8B949E] border-slate-200 dark:border-[#30363D]',
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
  const accentStroke = isDark ? '#22C55E' : '#B45309';

  const TrendIcon = analytics.trend === 'up' ? TrendingUp : analytics.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    analytics.trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : analytics.trend === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-[#6E685F] dark:text-[#8B949E]';

  return (
    <div className="space-y-6 max-md:space-y-6 md:space-y-8 w-full min-w-0">
      
      {/* Tabs */}
      <div className="flex border-b border-[#E5DCCE] dark:border-[#30363D] overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'graduation', label: 'Graduation', icon: GraduationCap }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-[#B45309] text-[#B45309] dark:border-[#22C55E] dark:text-[#22C55E]' 
                  : 'border-transparent text-[#6E685F] dark:text-[#8B949E] hover:text-[#2A2723] dark:hover:text-[#F3F3F5] hover:bg-[#F4EFE6]/50 dark:hover:bg-[#121216]/50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 max-md:space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-md:gap-3 md:gap-5">
            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <span className="text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider block">Cumulative CGPA</span>
                <span className="text-2xl max-md:text-2xl md:text-3xl font-black text-[#2A2723] dark:text-[#E6EDF3] tracking-tight mt-2 block">{formatGpa(cgpa)}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5DCCE] dark:border-[#30363D]">
                <span className="text-xs text-[#6E685F] dark:text-[#8B949E] font-bold">Out of 4.00 Scale</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <span className="text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider block">Credits Completed</span>
                <span className="text-3xl font-black text-[#2A2723] dark:text-[#E6EDF3] tracking-tight mt-2 block">
                  {totalCredits} <span className="text-sm font-semibold text-[#6E685F] dark:text-[#8B949E]">/ {gradCreditsGoal}</span>
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-[10px] text-[#6E685F] dark:text-[#8B949E] font-bold mb-1">
                  <span>Degree progress</span>
                  <span>{grad.progressPercent}%</span>
                </div>
                <div className="w-full bg-[#F4EFE6] dark:bg-[#161B22]/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#B45309] dark:bg-[#22C55E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${grad.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <span className="text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wider block">Target GPA Status</span>
                <span className="text-3xl font-black text-[#2A2723] dark:text-[#E6EDF3] tracking-tight mt-2 block">{targetCgpa.toFixed(2)}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5DCCE] dark:border-[#30363D] flex items-center justify-between text-xs font-semibold">
                {cgpa >= targetCgpa ? (
                  <span className="text-emerald-650 dark:text-emerald-400 flex items-center gap-1 font-bold">Target Met</span>
                ) : (
                  <span className="text-[#6E685F] dark:text-[#8B949E]">
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
                <span className="line-clamp-2 max-md:line-clamp-2 md:truncate" title={standing.desc}>{standing.desc}</span>
              </div>
            </div>
          </div>

          {/* Performance analytics summary */}
          {analytics.totalCourses > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-md:gap-3 md:gap-4">
              {[
                { label: 'Total Courses', value: analytics.totalCourses, iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400', icon: <BookOpen className="w-5 h-5" /> },
                { label: 'Semesters', value: analytics.semesterCount, iconBg: 'bg-blue-500/10 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400', icon: <Calendar className="w-5 h-5" /> },
                { label: 'Avg Credit Load', value: `${analytics.avgCreditLoad} hrs`, iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', icon: <BarChart3 className="w-5 h-5" /> },
                {
                  label: 'Pass Rate',
                  value: `${passFail.passRateCredits}%`,
                  sub: 'by credits',
                  iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                  iconColor: 'text-emerald-600 dark:text-emerald-400',
                  icon: <CheckCircle2 className="w-5 h-5" />
                },
                {
                  label: 'Recent Trend',
                  value: analytics.trend === 'stable' ? 'Stable' : `${analytics.trendDelta > 0 ? '+' : ''}${formatGpa(analytics.trendDelta)}`,
                  iconBg: analytics.trend === 'up' ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : analytics.trend === 'down' ? 'bg-rose-500/10 dark:bg-rose-500/20' : 'bg-slate-500/10 dark:bg-slate-500/20',
                  iconColor: trendColor,
                  icon: <TrendIcon className="w-5 h-5" />
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden group bg-gradient-to-br from-[#F4EFE6] to-white dark:from-[#1A1A1F] dark:to-[#0C0C0E] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${item.iconBg} ${item.iconColor}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#6E685F] dark:text-[#8B949E] uppercase tracking-wide">{item.label}</p>
                      <p className="text-lg font-black text-[#2A2723] dark:text-[#E6EDF3] mt-0.5 leading-tight">
                        {item.value}
                      </p>
                      {item.sub && <p className="text-[9px] text-[#6E685F] dark:text-[#8B949E] mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-md:gap-6 md:gap-8">
            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm lg:col-span-2 transition-colors min-w-0">
              <div className="flex flex-col max-md:flex-col md:flex-row items-start justify-between gap-2 mb-4">
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> GPA Performance Trend
                </h3>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold max-md:text-left md:text-right md:max-w-[180px]">
                  Semester GPA vs running CGPA · dashed lines = pass (2.0) & target
                </p>
              </div>
              <div className="h-64 max-md:h-64 md:h-72 w-full chart-scroll">
                {semesterData.length > 0 && totalCredits > 0 ? (
                  <div className="chart-scroll-inner h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={semesterData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={accentStroke} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={accentStroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
                      <XAxis dataKey="name" stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        domain={[gpaYMin, 4.0]}
                        stroke="#6E685F"
                        fontSize={11}
                        fontWeight={600}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.toFixed(1)}
                        tickMargin={8}
                      />
                      <Tooltip content={<GpaTrendTooltip isDark={isDark} />} cursor={{ stroke: gridStroke, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <ReferenceLine y={2.0} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'Pass', position: 'insideTopRight', fontSize: 9, fill: '#3b82f6' }} />
                      <ReferenceLine y={targetCgpa} stroke={accentStroke} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Target', position: 'insideBottomRight', fontSize: 9, fill: accentStroke }} />
                      <Area
                        type="natural"
                        name="Semester GPA"
                        dataKey="GPA"
                        stroke={accentStroke}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gpaGradient)"
                        activeDot={{ r: 7, strokeWidth: 0, fill: accentStroke, style: { filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' } }}
                        dot={{ stroke: accentStroke, strokeWidth: 2.5, r: 4, fill: isDark ? '#161B22' : '#fff' }}
                      />
                      <Line
                        type="natural"
                        name="Cumulative CGPA"
                        dataKey="cumulativeCGPA"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                        dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3, fill: isDark ? '#161B22' : '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#8B949E] font-semibold text-sm text-center px-2">
                    No semester records found. Add data in the GPA Calculator.
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm lg:col-span-1 flex flex-col transition-colors overflow-hidden">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Grade Distribution
                </h3>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold mt-1">Credit-weighted · sorted by scale</p>
              </div>
              <div className="h-52 max-md:h-64 md:h-56 w-full flex-1 chart-scroll grade-dist-chart">
                {gradeDistributionData.length > 0 ? (
                  <div className="chart-scroll-inner h-full grade-dist-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistributionData} layout="vertical" margin={{ top: 5, right: 8, left: 18, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                      <XAxis type="number" stroke="#6E685F" fontSize={10} tickLine={false} axisLine={false} unit=" cr" />
                      <YAxis type="category" dataKey="name" stroke="#6E685F" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} width={32} />
                      <Tooltip content={<GradeDistTooltip isDark={isDark} />} />
                      <Bar dataKey="credits" name="Credit hrs" radius={[0, 6, 6, 0]} maxBarSize={18}>
                        {gradeDistributionData.map((entry) => (
                          <Cell key={entry.name} fill={GRADE_COLORS[entry.name] || '#6E685F'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#8B949E] font-semibold text-xs text-center">No grades found.</div>
                )}
              </div>
              <div className="grid grid-cols-1 max-md:grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 text-[9px] font-bold text-[#6E685F] dark:text-[#8B949E] max-h-24 max-md:max-h-24 md:max-h-20 overflow-y-auto">
                {gradeDistributionData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: GRADE_COLORS[entry.name] }} />
                    <span className="truncate">
                      {entry.name}: {entry.courses}c / {entry.credits}cr ({entry.creditPct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6 max-md:space-y-6 md:space-y-8">
          {/* Strongest / Weakest Semesters */}
          {(strongest || weakest) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strongest && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 flex items-center gap-4">
                  <ThumbsUp className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase">Strongest Semester</p>
                    <p className="font-black text-[#2A2723] dark:text-[#E6EDF3]">{strongest.name}</p>
                    <p className="text-sm text-emerald-600 font-bold">
                      GPA {formatGpa(strongest.GPA)} · {strongest.Credits} credits · {strongest.courseCount} courses
                    </p>
                  </div>
                </div>
              )}
              {weakest && semesterData.length > 1 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 flex items-center gap-4">
                  <ThumbsDown className="w-8 h-8 text-amber-550 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase">Weakest Semester</p>
                    <p className="font-black text-[#2A2723] dark:text-[#E6EDF3]">{weakest.name}</p>
                    <p className="text-sm text-amber-600 font-bold">
                      GPA {formatGpa(weakest.GPA)} · {weakest.Credits} credits · {weakest.courseCount} courses
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-6 md:gap-8">
            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm transition-colors min-w-0">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Credit Load vs GPA
                </h3>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold mt-1">
                  Bars = credits per semester · line = GPA · avg load {analytics.avgCreditLoad} hrs
                </p>
              </div>
              <div className="h-52 max-md:h-52 md:h-56 chart-scroll">
                {creditGpaData.length > 0 ? (
                  <div className="chart-scroll-inner h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={creditGpaData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                      <XAxis dataKey="name" stroke="#6E685F" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis
                        yAxisId="left"
                        stroke="#10b981"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Credits', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#10b981' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[gpaYMin, 4]}
                        stroke={accentStroke}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.toFixed(1)}
                        label={{ value: 'GPA', angle: 90, position: 'insideRight', fontSize: 9, fill: accentStroke }}
                      />
                      <Tooltip content={<CreditGpaTooltip isDark={isDark} avgCreditLoad={analytics.avgCreditLoad} />} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {analytics.avgCreditLoad > 0 && (
                        <ReferenceLine
                          yAxisId="left"
                          y={analytics.avgCreditLoad}
                          stroke="#6E685F"
                          strokeDasharray="4 4"
                          strokeOpacity={0.5}
                          label={{ value: 'Avg', position: 'insideTopLeft', fontSize: 9, fill: '#6E685F' }}
                        />
                      )}
                      <ReferenceLine yAxisId="right" y={2.0} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.4} />
                      <Bar yAxisId="left" dataKey="Credits" name="Credits" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} opacity={0.85} />
                      <Line yAxisId="right" type="monotone" dataKey="GPA" name="GPA" stroke={accentStroke} strokeWidth={2.5} dot={{ r: 5, fill: isDark ? '#161B22' : '#fff', stroke: accentStroke, strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#6E685F] dark:text-[#8B949E] text-sm text-center px-2">No semester data</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm transition-colors min-w-0">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Semester-wise Credit Load
                </h3>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold mt-1">
                  Avg {analytics.avgCreditLoad} hrs/sem · {analytics.totalCredits} total hrs earned
                </p>
              </div>
              <div className="h-52 max-md:h-52 md:h-56 w-full chart-scroll">
                {semesterData.length > 0 && totalCredits > 0 ? (
                  <div className="chart-scroll-inner h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semesterData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                      <XAxis dataKey="name" stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6E685F" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} unit=" cr" />
                      <Tooltip content={<CreditLoadTooltip isDark={isDark} avgCreditLoad={analytics.avgCreditLoad} />} />
                      {analytics.avgCreditLoad > 0 && (
                        <ReferenceLine
                          y={analytics.avgCreditLoad}
                          stroke={accentStroke}
                          strokeDasharray="4 4"
                          strokeOpacity={0.6}
                          label={{ value: `Avg ${analytics.avgCreditLoad}`, position: 'insideTopRight', fontSize: 9, fill: accentStroke }}
                        />
                      )}
                      <Bar dataKey="Credits" name="Credits" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45}>
                        {semesterData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.Credits > analytics.avgCreditLoad ? '#059669' : entry.Credits < analytics.avgCreditLoad ? '#6ee7b7' : '#10b981'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-[#6E685F] dark:text-[#8B949E] font-semibold text-sm text-center px-2">No semester credit data.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'graduation' && (
        <div className="space-y-6 max-md:space-y-6 md:space-y-8">
          {/* Graduation Requirement Tracker */}
          <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-6 shadow-sm">
            <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] mb-4 max-md:mb-4 md:mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Graduation Requirement Tracker
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 max-md:gap-4 md:gap-6 mb-4 max-md:mb-4 md:mb-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#8B949E] mb-2">
                  <span>Total Credits</span>
                  <span>{grad.totalCredits} / {grad.gradGoal}</span>
                </div>
                <div className="w-full bg-[#F4EFE6] dark:bg-[#161B22]/50 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#B45309] dark:bg-[#22C55E] h-full rounded-full"
                    style={{ width: `${grad.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] mt-1">{grad.remainingCredits} credits remaining</p>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#8B949E] mb-2">
                  <span>Core Courses</span>
                  <span>{grad.coreCredits} / {grad.coreRequired}</span>
                </div>
                <div className="w-full bg-[#F4EFE6] dark:bg-[#161B22]/50 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.round((grad.coreCredits / grad.coreRequired) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] mt-1">{grad.coreRemaining} core credits left</p>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-[#6E685F] dark:text-[#8B949E] mb-2">
                  <span>Electives</span>
                  <span>{grad.electiveCredits} / {grad.electiveRequired}</span>
                </div>
                <div className="w-full bg-[#F4EFE6] dark:bg-[#161B22]/50 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.round((grad.electiveCredits / grad.electiveRequired) * 100), 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] mt-1">{grad.electiveRemaining} elective credits left</p>
              </div>
              <div className="flex gap-3 max-md:gap-3 md:gap-4 sm:col-span-2 lg:col-span-1">
                <div className="flex-1 bg-rose-500/10 rounded-xl p-3 text-center border border-rose-200/50 dark:border-rose-900/30">
                  <span className="text-2xl font-black text-rose-600">{grad.failedCount}</span>
                  <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">Failed</p>
                </div>
                <div className="flex-1 bg-[#F4EFE6] dark:bg-[#161B22] rounded-xl p-3 text-center border border-[#E5DCCE] dark:border-[#30363D]">
                  <span className="text-2xl font-black text-[#B45309] dark:text-[#22C55E]">{grad.retakeCount}</span>
                  <p className="text-[10px] font-bold text-[#6E685F] dark:text-[#8B949E] uppercase mt-1">Retakes</p>
                </div>
              </div>
            </div>
            {grad.failedCourses.length > 0 && (
              <div className="border-t border-[#E5DCCE] dark:border-[#30363D] pt-4">
                <p className="text-xs font-bold text-[#6E685F] dark:text-[#8B949E] uppercase mb-2">Failed / Repeated Courses</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-6 md:gap-8">
            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-6 shadow-sm flex flex-col justify-between transition-colors min-w-0">
              <div>
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Graduation Goal Planner
                </h3>
                <p className="text-xs text-[#6E685F] dark:text-[#8B949E] font-bold leading-relaxed mb-6">
                  Track remaining credits and required performance to reach your target CGPA.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[#E5DCCE] dark:border-[#30363D] text-xs font-semibold">
                    <span className="text-[#6E685F] dark:text-[#8B949E]">Remaining Credits</span>
                    <span className="text-[#2A2723] dark:text-[#E6EDF3]">{remainingCredits} Hrs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E5DCCE] dark:border-[#30363D] text-xs font-semibold">
                    <span className="text-[#6E685F] dark:text-[#8B949E]">Required Target CGPA</span>
                    <span className="text-[#2A2723] dark:text-[#E6EDF3]">{targetCgpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E5DCCE] dark:border-[#30363D] text-xs font-semibold">
                    <span className="text-[#6E685F] dark:text-[#8B949E]">Quality Points</span>
                    <span className="text-[#2A2723] dark:text-[#E6EDF3]">{analytics.totalPoints.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-xs font-semibold">
                    <span className="text-[#6E685F] dark:text-[#8B949E]">Target status</span>
                    {remainingCredits <= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Completed degree!</span>
                    ) : required && !required.possible ? (
                      <span className="text-rose-655 font-bold">Impossible (&gt; 4.0)</span>
                    ) : required && required.requiredGpa <= 0 ? (
                      <span className="text-emerald-650 dark:text-emerald-400 font-bold">Safe (Target met)</span>
                    ) : required ? (
                      <span className="text-slate-750 dark:text-slate-300 font-bold">
                        Needed avg: <strong className="text-[#B45309] dark:text-[#22C55E] text-sm font-black">{formatGpa(required.requiredGpa)}</strong>
                        {required.letter && (
                          <span className="block text-[10px] font-semibold text-[#6E685F] dark:text-[#8B949E] mt-0.5">
                            ≈ {required.gradeValue || required.letter}
                          </span>
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-[#E5DCCE] dark:border-[#30363D] rounded-2xl p-4 max-md:p-4 md:p-5 shadow-sm transition-colors min-w-0">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-[#2A2723] dark:text-[#E6EDF3] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#B45309] dark:text-[#22C55E]" /> Pass / Fail Statistics
                </h3>
                <p className="text-[10px] text-[#6E685F] dark:text-[#8B949E] font-semibold mt-1">By course count & credit hours</p>
              </div>
              {passFail.totalCourses > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-emerald-500/10 rounded-lg p-2.5 text-center border border-emerald-200/40 dark:border-emerald-900/30">
                      <p className="text-lg font-black text-emerald-600">{passFail.passedCourses}</p>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">Passed</p>
                      <p className="text-[9px] text-[#6E685F] dark:text-[#8B949E]">{passFail.passedCredits} cr · {passFail.passRateCourses}%</p>
                    </div>
                    <div className="bg-rose-500/10 rounded-lg p-2.5 text-center border border-rose-200/40 dark:border-rose-900/30">
                      <p className="text-lg font-black text-rose-600">{passFail.failedCourses}</p>
                      <p className="text-[9px] font-bold text-rose-600 uppercase">Failed</p>
                      <p className="text-[9px] text-[#6E685F] dark:text-[#8B949E]">{passFail.failedCredits} cr</p>
                    </div>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passFail.byCredits}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {passFail.byCredits.map((entry) => (
                            <Cell key={entry.name} fill={PASS_FAIL_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <ChartTooltipShell active label={d.name} isDark={isDark}>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-4">
                                    <span>Credits</span>
                                    <span className="font-bold">{d.value} hrs</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span>Courses</span>
                                    <span className="font-bold">{d.courses}</span>
                                  </div>
                                </div>
                              </ChartTooltipShell>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-[10px] font-bold text-[#6E685F] dark:text-[#8B949E] mt-2">
                    {passFail.passRateCredits}% pass rate by credits
                  </p>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-[#6E685F] dark:text-[#8B949E] text-sm">No course data</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
