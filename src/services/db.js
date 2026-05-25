// LocalStorage database client mock for UNI-CALC
// This mirrors the API interface of a Node.js/Express backend querying a PostgreSQL database.

const STORAGE_KEYS = {
  PROFILE: 'unicalc_student_profile',
  SEMESTERS: 'unicalc_semesters_data'
};

const DEFAULT_PROFILE = {
  name: 'Abebe Kebede',
  studentId: 'UGR/1234/18',
  major: 'Software Engineering',
  targetCgpa: 3.50,
  graduationCredits: 145
};

const DEFAULT_SEMESTERS = [
  {
    id: 'sem-default-1',
    description: 'Year 1, Semester I',
    number: 1,
    courses: [
      { id: 'course-1', name: 'Introduction to Calculus', credits: 4, grade: '4.00' },
      { id: 'course-2', name: 'General Physics', credits: 3, grade: '3.50' },
      { id: 'course-3', name: 'Communicative English Skills', credits: 3, grade: '3.00' }
    ]
  }
];

// Helper to simulate network latency
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  /**
   * Fetch the student profile
   * @returns {Promise<Object>} The student profile
   */
  async getProfile() {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return { ...DEFAULT_PROFILE };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing profile data', e);
      return { ...DEFAULT_PROFILE };
    }
  },

  /**
   * Update the student profile
   * @param {Object} profileData New student profile values
   * @returns {Promise<Object>} The updated student profile
   */
  async updateProfile(profileData) {
    await delay();
    const updated = {
      name: profileData.name || '',
      studentId: profileData.studentId || '',
      major: profileData.major || '',
      targetCgpa: parseFloat(profileData.targetCgpa) || 2.0,
      graduationCredits: parseInt(profileData.graduationCredits) || 120
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get all semesters and their courses
   * @returns {Promise<Array>} List of semesters
   */
  async getSemesters() {
    await delay();
    const data = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(DEFAULT_SEMESTERS));
      return JSON.parse(JSON.stringify(DEFAULT_SEMESTERS)); // deep copy
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing semesters data', e);
      return JSON.parse(JSON.stringify(DEFAULT_SEMESTERS));
    }
  },

  /**
   * Save all semesters and courses (atomic sync)
   * @param {Array} semesters List of semesters to save
   * @returns {Promise<Array>} The saved list of semesters
   */
  async saveSemesters(semesters) {
    await delay();
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
    return semesters;
  }
};
