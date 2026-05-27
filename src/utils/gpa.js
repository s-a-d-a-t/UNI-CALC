export const GRADE_SCALE = [
  { label: 'A / A+ (4.0)', value: '4.00', letter: 'A' },
  { label: 'A- (3.75)', value: '3.75', letter: 'A-' },
  { label: 'B+ (3.50)', value: '3.50', letter: 'B+' },
  { label: 'B (3.00)', value: '3.00', letter: 'B' },
  { label: 'B- (2.75)', value: '2.75', letter: 'B-' },
  { label: 'C+ (2.50)', value: '2.50', letter: 'C+' },
  { label: 'C (2.00)', value: '2.00', letter: 'C' },
  { label: 'C- (1.75)', value: '1.75', letter: 'C-' },
  { label: 'D (1.00)', value: '1.00', letter: 'D' },
  { label: 'F (0.00)', value: '0.00', letter: 'F' },
];

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
  const g = parseFloat(value).toFixed(2);
  const match = GRADE_SCALE.find((s) => s.value === g);
  return match ? match.letter : 'F';
}

export function isPassingGrade(grade) {
  return parseFloat(grade) >= 2.0;
}

export function isFailedGrade(grade) {
  return parseFloat(grade) < 2.0;
}

export function validCourse(course) {
  const credits = parseFloat(course.credits);
  const gradeVal = parseFloat(course.grade);
  return !isNaN(credits) && credits > 0 && !isNaN(gradeVal);
}

export function calculateSemesterStats(courses) {
  let credits = 0;
  let points = 0;

  courses.forEach((course) => {
    if (!validCourse(course)) return;
    const c = parseFloat(course.credits);
    const g = parseFloat(course.grade);
    credits += c;
    points += c * g;
  });

  return {
    credits,
    points,
    gpa: credits > 0 ? points / credits : 0,
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
    cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
  };
}

export function getSemesterChartData(semesters) {
  return (semesters || []).map((sem) => {
    const stats = calculateSemesterStats(sem.courses || []);
    return {
      name: sem.description || `Sem ${sem.number}`,
      GPA: parseFloat(stats.gpa.toFixed(2)),
      Credits: stats.credits,
      points: stats.points,
    };
  });
}

export function predictCgpa(completedSemesters, hypotheticalCourses) {
  const base = calculateGlobalStats(completedSemesters);
  let extraCredits = 0;
  let extraPoints = 0;

  hypotheticalCourses.forEach((course) => {
    if (!validCourse(course)) return;
    const c = parseFloat(course.credits);
    const g = parseFloat(course.grade);
    extraCredits += c;
    extraPoints += c * g;
  });

  const totalCredits = base.totalCredits + extraCredits;
  const totalPoints = base.totalPoints + extraPoints;

  return {
    currentCgpa: base.cgpa,
    predictedCgpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
    totalCredits,
    totalPoints,
    addedCredits: extraCredits,
  };
}

export function predictBestWorstCase(completedSemesters, inProgressCourses) {
  const best = inProgressCourses.map((c) => ({ ...c, grade: '4.00' }));
  const worst = inProgressCourses.map((c) => ({ ...c, grade: '0.00' }));
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
    const prevDiff = Math.abs(parseFloat(prev.value) - requiredGpa);
    const currDiff = Math.abs(parseFloat(curr.value) - requiredGpa);
    return currDiff < prevDiff ? curr : prev;
  });

  return {
    possible: requiredGpa <= 4.0,
    requiredGpa,
    letter: closest.label,
    gradeValue: closest.value,
  };
}

export function analyzeRetakes(semesters, retakeTargetGrade = '3.50') {
  const retakeCandidates = [];

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      if (!isFailedGrade(course.grade) && course.status !== 'failed') return;

      const credits = parseFloat(course.credits);
      const oldGrade = parseFloat(course.grade);
      const newGrade = parseFloat(retakeTargetGrade);
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
        cgpaLift: impact,
        newCgpa: calculateGlobalStats(semesters).cgpa + impact,
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
  let passed = 0;
  let failed = 0;

  (semesters || []).forEach((sem) => {
    (sem.courses || []).forEach((course) => {
      if (!validCourse(course)) return;
      if (isPassingGrade(course.grade) && course.status !== 'failed') passed += 1;
      else failed += 1;
    });
  });

  return [
    { name: 'Passed', value: passed },
    { name: 'Failed', value: failed },
  ].filter((d) => d.value > 0);
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
