-- Run on existing databases to add new feature columns/tables
-- psql -d unicalc_db -f scripts/migrate-features.sql

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
