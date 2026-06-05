export const GRADE_SCALE = [
  { label: 'A+ (4.0)', value: 'A+', points: 4.0, letter: 'A+' },
  { label: 'A (4.0)', value: 'A', points: 4.0, letter: 'A' },
  { label: 'A- (3.75)', value: 'A-', points: 3.75, letter: 'A-' },
  { label: 'B+ (3.50)', value: 'B+', points: 3.5, letter: 'B+' },
  { label: 'B (3.00)', value: 'B', points: 3.0, letter: 'B' },
  { label: 'B- (2.75)', value: 'B-', points: 2.75, letter: 'B-' },
  { label: 'C+ (2.50)', value: 'C+', points: 2.5, letter: 'C+' },
  { label: 'C (2.00)', value: 'C', points: 2.0, letter: 'C' },
  { label: 'C- (1.75)', value: 'C-', points: 1.75, letter: 'C-' },
  { label: 'D (1.00)', value: 'D', points: 1.0, letter: 'D' },
  { label: 'F (0.00)', value: 'F', points: 0.0, letter: 'F' },
];

const LEGACY_NUMERIC_GRADES = {
  '4.00': 'A',
  '3.75': 'A-',
  '3.50': 'B+',
  '3.00': 'B',
  '2.75': 'B-',
  '2.50': 'C+',
  '2.00': 'C',
  '1.75': 'C-',
  '1.00': 'D',
  '0.00': 'F',
};

export function normalizeGrade(grade) {
  const raw = String(grade ?? '').trim();
  if (GRADE_SCALE.some((s) => s.value === raw)) return raw;
  const fixed = parseFloat(raw).toFixed(2);
  if (LEGACY_NUMERIC_GRADES[fixed]) return LEGACY_NUMERIC_GRADES[fixed];
  if (LEGACY_NUMERIC_GRADES[raw]) return LEGACY_NUMERIC_GRADES[raw];
  return 'F';
}

export function getGradePoints(grade) {
  const normalized = normalizeGrade(grade);
  const match = GRADE_SCALE.find((s) => s.value === normalized);
  if (match) return match.points;
  const num = parseFloat(grade);
  return isNaN(num) ? 0 : num;
}

/** Truncate GPA to 2 decimals (Ethiopian standard — no rounding). e.g. 3.698 → 3.69 */
export function truncateGpa(value, decimals = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  const factor = 10 ** decimals;
  return Math.trunc(num * factor) / factor;
}

export function formatGpa(value, decimals = 2) {
  return truncateGpa(value, decimals).toFixed(decimals);
}

export const COURSE_CATEGORIES = [
  { value: 'core', label: 'Core' },
  { value: 'elective', label: 'Elective' },
  { value: 'general', label: 'General' },
];

export const COURSE_STATUSES = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'in_progress', label: 'In Progress' },
];

export function getGradeLetter(value) {
  return normalizeGrade(value);
}

export function isPassingGrade(grade) {
  return getGradePoints(grade) >= 2.0;
}

export function isFailedGrade(grade) {
  return getGradePoints(grade) < 2.0;
}

export function validCourse(course) {
  const credits = parseFloat(course.credits);
  const gradeVal = getGradePoints(course.grade);
  return !isNaN(credits) && credits > 0 && !isNaN(gradeVal);
}

export function calculateSemesterStats(courses) {
  let credits = 0;
  let points = 0;

  courses.forEach((course) => {
    if (!validCourse(course)) return;
    const c = parseFloat(course.credits);
    const g = getGradePoints(course.grade);
    credits += c;
    points += c * g;
  });

  return {
    credits,
    points,
    gpa: credits > 0 ? truncateGpa(points / credits) : 0,
  };
}

export function calculateGlobalStats(semesters) {
  let totalCredits = 0;
  let totalPoints = 0;

  (semesters || []).forEach((sem) => {
    const stats = calculateSemesterStats(sem.courses || []);
    totalCredits += stats.credits;
    totalPoints += stats.points;
  });

  return {
    totalCredits,
    totalPoints,
    cgpa: totalCredits > 0 ? truncateGpa(totalPoints / totalCredits) : 0,
  };
}

export const GRADE_COLORS = {
  'A+': '#059669',
  A: '#10b981',
  'A-': '#34d399',
  'B+': '#3b82f6',
  B: '#60a5fa',
  'B-': '#93c5fd',
  'C+': '#EAB308',
  C: '#fbbf24',
  'C-': '#fcd34d',
  D: '#f97316',
  F: '#f43f5e',
};

export function getSemesterChartData(semesters) {
  let runningCredits = 0;
  let runningPoints = 0;

  return (semesters || []).map((sem) => {
    const stats = calculateSemesterStats(sem.courses || []);
    runningCredits += stats.credits;
    runningPoints += stats.points;

    let passed = 0;
    let failed = 0;
    let courseCount = 0;
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      courseCount += 1;
      if (isPassingGrade(course.grade) && course.status !== 'failed') passed += 1;
      else failed += 1;
    });

    return {
      name: sem.description || `Sem ${sem.number}`,
      GPA: truncateGpa(stats.gpa),
      Credits: stats.credits,
      points: stats.points,
      cumulativeCGPA: runningCredits > 0 ? truncateGpa(runningPoints / runningCredits) : 0,
      courseCount,
      passed,
      failed,
    };
  });
}

export function getGradeDistributionData(semesters) {
  const counts = {};
  const creditsByGrade = {};
  GRADE_SCALE.forEach((s) => {
    counts[s.letter] = 0;
    creditsByGrade[s.letter] = 0;
  });

  let totalCourses = 0;
  let totalCredits = 0;

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      const letter = getGradeLetter(course.grade);
      const c = parseFloat(course.credits);
      counts[letter] = (counts[letter] || 0) + 1;
      creditsByGrade[letter] = (creditsByGrade[letter] || 0) + c;
      totalCourses += 1;
      totalCredits += c;
    });
  });

  return GRADE_SCALE.map((s) => ({
    name: s.letter,
    points: s.points,
    courses: counts[s.letter] || 0,
    credits: creditsByGrade[s.letter] || 0,
    coursePct: totalCourses > 0 ? truncateGpa((counts[s.letter] / totalCourses) * 100, 1) : 0,
    creditPct: totalCredits > 0 ? truncateGpa((creditsByGrade[s.letter] / totalCredits) * 100, 1) : 0,
  })).filter((d) => d.courses > 0);
}

export function getPerformanceAnalytics(semesters, semesterData, targetCgpa) {
  const global = calculateGlobalStats(semesters);
  const withGpa = semesterData.filter((s) => s.Credits > 0);

  const avgSemesterGpa =
    withGpa.length > 0
      ? truncateGpa(withGpa.reduce((sum, s) => sum + s.GPA, 0) / withGpa.length)
      : 0;

  const avgCreditLoad =
    withGpa.length > 0
      ? Math.round(withGpa.reduce((sum, s) => sum + s.Credits, 0) / withGpa.length)
      : 0;

  let trend = 'stable';
  let trendDelta = 0;
  if (withGpa.length >= 2) {
    const last = withGpa[withGpa.length - 1].GPA;
    const prev = withGpa[withGpa.length - 2].GPA;
    trendDelta = truncateGpa(last - prev);
    if (trendDelta > 0.05) trend = 'up';
    else if (trendDelta < -0.05) trend = 'down';
  }

  let totalCourses = 0;
  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (validCourse(course)) totalCourses += 1;
    });
  });

  return {
    ...global,
    avgSemesterGpa,
    avgCreditLoad,
    semesterCount: withGpa.length,
    totalCourses,
    trend,
    trendDelta,
    gapToTarget: truncateGpa(targetCgpa - global.cgpa),
    onTarget: global.cgpa >= targetCgpa,
  };
}

export function predictCgpa(completedSemesters, hypotheticalCourses) {
  const base = calculateGlobalStats(completedSemesters);
  let extraCredits = 0;
  let extraPoints = 0;

  hypotheticalCourses.forEach((course) => {
    if (!validCourse(course)) return;
    const c = parseFloat(course.credits);
    const g = getGradePoints(course.grade);
    extraCredits += c;
    extraPoints += c * g;
  });

  const totalCredits = base.totalCredits + extraCredits;
  const totalPoints = base.totalPoints + extraPoints;

  return {
    currentCgpa: base.cgpa,
    predictedCgpa: totalCredits > 0 ? truncateGpa(totalPoints / totalCredits) : 0,
    totalCredits,
    totalPoints,
    addedCredits: extraCredits,
  };
}

export function predictBestWorstCase(completedSemesters, inProgressCourses) {
  const best = inProgressCourses.map((c) => ({ ...c, grade: 'A' }));
  const worst = inProgressCourses.map((c) => ({ ...c, grade: 'F' }));
  return {
    best: predictCgpa(completedSemesters, best).predictedCgpa,
    worst: predictCgpa(completedSemesters, worst).predictedCgpa,
  };
}

export function requiredGradeForTarget(completedSemesters, remainingCredits, targetCgpa) {
  const base = calculateGlobalStats(completedSemesters);
  if (remainingCredits <= 0) return null;

  const requiredTotalPoints = targetCgpa * (base.totalCredits + remainingCredits);
  const pointsNeeded = requiredTotalPoints - base.totalPoints;
  const requiredGpa = pointsNeeded / remainingCredits;

  if (requiredGpa > 4.0) return { possible: false, requiredGpa, letter: null };
  if (requiredGpa <= 0) return { possible: true, requiredGpa: 0, letter: 'Any passing grade' };

  const closest = GRADE_SCALE.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev.points - requiredGpa);
    const currDiff = Math.abs(curr.points - requiredGpa);
    return currDiff < prevDiff ? curr : prev;
  });

  return {
    possible: requiredGpa <= 4.0,
    requiredGpa,
    letter: closest.label,
    gradeValue: closest.value,
  };
}

export function analyzeRetakes(semesters, retakeTargetGrade = 'B+') {
  const retakeCandidates = [];

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      if (!isFailedGrade(course.grade) && course.status !== 'failed') return;

      const credits = parseFloat(course.credits);
      const oldGrade = getGradePoints(course.grade);
      const newGrade = getGradePoints(retakeTargetGrade);
      const impact = (credits * (newGrade - oldGrade)) / calculateGlobalStats(semesters).totalCredits;

      retakeCandidates.push({
        courseId: course.id,
        courseName: course.name || 'Unnamed course',
        semester: sem.description || `Semester ${sem.number}`,
        credits,
        oldGrade,
        oldLetter: getGradeLetter(course.grade),
        newGrade,
        newLetter: getGradeLetter(retakeTargetGrade),
        cgpaLift: truncateGpa(impact),
        newCgpa: truncateGpa(calculateGlobalStats(semesters).cgpa + impact),
      });
    });
  });

  return retakeCandidates.sort((a, b) => b.cgpaLift - a.cgpaLift);
}

export function simulateRetake(semesters, courseId, newGradeValue) {
  const updated = (semesters || []).map((sem) => ({
    ...sem,
    courses: (sem.courses || []).map((course) => {
      if (course.id !== courseId) return course;
      return { ...course, grade: newGradeValue, status: 'passed', isRetake: true };
    }),
  }));
  return calculateGlobalStats(updated).cgpa;
}

export function getGraduationStats(semesters, profile) {
  const gradGoal = profile?.graduationCredits ?? 145;
  const coreRequired = profile?.coreCreditsRequired ?? 100;
  const electiveRequired = profile?.electiveCreditsRequired ?? 45;

  let totalCredits = 0;
  let coreCredits = 0;
  let electiveCredits = 0;
  let generalCredits = 0;
  let failedCount = 0;
  let retakeCount = 0;
  const failedCourses = [];

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      const credits = parseFloat(course.credits);
      totalCredits += credits;

      const cat = course.category || 'core';
      if (cat === 'elective') electiveCredits += credits;
      else if (cat === 'general') generalCredits += credits;
      else coreCredits += credits;

      if (isFailedGrade(course.grade) || course.status === 'failed') {
        failedCount += 1;
        failedCourses.push({
          name: course.name,
          grade: getGradeLetter(course.grade),
          semester: sem.description || `Semester ${sem.number}`,
        });
      }
      if (course.isRetake) retakeCount += 1;
    });
  });

  return {
    totalCredits,
    remainingCredits: Math.max(gradGoal - totalCredits, 0),
    gradGoal,
    progressPercent: Math.min(Math.round((totalCredits / gradGoal) * 100), 100),
    coreCredits,
    coreRequired,
    coreRemaining: Math.max(coreRequired - coreCredits, 0),
    electiveCredits,
    electiveRequired,
    electiveRemaining: Math.max(electiveRequired - electiveCredits, 0),
    generalCredits,
    failedCount,
    retakeCount,
    failedCourses,
  };
}

export function getPassFailStats(semesters) {
  let passedCourses = 0;
  let failedCourses = 0;
  let passedCredits = 0;
  let failedCredits = 0;

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      const c = parseFloat(course.credits);
      if (isPassingGrade(course.grade) && course.status !== 'failed') {
        passedCourses += 1;
        passedCredits += c;
      } else {
        failedCourses += 1;
        failedCredits += c;
      }
    });
  });

  const totalCourses = passedCourses + failedCourses;
  const totalCredits = passedCredits + failedCredits;

  return {
    chart: [
      { name: 'Passed', value: passedCourses, credits: passedCredits, color: '#10b981' },
      { name: 'Failed', value: failedCourses, credits: failedCredits, color: '#f43f5e' },
    ].filter((d) => d.value > 0),
    byCredits: [
      { name: 'Passed', value: passedCredits, courses: passedCourses, color: '#10b981' },
      { name: 'Failed', value: failedCredits, courses: failedCourses, color: '#f43f5e' },
    ].filter((d) => d.value > 0),
    passedCourses,
    failedCourses,
    passedCredits,
    failedCredits,
    totalCourses,
    totalCredits,
    passRateCourses: totalCourses > 0 ? truncateGpa((passedCourses / totalCourses) * 100, 1) : 0,
    passRateCredits: totalCredits > 0 ? truncateGpa((passedCredits / totalCredits) * 100, 1) : 0,
  };
}

export function getStrongestWeakestSemesters(semesterData) {
  const withGpa = semesterData.filter((s) => s.Credits > 0);
  if (withGpa.length === 0) return { strongest: null, weakest: null };

  const sorted = [...withGpa].sort((a, b) => b.GPA - a.GPA);
  return {
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
}

export function getCreditLoadVsGpaData(semesterData) {
  return semesterData.map((s) => ({
    name: s.name,
    Credits: s.Credits,
    GPA: s.GPA,
  }));
}
