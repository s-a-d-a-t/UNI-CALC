# UNI-CALC

UNI-CALC is a React + Vite frontend with an Express + PostgreSQL backend. The application stores user profiles, semester data, and course information in PostgreSQL and exposes a JSON API for the frontend.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or compatible)
- A terminal on Ubuntu or any Linux distro

## Clone the repository

```bash
cd ~/Documents
git clone <REPO_URL> UNI-CALC
cd UNI-CALC
```

Replace `<REPO_URL>` with your repository URL.

## Install dependencies

Install the frontend dependencies from the project root:

```bash
npm install
```

Install the backend dependencies inside `server/`:

```bash
cd server
npm install
cd ..
```

## PostgreSQL setup

1. Start PostgreSQL:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

2. Create the database user and database. The project uses `.env` values from the repository root, so either change the values in `.env` or create the same user/database:

```bash
sudo -u postgres psql -c "CREATE USER unicalc_user WITH PASSWORD 'Sadat@123';"
sudo -u postgres psql -c "CREATE DATABASE unicalc_db OWNER unicalc_user;"
```

3. Load the schema:

```bash
sudo -u postgres psql -d unicalc_db -f "$PWD/schema.sql"
```

If you need to run the SQL file from a protected home directory, use a temporary copy or make the home directory executable for traversal by the `postgres` user.

## Configure environment variables

Create or update the `.env` file in the project root with these values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unicalc_db
DB_USER=unicalc_user
DB_PASSWORD=Sadat@123
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=change-me-in-production
```

The backend will read this `.env` file from the project root.

## Start the backend

Run the backend server from the `server/` folder:

```bash
cd server
npm start
```

The API listens on:

- `http://localhost:3001`

Important API endpoints:

- `GET /api/health`
- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/semesters`
- `PUT /api/semesters`

> Note: `GET /` is not defined, so visiting `http://localhost:3001/` will return `Cannot GET /`.

## Start the frontend

From the project root:

```bash
npm run dev
```

Open the app in the browser at:

- `http://localhost:5173`

## Verify the setup

- Backend health check:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{"ok":true}
```

- Frontend should load at `http://localhost:5173`.

## Troubleshooting

### `vite: not found`

Run `npm install` from the project root.

### `EADDRINUSE: address already in use :::3001`

Stop the existing backend process or use a different port:

```bash
lsof -i :3001
kill <PID>
```

### `permission denied for table "users"`

This means the database tables are owned by the wrong Postgres user. Run:

```bash
sudo -u postgres psql -d unicalc_db -c "ALTER TABLE users OWNER TO unicalc_user; ALTER TABLE profiles OWNER TO unicalc_user; ALTER TABLE semesters OWNER TO unicalc_user; ALTER TABLE courses OWNER TO unicalc_user; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO unicalc_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO unicalc_user;"
```

### Database query access

To confirm the app user can connect:

```bash
PGPASSWORD='Sadat@123' psql -U unicalc_user -h localhost -d unicalc_db -c '\dt'
```

## Notes

- Use two terminals: one for `npm start` in `server/`, and one for `npm run dev` in the root.
- If you change `.env`, restart the backend.
