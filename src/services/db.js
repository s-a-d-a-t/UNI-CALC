// src/services/db.js
require('dotenv').config(); // Load .env variables
const { Pool } = require('pg');

// Create a connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // optional pool tuning
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Generic query helper – forwards the query to the pool.
 * @param {string} text   SQL statement, may contain $1, $2… placeholders
 * @param {Array<any>} [params]   Values for the placeholders
 * @returns {Promise<import('pg').QueryResult>} Query result
 */
async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

/**
 * Example CRUD helpers for the UNI‑CALC schema.
 * Adjust table/column names to match the schema you create in PostgreSQL.
 */
const db = {
  // ---------- Users ----------
  async createUser({ email, password, name, major, studentId }) {
    const sql = `INSERT INTO users (email, password, name, major, student_id)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows } = await query(sql, [email, password, name, major, studentId]);
    return rows[0];
  },

  async findUserByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  // ---------- Profiles ----------
  async getProfile(email) {
    const { rows } = await query('SELECT * FROM profiles WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async upsertProfile(email, profileData) {
    // Upsert (INSERT … ON CONFLICT) – assumes a unique constraint on email
    const sql = `INSERT INTO profiles (email, name, student_id, major, target_cgpa, graduation_credits)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email) DO UPDATE SET
                   name = EXCLUDED.name,
                   student_id = EXCLUDED.student_id,
                   major = EXCLUDED.major,
                   target_cgpa = EXCLUDED.target_cgpa,
                   graduation_credits = EXCLUDED.graduation_credits
                 RETURNING *`;
    const { rows } = await query(sql, [
      email,
      profileData.name,
      profileData.studentId,
      profileData.major,
      profileData.targetCgpa,
      profileData.graduationCredits,
    ]);
    return rows[0];
  },

  // ---------- Semesters & Courses ----------
  async getSemesters(email) {
    const { rows } = await query('SELECT * FROM semesters WHERE email = $1 ORDER BY semester_number', [email]);
    return rows;
  },

  async saveSemesters(email, semesters) {
    // Simple strategy: delete existing semesters for the user then bulk insert the new set.
    await query('DELETE FROM semesters WHERE email = $1', [email]);
    const insertSql = `INSERT INTO semesters (email, semester_id, description, semester_number, courses)
                       VALUES ($1, $2, $3, $4, $5)`;
    // `courses` column is stored as JSONB containing an array of course objects.
    for (const sem of semesters) {
      await query(insertSql, [
        email,
        sem.id,
        sem.description,
        sem.number,
        JSON.stringify(sem.courses), // store as JSONB
      ]);
    }
    return true;
  },

  // ---------- Generic Query ----------
  query,
};

module.exports = db;
