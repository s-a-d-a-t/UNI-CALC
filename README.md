# 🎓 UniCalc Ethio — Academic GPA Tracker & Analytics

<div align="center">
  
  [![Vite](https://img.shields.io/badge/Vite-8A2BE2?style=for-the-badge&logo=vite&logoColor=FFD700)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    <strong>A premium, full-stack academic planning ecosystem designed for university students to track credit loads, analyze grade distributions, and forecast graduation goals.</strong>
  </p>

  <h4>
    👉 <a href="#-live-demo"><b>Access the Live Demo Link Here</b></a> 👈
  </h4>

</div>

---

## 📖 Table of Contents
- [✨ Core Features](#-core-features)
- [💻 Tech Stack](#-tech-stack)
- [⚙️ Architecture Overview](#%EF%B8%8F-architecture-overview)
- [🗄️ Database Schema](#%EF%B8%8F-database-schema)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone & Install Dependencies](#2-clone--install-dependencies)
  - [3. Database Connectivity Setup](#3-database-connectivity-setup)
  - [4. Environment Variables Configuration](#4-environment-variables-configuration)
  - [5. Run the Application](#5-run-the-application)
- [🌐 Deployment & Production Details](#-deployment--production-details)
- [🛠️ Troubleshooting](#%EF%B8%8F-troubleshooting)

---

## ✨ Core Features

UniCalc Ethio is packed with advanced analytics and student-focused productivity features:

*   **📊 Interactive Student Dashboard**: Get a bird's-eye view of your academic performance:
    *   **Cumulative CGPA**: Automatically calculated using standard scales.
    *   **Degree Progress Tracker**: Visual progress bar tracking completed vs. target graduation credits.
    *   **Academic Standing Indicator**: Dynamic badges tracking university standing categories (e.g. *First Class Distinction*, *Distinction*, *Satisfactory*, *Academic Warning*, or *Dismissal Risk*).
*   **🧮 Dynamic Semester & GPA Calculator**:
    *   Add/remove courses with adjustable credit hours.
    *   Map standard letter grades (A, B, C, etc.) to numerical values instantaneously.
    *   Tag retake courses and mark courses as Passed, Failed, or In-Progress.
*   **🎯 Graduation Goal Planner**:
    *   Input your dream CGPA (e.g., 3.80).
    *   The app calculates your remaining credits and shows the **exact average GPA** you need to maintain in future semesters to cross the finish line.
*   **📈 Rich Visual Charts**:
    *   *Semester-wise GPA Trend* (Line Chart)
    *   *Grade Distribution percentage* (Donut/Pie Chart)
    *   *Pass vs. Fail metrics* (Pie Chart)
    *   *Credit Load vs. GPA comparison* (Composed Chart)
*   **📅 Productivity Planner Suite**:
    *   **Assignment Tracker**: Track exams, projects, labs, and homework due dates, status, and course links.
    *   **Study Time Logger**: Record hours spent on courses, view dynamic stats, and monitor weekly study habits.
*   **🌓 Dark Mode Integration**: Full responsive design supporting light and dark themes based on your preference.

---

## 💻 Tech Stack

### Frontend
- **React 19**: Modern component architecture using hooks and custom state controllers.
- **Vite 8**: Ultra-fast build tool and local dev proxy.
- **Tailwind CSS v3**: Fluid responsive layouts and custom styling tokens.
- **Recharts**: Responsive SVG graphs for gpa progress and distributions.
- **Lucide React**: Clean and polished vector iconography.

### Backend
- **Node.js & Express**: Restful API backend processing sessions, profiles, and courses.
- **Express Session**: Cookie-based server-side user authentication.
- **node-pg**: Connection pooling client interfacing with the SQL database.

### Database
- **PostgreSQL**: Robust relational storage containing indexed tables. Fully compatible with cloud solutions like **Neon PostgreSQL** and **Render DB**.

---

## ⚙️ Architecture Overview

The system architecture facilitates smooth data flow between client queries, api endpoints, and the persistent relational storage:

```mermaid
graph TD
    Client[Web Browser Client] <-->|HTTP / JSON / Cookie Sessions| Proxy[Vite Development Server Proxy /api]
    Proxy <-->|Port 3001| Server[Express.js Node Backend]
    Server <-->|node-pg Connection Pool| Database[(PostgreSQL Database / Neon Cloud)]
```

- In **Development Mode**, Vite runs on port `5173` and proxies any request matching `/api/*` to the Express backend on port `3001` (to prevent CORS issues).
- In **Production Mode**, the Express server serves the optimized React static build from the `dist/` folder, operating on a unified origin.

---

## 🗄️ Database Schema

The database consists of 5 highly correlated tables ensuring data integrity via foreign keys:

```mermaid
erDiagram
    users ||--|| profiles : "has"
    users ||--o{ semesters : "manages"
    users ||--o{ assignments : "records"
    users ||--o{ study_logs : "logs"
    semesters ||--o{ courses : "contains"

    users {
        string email PK
        string password
        string name
        string major
        string student_id
    }
    profiles {
        string email PK, FK
        string name
        string student_id
        string major
        numeric target_cgpa
        int graduation_credits
        int core_credits_required
        int elective_credits_required
    }
    semesters {
        int id PK
        string email FK
        string semester_id
        string description
        int semester_number
    }
    courses {
        int id PK
        int semester_id FK
        string course_client_id
        string name
        int credits
        string grade
        string category
        string status
        boolean is_retake
    }
    assignments {
        int id PK
        string email FK
        string client_id
        string title
        string course_name
        string type
        timestamptz due_date
        boolean completed
        string notes
    }
    study_logs {
        int id PK
        string email FK
        string client_id
        string course_name
        numeric hours
        date log_date
        string notes
    }
```

---

## 🚀 Quick Start & Installation

Follow these steps to configure your environment and run the project locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14.0 or higher) OR a **Neon.tech** account for cloud PostgreSQL

---

### 2. Clone & Install Dependencies

Open your terminal and execute:

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL> UNI-CALC
cd UNI-CALC

# Install root dependencies (Frontend: Vite, React, Recharts, Tailwind)
npm install

# Install backend dependencies (Backend: Express, PG, Cors, Dotenv)
cd server
npm install
cd ..
```

---

### 3. Database Connectivity Setup

You can connect the application to either a **Local PostgreSQL database** or a **Cloud-hosted Neon Database**.

#### Option A: Cloud Setup (Neon / Recommended)
1. Sign up on [Neon.tech](https://neon.tech) and create a new project.
2. Retrieve your **Connection String** from the dashboard. It will look like this:
   `postgresql://owner:password@ep-host.us-east-1.neon.tech/neondb?sslmode=require`
3. Copy this string. You will paste it in the `.env` file as `DATABASE_URL` (see Step 4).

#### Option B: Local Setup (Ubuntu / Linux)
1. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   sudo systemctl enable --now postgresql
   ```
2. Create the database user and target database:
   ```bash
   sudo -u postgres psql -c "CREATE USER unicalc_user WITH PASSWORD 'Sadat@123';"
   sudo -u postgres psql -c "CREATE DATABASE unicalc_db OWNER unicalc_user;"
   ```
3. Load the default schema to initialize tables:
   ```bash
   sudo -u postgres psql -d unicalc_db -f "$PWD/schema.sql"
   ```

---

### 4. Environment Variables Configuration

Create a file named `.env` in the **root directory** of the project and populate it with your environment values:

```env
# Database Credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unicalc_db
DB_USER=unicalc_user
DB_PASSWORD=Sadat@123

# Cloud Database URL (Used by Neon / production deployments)
DATABASE_URL=postgresql://unicalc_user:Sadat@123@localhost:5432/unicalc_db

# Express Server Port
PORT=3001

# Development Client Origin
CLIENT_ORIGIN=http://localhost:5173

# Express Session Security Key
SESSION_SECRET=your_custom_secret_key_here
```

---

### 5. Run the Application

To run the application, you need to start both the Express API and the Vite frontend. Use two separate terminals or open concurrent tasks:

#### Terminal 1: Start Backend API
```bash
# From the project root, run the Express server
npm run dev:api
```
*The server will start on `http://localhost:3001` and verify connection to database.*

#### Terminal 2: Start Frontend
```bash
# From the project root, run Vite development server
npm run dev
```
*Vite will start the client interface on `http://localhost:5173`.*

Open your browser and navigate to `http://localhost:5173` to explore the app!

---

## 🌐 Live Demo

You can interact with the deployed version of the application here:
👉 **[UniCalc Ethio Live Demo](https://uni-calc.onrender.com/)**

*(Please replace `YOUR_DEPLOYED_LINK_HERE` with the URL provided once deployed!)*

---

## 🌐 Deployment & Production Details

This project is built to deploy easily on free tiers such as **Render**, **Railway**, or **Fly.io**.

*   **Production Build**: Compile static files using:
    ```bash
    npm run build
    ```
*   **Express Trust Proxy**: The backend is configured to read from `trust proxy` when `NODE_ENV=production`. This enables secure cookie transport over SSL through load balancers:
    ```javascript
    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1);
    }
    ```
*   **Static Serving**: Ensure your hosting provider builds the frontend assets and points the Express start script to run the API, which serves the frontend in a monorepo setup.

---

## 🛠️ Troubleshooting

### ❌ `vite: command not found`
**Cause**: Node modules are not installed in the root folder.  
**Fix**: Execute `npm install` inside the project root folder.

### ❌ `EADDRINUSE: address already in use :::3001`
**Cause**: The port `3001` is already locked by another zombie node process.  
**Fix**: Kill the process utilizing the port:
```bash
lsof -i :3001
kill -9 <PID>
```

### ❌ `permission denied for table "users"`
**Cause**: The database tables were created under the `postgres` administrator instead of your app user.  
**Fix**: Grant administrative privileges over tables to the app user:
```bash
sudo -u postgres psql -d unicalc_db -c "ALTER TABLE users OWNER TO unicalc_user; ALTER TABLE profiles OWNER TO unicalc_user; ALTER TABLE semesters OWNER TO unicalc_user; ALTER TABLE courses OWNER TO unicalc_user; ALTER TABLE assignments OWNER TO unicalc_user; ALTER TABLE study_logs OWNER TO unicalc_user; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO unicalc_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO unicalc_user;"
```

---

## 👤 Author & Developer

Created and maintained by **Sadat**:
- **GitHub**: [s-a-d-a-t](https://github.com/s-a-d-a-t)
- **Telegram**: [@sdrk_66](https://t.me/sdrk_66)
- **Email**: [sdrkk66@gmail.com](mailto:sdrkk66@gmail.com)

---

*Made with ❤️ for academic excellence.*
