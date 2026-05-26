-- UNI-CALC PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
    email      TEXT PRIMARY KEY,
    password   TEXT NOT NULL,
    name       TEXT NOT NULL,
    major      TEXT,
    student_id TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
    email               TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
    name                TEXT,
    student_id          TEXT,
    major               TEXT,
    target_cgpa         NUMERIC(3,2) DEFAULT 3.50,
    graduation_credits  INTEGER      DEFAULT 145
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
    grade             TEXT
);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_client_id TEXT;
