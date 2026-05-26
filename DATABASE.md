# PostgreSQL setup for UNI-CALC

## 1. Environment

Copy `.env.example` to `.env` and set your database credentials.

## 2. Create database and user (one-time, as postgres superuser)

```bash
sudo -u postgres psql <<'SQL'
CREATE USER unicalc_user WITH PASSWORD 'your_password';
CREATE DATABASE unicalc_db OWNER unicalc_user;
SQL
```

## 3. Apply schema

From the project root, as **postgres** (required on PostgreSQL 15+ so tables can be created in `public`):

```bash
sudo -u postgres psql -d unicalc_db -f scripts/setup-db.sql
```

Or, if `unicalc_user` already owns the database:

```bash
set -a && source .env && set +a
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f schema.sql
```

## 4. Run the app

Terminal 1 — API (reads `.env` from project root):

```bash
npm run dev:api
```

Terminal 2 — React frontend:

```bash
npm run dev
```

Open http://localhost:5173 — API requests go to `/api` and are proxied to port 3001.
