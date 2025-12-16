import config from './config';
import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import session from 'express-session';
import bcrypt from 'bcrypt';
import pool from './db';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Auth middleware
function requireAuth(req: any, res: express.Response, next: express.NextFunction) {
  if (req.session?.userId) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);
    res.status(201).json({ message: 'User registered' });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    res.json({ message: 'Logged in' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Protected route example
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'This is protected', userId: (req as any).session.userId });
});

// Initialize DB tables
async function initDB() {
  try {
    await pool.query(`
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('DB init error:', err);
  }
}

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

const options = {
  key: fs.readFileSync('../certs/key.pem'),
  cert: fs.readFileSync('../certs/cert.pem'),
};

https.createServer(options, app).listen(config.port, async () => {
  console.log(`Backend on https://${config.host}:${config.port}`);
  initDB();
});
