const express = require('express');
const cors = require('cors');
const { join } = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const server = express();
const port = process.env.PORT || 3000;

// Enable CORS for cross-origin frontend requests
server.use(cors());
server.use(express.json());

// Dynamic database prefix configuration to avoid table naming conflicts
const DB_PREFIX = process.env.DB_TABLE_PREFIX || 'sd_';
const CONTACT_TABLE = `${DB_PREFIX}contact`;

// Knex database configuration
const knex = require('knex')({
  client: process.env.DB_CLIENT || 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 2, max: 10 },
});

// Automatic table initialization on startup
async function initDatabase() {
  try {
    const exists = await knex.schema.hasTable(CONTACT_TABLE);
    if (!exists) {
      await knex.schema.createTable(CONTACT_TABLE, (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('email', 255).notNullable();
        table.string('phone', 20);
        table.text('message').notNullable();
        table.string('status', 20).defaultTo('unread');
        table.timestamp('created_at').defaultTo(knex.fn.now());
      });
      console.log(`[Database] Table "${CONTACT_TABLE}" initialized successfully.`);
    } else {
      console.log(`[Database] Table "${CONTACT_TABLE}" already exists.`);
    }
  } catch (error) {
    console.error('[Database Error] Schema initialization failed:', error);
  }
}

// Google Drive API Setup
const { google } = require('googleapis');
const googleEmail = process.env.GOOGLE_CLIENT_EMAIL;
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : null;
const existingFileId = process.env.GOOGLE_DRIVE_FILE_ID;

let drive = null;
if (googleEmail && googlePrivateKey) {
  const jwtClient = new google.auth.JWT(
    googleEmail,
    null,
    googlePrivateKey,
    ['https://www.googleapis.com/auth/drive']
  );
  drive = google.drive({ version: 'v3', auth: jwtClient });
}

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Serve frontend static files in production
server.use(express.static(join(__dirname, '../frontend/dist')));

// Endpoint: Process contact form submissions
server.post('/api/add-user', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    // 1. Insert message record into buyer's database
    await knex(CONTACT_TABLE).insert({
      name,
      email,
      phone: phone || null,
      message,
    });

    // 2. Sync to Google Drive CSV (Optional based on configuration)
    if (drive && existingFileId) {
      try {
        let existingData = '';
        try {
          const driveResponse = await drive.files.get(
            { fileId: existingFileId, alt: 'media' },
            { responseType: 'text' }
          );
          existingData = driveResponse.data;
        } catch {
          existingData = '"Name","Email","Phone","Message"\n';
        }

        const clean = (val) => (val ? String(val).replace(/"/g, '""') : '');
        const newCsvLine = `"${clean(name)}","${clean(email)}","${clean(phone)}","${clean(message)}"\n`;

        await drive.files.update({
          fileId: existingFileId,
          resource: { name: 'form_data.csv' },
          media: { mimeType: 'text/csv', body: existingData + newCsvLine },
        });
      } catch (driveErr) {
        console.error('[Google Drive Error] Failed to sync CSV:', driveErr.message);
      }
    }

    // 3. Send email notifications (Optional)
    if (process.env.SEND_EMAIL_ALERTS === 'true') {
      try {
        await transporter.sendMail({
          from: `"Business Portal" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_ALERT_EMAIL,
          subject: 'New Contact Form Submission',
          html: `<h3>New Message Received</h3>
                 <ul>
                   <li><b>Name:</b> ${name}</li>
                   <li><b>Email:</b> ${email}</li>
                   <li><b>Phone:</b> ${phone || 'N/A'}</li>
                   <li><b>Message:</b> ${message}</li>
                 </ul>`,
        });
      } catch (emailErr) {
        console.error('[Email Error] Failed to send notification:', emailErr.message);
      }
    }

    return res.status(200).json({ message: 'Submission completed successfully.' });
  } catch (error) {
    console.error('[Server Error] Submission failed:', error);
    return res.status(500).json({ error: 'Internal server error processing submission.' });
  }
});

// Single Page Application (SPA) catch-all routing for production
if (process.env.NODE_ENV === 'production') {
  server.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Start backend server
server.listen(port, async () => {
  console.log(`Backend server running on port ${port}`);
  await initDatabase();
});