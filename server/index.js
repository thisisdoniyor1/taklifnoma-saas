import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8100;
const JWT_SECRET = process.env.JWT_SECRET || 'taklifnoma_super_secret_2026_x';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Setup
let db;
async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'taklifnoma',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connected to MySQL Database');
    
    // Auto-migrate schema
    try {
      // 1. Users Table
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          reset_token VARCHAR(255),
          reset_token_expiry DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 2. Add columns to orders
      const [colViews] = await db.query("SHOW COLUMNS FROM orders LIKE 'views_count'");
      if (colViews.length === 0) await db.query('ALTER TABLE orders ADD COLUMN views_count INT DEFAULT 0');
      
      const [colRSVP] = await db.query("SHOW COLUMNS FROM orders LIKE 'rsvp_count'");
      if (colRSVP.length === 0) await db.query('ALTER TABLE orders ADD COLUMN rsvp_count INT DEFAULT 0');
      
      const [colUser] = await db.query("SHOW COLUMNS FROM orders LIKE 'user_id'");
      if (colUser.length === 0) await db.query('ALTER TABLE orders ADD COLUMN user_id INT');
      
      console.log('Schema synchronized successfully');
    } catch (migErr) {
      console.log('Schema sync warning (safe to ignore if columns exist):', migErr.message);
    }
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

connectDB();

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = user;
    next();
  });
};

// --- Auth Endpoints ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const isAdmin = (email === 'thisisdoniyor1@gmail.com' || email === 'doniyor@taklifnoma.vip');
    
    await db.query(
      'INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)',
      [email, hash, isAdmin]
    );
    res.status(201).json({ message: 'Account created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Signup failed: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Wrong password' });

    // Force Admin flag for specialized accounts (fail-safe)
    const isSpecialAdmin = (user.email === 'thisisdoniyor1@gmail.com' || user.email === 'doniyor@taklifnoma.vip');
    const isAdmin = user.is_admin || isSpecialAdmin;

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, isAdmin } });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

// --- Feature Endpoints ---

app.get('/api/my-invitations', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Stats failed' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { 
    template_id, groom_name, bride_name, wedding_date, wedding_time, 
    location_name, welcome_text, music_url, user_id, payment_status = 'pending' 
  } = req.body;

  const uuid = uuidv4();
  try {
    await db.query(
      'INSERT INTO orders (template_id, groom_name, bride_name, wedding_date, wedding_time, location_name, welcome_text, music_url, invite_uuid, payment_status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [template_id, groom_name, bride_name, wedding_date, wedding_time, location_name, welcome_text, music_url, uuid, payment_status, user_id]
    );
    res.status(201).json({ uuid });
  } catch (err) {
    res.status(500).json({ error: 'Creation failed' });
  }
});

app.get('/api/orders/:uuid', async (req, res) => {
  const { uuid } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE invite_uuid = ?', [uuid]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/orders/:uuid/view', async (req, res) => {
  try {
    await db.query('UPDATE orders SET views_count = views_count + 1 WHERE invite_uuid = ?', [req.params.uuid]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'View fail' }); }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
