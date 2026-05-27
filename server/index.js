const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const db = require('./db');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'unicalc-dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

function requireSession(req, res, next) {
  if (!req.session.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

app.get('/api/health', async (_req, res) => {
  try {
    await db.pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    if (!req.session.email) {
      return res.json({ user: null });
    }
    const profile = await db.getProfile(req.session.email);
    res.json({ user: { email: req.session.email, ...profile } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.loginUser(email, password);
    req.session.email = user.email;
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await db.registerUser(req.body);
    req.session.email = user.email;
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/profile', requireSession, async (req, res) => {
  try {
    const profile = await db.getProfile(req.session.email);
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', requireSession, async (req, res) => {
  try {
    const profile = await db.updateProfile(req.session.email, req.body);
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/semesters', requireSession, async (req, res) => {
  try {
    const semesters = await db.getSemesters(req.session.email);
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/semesters', requireSession, async (req, res) => {
  try {
    const semesters = await db.saveSemesters(req.session.email, req.body.semesters);
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assignments', requireSession, async (req, res) => {
  try {
    const assignments = await db.getAssignments(req.session.email);
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/assignments', requireSession, async (req, res) => {
  try {
    const assignments = await db.saveAssignments(req.session.email, req.body.assignments);
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/study-logs', requireSession, async (req, res) => {
  try {
    const studyLogs = await db.getStudyLogs(req.session.email);
    res.json({ studyLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/study-logs', requireSession, async (req, res) => {
  try {
    const studyLogs = await db.saveStudyLogs(req.session.email, req.body.studyLogs);
    res.json({ studyLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  try {
    await db.ensureFeatureSchema();
    app.listen(PORT, () => {
      console.log(`UNI-CALC API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
    process.exit(1);
  }
}

startServer();
