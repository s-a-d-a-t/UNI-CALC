-- UNI-CALC PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
    email      TEXT PRIMARY KEY,
    password   TEXT NOT NULL,
    name       TEXT NOT NULL,
    major      TEXT,
    student_id TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
    email                    TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    name                     TEXT,
    student_id               TEXT,
    major                    TEXT,
    target_cgpa              NUMERIC(3,2) DEFAULT 3.50,
    graduation_credits       INTEGER      DEFAULT 145,
    core_credits_required    INTEGER      DEFAULT 100,
    elective_credits_required INTEGER     DEFAULT 45
);

CREATE TABLE IF NOT EXISTS semesters (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    semester_id     TEXT,
    description     TEXT,
    semester_number INTEGER
);

CREATE TABLE IF NOT EXISTS courses (
    id                SERIAL PRIMARY KEY,
    semester_id       INTEGER NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    course_client_id  TEXT,
    name              TEXT NOT NULL DEFAULT '',
    credits           INTEGER,
    grade             TEXT,
    category          TEXT DEFAULT 'core',
    status            TEXT DEFAULT 'passed',
    is_retake         BOOLEAN DEFAULT false
);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_client_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'core';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'passed';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_retake BOOLEAN DEFAULT false;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_credits_required INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS elective_credits_required INTEGER DEFAULT 45;

CREATE TABLE IF NOT EXISTS assignments (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    client_id   TEXT NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    course_name TEXT DEFAULT '',
    type        TEXT DEFAULT 'assignment',
    due_date    TIMESTAMPTZ,
    completed   BOOLEAN DEFAULT false,
    notes       TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS study_logs (
    id          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    client_id   TEXT NOT NULL,
    course_name TEXT NOT NULL DEFAULT '',
    hours       NUMERIC(4,1) DEFAULT 0,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    notes       TEXT DEFAULT ''
);
