const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const DEFAULT_SEMESTERS = [
  {
    id: 'sem-default-1',
    description: 'Year 1, Semester I',
    number: 1,
    courses: [
      { id: 'course-1', name: 'Introduction to Calculus', credits: 4, grade: '4.00' },
      { id: 'course-2', name: 'General Physics', credits: 3, grade: '3.50' },
      { id: 'course-3', name: 'Communicative English Skills', credits: 3, grade: '3.00' },
    ],
  },
];

function mapProfile(row) {
  if (!row) return null;
  return {
    name: row.name || '',
    studentId: row.student_id || '',
    major: row.major || '',
    targetCgpa: row.target_cgpa != null ? Number(row.target_cgpa) : 3.5,
    graduationCredits: row.graduation_credits != null ? Number(row.graduation_credits) : 145,
  };
}

function groupSemesterRows(rows) {
  const byClientId = new Map();
  for (const row of rows) {
    if (!byClientId.has(row.semester_id)) {
      byClientId.set(row.semester_id, {
        id: row.semester_id,
        description: row.description || '',
        number: row.semester_number ?? 0,
        courses: [],
      });
    }
    if (row.course_client_id) {
      byClientId.get(row.semester_id).courses.push({
        id: row.course_client_id,
        name: row.course_name || '',
        credits: row.credits ?? 0,
        grade: row.grade || '4.00',
      });
    }
  }
  return [...byClientId.values()].sort((a, b) => a.number - b.number);
}

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function getProfileRow(email) {
  const { rows } = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
  return rows[0] || null;
}

async function loginUser(email, password) {
  const formattedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(formattedEmail);
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }
  const profile = mapProfile(await getProfileRow(formattedEmail));
  return { email: formattedEmail, ...profile };
}

async function registerUser({ name, email, password, major, studentId }) {
  const formattedEmail = email.toLowerCase().trim();
  if (await findUserByEmail(formattedEmail)) {
    throw new Error('Email is already registered');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO users (email, password, name, major, student_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [formattedEmail, password, name, major || null, studentId || null]
    );
    await client.query(
      `INSERT INTO profiles (email, name, student_id, major, target_cgpa, graduation_credits)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [formattedEmail, name, studentId || '', major || '', 3.5, 145]
    );

    for (const sem of DEFAULT_SEMESTERS) {
      const { rows } = await client.query(
        `INSERT INTO semesters (email, semester_id, description, semester_number)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [formattedEmail, sem.id, sem.description, sem.number]
      );
      const semesterDbId = rows[0].id;
      for (const course of sem.courses) {
        await client.query(
          `INSERT INTO courses (semester_id, course_client_id, name, credits, grade)
           VALUES ($1, $2, $3, $4, $5)`,
          [semesterDbId, course.id, course.name, course.credits, course.grade]
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return { email: formattedEmail, ...(await getProfile(formattedEmail)) };
}

async function getProfile(email) {
  const row = await getProfileRow(email);
  if (!row) throw new Error('Profile not found');
  return mapProfile(row);
}

async function updateProfile(email, profileData) {
  const updated = {
    name: profileData.name || '',
    studentId: profileData.studentId || '',
    major: profileData.major || '',
    targetCgpa: parseFloat(profileData.targetCgpa) || 2.0,
    graduationCredits: parseInt(profileData.graduationCredits, 10) || 120,
  };

  await pool.query(
    `UPDATE profiles SET
       name = $2,
       student_id = $3,
       major = $4,
       target_cgpa = $5,
       graduation_credits = $6
     WHERE email = $1`,
    [email, updated.name, updated.studentId, updated.major, updated.targetCgpa, updated.graduationCredits]
  );

  await pool.query(
    `UPDATE users SET name = $2, major = $3, student_id = $4 WHERE email = $1`,
    [email, updated.name, updated.major, updated.studentId]
  );

  return updated;
}

async function getSemesters(email) {
  const { rows } = await pool.query(
    `SELECT s.semester_id, s.description, s.semester_number,
            c.course_client_id, c.name AS course_name, c.credits, c.grade
     FROM semesters s
     LEFT JOIN courses c ON c.semester_id = s.id
     WHERE s.email = $1
     ORDER BY s.semester_number, c.id`,
    [email]
  );

  if (rows.length === 0) {
    await saveSemesters(email, JSON.parse(JSON.stringify(DEFAULT_SEMESTERS)));
    return getSemesters(email);
  }

  return groupSemesterRows(rows);
}

async function saveSemesters(email, semesters) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM semesters WHERE email = $1', [email]);

    for (const sem of semesters) {
      const { rows } = await client.query(
        `INSERT INTO semesters (email, semester_id, description, semester_number)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [email, sem.id, sem.description || '', sem.number ?? 0]
      );
      const semesterDbId = rows[0].id;
      for (const course of sem.courses || []) {
        await client.query(
          `INSERT INTO courses (semester_id, course_client_id, name, credits, grade)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            semesterDbId,
            course.id,
            course.name || '',
            course.credits ?? 0,
            course.grade || '4.00',
          ]
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return semesters;
}

module.exports = {
  pool,
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  getSemesters,
  saveSemesters,
};
