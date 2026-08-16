// server.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Serve uploaded files statically so React can display them
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, './uploads/'); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test DB Connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL successfully!'))
  .catch(err => console.error('❌ Connection error', err.stack));

// --- REST API ROUTES ---

// 1. Get All Jobs (Search & Filter)
app.get('/api/jobs', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Jobs ORDER BY created_at DESC';
    let values = [];
    
    if (search) {
      query = 'SELECT * FROM Jobs WHERE title ILIKE $1 OR company ILIKE $1 ORDER BY created_at DESC';
      values = [`%${search}%`];
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a Job
app.post('/api/jobs', async (req, res) => {
  const { recruiter_id, title, company, location, description, salary_range } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Jobs (recruiter_id, title, company, location, description, salary_range) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [recruiter_id, title, company, location, description, salary_range]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Apply for a Job
app.post('/api/applications', upload.single('resume'), async (req, res) => {
  const { job_id, seeker_id } = req.body;
  const resume_url = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO Applications (job_id, seeker_id, resume_url) VALUES ($1, $2, $3) RETURNING *',
      [job_id, seeker_id, resume_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Application already exists or invalid data' });
  }
});

const PORT = process.env.PORT || 5000;
// 4. Register a New User
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    // 1. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 2. Save user to database
    const result = await pool.query(
      'INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password_hash, role] // role should be 'seeker' or 'recruiter'
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Email already exists or invalid data.' });
  }
});

// 5. Login User
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );

    // 4. Send token and user data back to React
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a job (Recruiter/Admin)
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Jobs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Seeker's Applications (Track Status)
app.get('/api/seeker/applications/:seekerId', async (req, res) => {
  try {
    const query = `
      SELECT a.id, a.status, a.applied_at, j.title, j.company, j.location
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      WHERE a.seeker_id = $1
      ORDER BY a.applied_at DESC
    `;
    const result = await pool.query(query, [req.params.seekerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Applications for a Recruiter's Jobs
app.get('/api/recruiter/applications/:recruiterId', async (req, res) => {
  try {
    const query = `
      SELECT a.id AS application_id, a.status, a.resume_url, a.applied_at,
             j.title AS job_title, 
             u.name AS applicant_name, u.email AS applicant_email
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      JOIN Users u ON a.seeker_id = u.id
      WHERE j.recruiter_id = $1
      ORDER BY a.applied_at DESC
    `;
    const result = await pool.query(query, [req.params.recruiterId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update Application Status
app.put('/api/applications/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Admin Route: Get all system stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, name, email, role FROM Users ORDER BY created_at DESC');
    const jobs = await pool.query('SELECT * FROM Jobs');
    res.json({ users: users.rows, jobs: jobs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Delete User
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));