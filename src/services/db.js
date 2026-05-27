// Browser client for the UNI-CALC Express API (PostgreSQL backend)

const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const db = {
  async getCurrentSession() {
    const { user } = await request('/auth/session');
    return user;
  },

  async loginUser(email, password) {
    const { user } = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return user;
  },

  async registerUser(userData) {
    const { user } = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return user;
  },

  async logoutUser() {
    await request('/auth/logout', { method: 'POST' });
  },

  async getProfile() {
    const { profile } = await request('/profile');
    return profile;
  },

  async updateProfile(profileData) {
    const { profile } = await request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return profile;
  },

  async getSemesters() {
    const { semesters } = await request('/semesters');
    return semesters;
  },

  async saveSemesters(semesters) {
    const { semesters: saved } = await request('/semesters', {
      method: 'PUT',
      body: JSON.stringify({ semesters }),
    });
    return saved;
  },

  async getAssignments() {
    const { assignments } = await request('/assignments');
    return assignments;
  },

  async saveAssignments(assignments) {
    const { assignments: saved } = await request('/assignments', {
      method: 'PUT',
      body: JSON.stringify({ assignments }),
    });
    return saved;
  },

  async getStudyLogs() {
    const { studyLogs } = await request('/study-logs');
    return studyLogs;
  },

  async saveStudyLogs(studyLogs) {
    const { studyLogs: saved } = await request('/study-logs', {
      method: 'PUT',
      body: JSON.stringify({ studyLogs }),
    });
    return saved;
  },
};
