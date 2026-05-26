-- Run once as a PostgreSQL superuser (e.g. postgres), then use unicalc_user from the app.
-- Example:
--   sudo -u postgres psql -d unicalc_db -f scripts/setup-db.sql

GRANT ALL ON SCHEMA public TO unicalc_user;
GRANT CREATE ON SCHEMA public TO unicalc_user;

\ir ../schema.sql

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO unicalc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO unicalc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO unicalc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO unicalc_user;
