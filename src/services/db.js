// Multi-user LocalStorage database client mock for UNI-CALC
// Scopes all profiles and course data by user email and handles active session state.

const STORAGE_KEYS = {
  USERS: 'unicalc_users_list',
  SESSION: 'unicalc_active_session',
  PROFILE_PREFIX: 'unicalc_profile_',
  SEMESTERS_PREFIX: 'unicalc_semesters_'
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

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get users list from localStorage
function getUsersList() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    const defaultUsers = [{
      name: 'SADAT AMIR',
      email: 'sdrkk66@gmail.com',
      password: 'sadat123',
      major: 'Software Engineering',
      studentId: 'UGR/1234/18'
    }];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Helper: Save users list to localStorage
function saveUsersList(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export const db = {
  /**
   * Check if there's an active session
   * @returns {Promise<Object|null>} Logged in user profile or null
   */
  async getCurrentSession() {
    await delay(50);
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!email) return null;

    // Fetch profile for this email
    const profile = await this.getProfile();
    return { email, ...profile };
  },

  /**
   * Log in a user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} The authenticated user's details
   */
  async loginUser(email, password) {
    await delay(200);
    const users = getUsersList();
    const formattedEmail = email.toLowerCase().trim();

    const user = users.find(u => u.email === formattedEmail);
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, formattedEmail);
    const profile = await this.getProfile();
    return { email: formattedEmail, ...profile };
  },

  /**
   * Register a new user
   * @param {Object} userData 
   * @returns {Promise<Object>} The registered user's details
   */
  async registerUser({ name, email, password, major, studentId }) {
    await delay(300);
    const users = getUsersList();
    const formattedEmail = email.toLowerCase().trim();

    if (users.some(u => u.email === formattedEmail)) {
      throw new Error('Email is already registered');
    }

    // Add user to credentials store
    const newUser = { email: formattedEmail, password, name, major, studentId };
    users.push(newUser);
    saveUsersList(users);

    // Set active session
    localStorage.setItem(STORAGE_KEYS.SESSION, formattedEmail);

    // Initialize profile scoped to email
    const initialProfile = {
      name,
      studentId: studentId || '',
      major,
      targetCgpa: 3.50,
      graduationCredits: 145
    };
    localStorage.setItem(`${STORAGE_KEYS.PROFILE_PREFIX}${formattedEmail}`, JSON.stringify(initialProfile));

    // Initialize semesters scoped to email
    localStorage.setItem(`${STORAGE_KEYS.SEMESTERS_PREFIX}${formattedEmail}`, JSON.stringify(DEFAULT_SEMESTERS));

    return { email: formattedEmail, ...initialProfile };
  },

  /**
   * Log out active session
   */
  async logoutUser() {
    await delay(50);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  /**
   * Fetch the current active user's profile
   * @returns {Promise<Object>} The student profile
   */
  async getProfile() {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!email) throw new Error('No active user session');

    const key = `${STORAGE_KEYS.PROFILE_PREFIX}${email}`;
    const data = localStorage.getItem(key);

    if (!data) {
      // Create fallback if profile is missing
      const fallback = email === 'student@unicalc.edu' ? {
        name: 'Abebe Kebede',
        studentId: 'UGR/1234/18',
        major: 'Software Engineering',
        targetCgpa: 3.50,
        graduationCredits: 145
      } : {
        name: 'Student',
        studentId: '',
        major: 'General Studies',
        targetCgpa: 3.00,
        graduationCredits: 120
      };
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing profile data', e);
      return {};
    }
  },

  /**
   * Update the active student's profile
   * @param {Object} profileData New student profile values
   * @returns {Promise<Object>} The updated student profile
   */
  async updateProfile(profileData) {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!email) throw new Error('No active user session');

    const key = `${STORAGE_KEYS.PROFILE_PREFIX}${email}`;
    const updated = {
      name: profileData.name || '',
      studentId: profileData.studentId || '',
      major: profileData.major || '',
      targetCgpa: parseFloat(profileData.targetCgpa) || 2.0,
      graduationCredits: parseInt(profileData.graduationCredits) || 120
    };

    localStorage.setItem(key, JSON.stringify(updated));

    // Keep credentials store synchronized for general details
    const users = getUsersList();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].name = updated.name;
      users[userIndex].major = updated.major;
      users[userIndex].studentId = updated.studentId;
      saveUsersList(users);
    }

    return updated;
  },

  /**
   * Get all semesters and courses for active user
   * @returns {Promise<Array>} List of semesters
   */
  async getSemesters() {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!email) throw new Error('No active user session');

    const key = `${STORAGE_KEYS.SEMESTERS_PREFIX}${email}`;
    const data = localStorage.getItem(key);

    if (!data) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_SEMESTERS));
      return JSON.parse(JSON.stringify(DEFAULT_SEMESTERS));
    }

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing semesters data', e);
      return JSON.parse(JSON.stringify(DEFAULT_SEMESTERS));
    }
  },

  /**
   * Save all semesters and courses for active user
   * @param {Array} semesters List of semesters to save
   * @returns {Promise<Array>} The saved list of semesters
   */
  async saveSemesters(semesters) {
    const email = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!email) throw new Error('No active user session');

    const key = `${STORAGE_KEYS.SEMESTERS_PREFIX}${email}`;
    localStorage.setItem(key, JSON.stringify(semesters));
    return semesters;
  }
};
