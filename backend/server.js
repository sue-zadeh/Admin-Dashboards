// Import the express framework for creating web server routes
const express = require('express');

// Import Knex query builder to interact with the database
const knex = require('knex');

// Initialize Express web application instance
const app = express();

// Middleware: Parse incoming requests with JSON payloads into JavaScript objects
app.use(express.json());

// Initialize Knex connection using MySQL2 database driver
const db = knex({
  client: 'mysql2', // Specifies database client driver (requires 'mysql2' package installed in backend)
  connection: {
    host: process.env.DB_HOST || '127.0.0.1', // Database connection host address
    user: process.env.DB_USER || 'root',      // Database user username
    password: process.env.DB_PASSWORD || '',   // Database user password
    database: process.env.DB_NAME || 'mydb',   // Target database name
  },
});

// Define POST route endpoint for handling '/api/add-user' requests from ContactUs.jsx
app.post('/api/add-user', async (req, res) => {
  // Destructure name, email, phone, and message from incoming request body
  const { name, email, phone, message } = req.body;

  // Perform basic server-side validation for mandatory fields
  if (!name || !email || !message) {
    // Return HTTP 400 Bad Request with JSON error message if validation fails
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Execute database insertion inside try-catch block for error management
  try {
    // Insert new user entry into 'users' table using Knex
    await db('users').insert({
      name,
      email,
      phone,
      message,
      created_at: db.fn.now(), // Set creation timestamp to current database timestamp
    });

    // Send HTTP 201 Created response back to client on success
    return res.status(201).json({ message: 'User added successfully.' });
  } catch (error) {
    // Log server-side database error details to standard error output
    console.error('Database insertion error:', error);

    // Send HTTP 500 Internal Server Error back to client
    return res.status(500).json({ error: 'Failed to process request due to server error.' });
  }
});

// Set server listening port from environment or fallback to port 5000
const PORT = process.env.PORT || 5000;

// Start server and output confirmation log to terminal console
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});