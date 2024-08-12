const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import CORS package
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,    // Environment variable for database host
  user: process.env.DB_USER,    // Environment variable for database user
  password: process.env.DB_PASS, // Environment variable for database password
  database: process.env.DB_NAME // Environment variable for database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// User schema for registration and login
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// 1. User Registration (Sign Up)
app.post('/register', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, password } = req.body;

  // Check if user already exists
  const userCheckQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(userCheckQuery, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to check user.' });
    if (results.length > 0) return res.status(400).json({ error: 'Email already exists.' });

    // Hash the password
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Failed to create user.' });
        }
        res.status(201).json({ userId: result.insertId, message: 'User registered successfully.' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  });
});

// 2. User Login (Sign In)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check user credentials
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to log in.' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password.' });

    const user = results[0];

    // Compare passwords
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Login successful.', token });
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ error: 'Failed to log in.' });
    }
  });
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid token.', details: err.message });
    }
    req.user = user;
    next();
  });
};

// 3. Track the visitors on a hotel page
app.post('/visits', authenticateToken, (req, res) => {
  const { hotelId } = req.body;
  const userId = req.user.userId;

  if (!hotelId) {
    return res.status(400).json({ error: 'Hotel ID is required.' });
  }
  const query = 'INSERT INTO visits (user_id, hotel_id, visit_date) VALUES (?, ?, NOW())';
  db.query(query, [userId, hotelId], (err, result) => {
    if (err) {
      console.error('Error tracking visit:', err);
      return res.status(500).json({ error: 'Failed to track visit.' });
    }
    res.status(201).json({ visitId: result.insertId });
  });
});

// 4. Initiate a Draft Booking
app.post('/draft-bookings', authenticateToken, (req, res) => {
  const { hotelId, checkInDate, checkOutDate, price } = req.body;
  const userId = req.user.userId;

  if (!hotelId || !checkInDate || !checkOutDate || !price) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const query = 'INSERT INTO draft_bookings (user_id, hotel_id, check_in_date, check_out_date, price) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [userId, hotelId, checkInDate, checkOutDate, price], (err, result) => {
    if (err) {
      console.error('Error initiating draft booking:', err);
      return res.status(500).json({ error: 'Failed to create draft booking.' });
    }
    res.status(201).json({ draftBookingId: result.insertId });
  });
});

// 5. Complete a Booking
app.post('/completed-bookings', authenticateToken, (req, res) => {
  const { draftBookingId } = req.body;

  if (!draftBookingId) {
    return res.status(400).json({ error: 'Draft booking ID is required.' });
  }
  const query = `
    INSERT INTO completed_bookings (user_id, hotel_id, check_in_date, check_out_date, price)
    SELECT user_id, hotel_id, check_in_date, check_out_date, price
    FROM draft_bookings
    WHERE id = ?
  `;
  db.query(query, [draftBookingId], (err, result) => {
    if (err) {
      console.error('Error completing booking:', err);
      return res.status(500).json({ error: 'Failed to complete booking.' });
    }
    const deleteQuery = 'DELETE FROM draft_bookings WHERE id = ?';
    db.query(deleteQuery, [draftBookingId], (err) => {
      if (err) {
        console.error('Error deleting draft booking:', err);
        return res.status(500).json({ error: 'Failed to delete draft booking.' });
      }
      res.status(201).json({ completedBookingId: result.insertId });
    });
  });
});

// 6. Display Ongoing Activities on the Hotel Page
app.get('/activities', authenticateToken, (req, res) => {
  const { hotelId } = req.query;

  if (!hotelId) {
    return res.status(400).json({ error: 'Hotel ID is required.' });
  }
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM visits WHERE hotel_id = ?) AS totalVisits,
      (SELECT COUNT(*) FROM draft_bookings WHERE hotel_id = ?) AS draftBookings,
      (SELECT COUNT(*) FROM completed_bookings WHERE hotel_id = ?) AS completedBookings
  `;
  db.query(query, [hotelId, hotelId, hotelId], (err, results) => {
    if (err) {
      console.error('Error retrieving activities:', err);
      return res.status(500).json({ error: 'Failed to retrieve activities.' });
    }
    res.json(results[0]);
  });
});

// 7. Recommendation Engine
app.get('/recommendations', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // Query to get hotel recommendations based on user activities
  const query = `
    SELECT hotel_id, COUNT(*) AS score
    FROM (
      SELECT hotel_id FROM visits WHERE user_id = ?
      UNION ALL
      SELECT hotel_id FROM draft_bookings WHERE user_id = ?
      UNION ALL
      SELECT hotel_id FROM completed_bookings WHERE user_id = ?
    ) AS user_activities
    GROUP BY hotel_id
    ORDER BY score DESC
    LIMIT 5
  `;
  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error('Error generating recommendations:', err);
      return res.status(500).json({ error: 'Failed to generate recommendations.' });
    }
    res.json(results);
  });
});

// 8. Get List of Hotels
app.get('/hotels', (req, res) => {
  const query = 'SELECT * FROM hotels';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching hotels:', err);
      return res.status(500).json({ error: 'Failed to retrieve hotels.' });
    }
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
