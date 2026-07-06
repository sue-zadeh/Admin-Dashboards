const express = require('express');
const { join } = require('path');
const server = express();
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer');
require('dotenv').config();

// Knex Configuration
const knexConfig = require('./database/knexfile');
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const knex = require('knex')(config);

// Google APIs Configuration
const { google } = require('googleapis');

// Securely load credentials from environment variables or a secure file path
const googleEmail = process.env.GOOGLE_CLIENT_EMAIL;
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
const existingFileId = process.env.GOOGLE_DRIVE_FILE_ID; // Loaded from .env dynamically

const scopes = ['https://www.googleapis.com/auth/drive'];

const jwtClient = new google.auth.JWT(
  googleEmail,
  null,
  googlePrivateKey,
  scopes
);

const drive = google.drive({ version: 'v3', auth: jwtClient });

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

server.use(express.json());
server.use(express.static(join(__dirname, '..', 'dist')));

// API Route for Form Submission
server.post('/api/add-user', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    // 1. Save form submission to the SQL Database via Knex
    // 'submissions' table is now a generic name suitable for commercial templates
    await knex('submissions').insert({ name, email, phone, message });
    console.log('Form submission saved to DB:', { name, email });

    // 2. Fetch existing CSV data directly as text (Fixes the stream race condition)
    let existingData = '';
    try {
      const driveResponse = await drive.files.get({
        fileId: existingFileId,
        alt: 'media',
      }, { responseType: 'text' });
      
      existingData = driveResponse.data;
    } catch (driveError) {
      console.warn('Could not fetch existing CSV, starting fresh or check file ID:', driveError.message);
      // Fallback in case file is brand new or completely empty
      existingData = '"Name","Email","Phone","Message"\n';
    }

    // 3. Append the new row safely
    const newCsvLine = `"${name.replace(/"/g, '""')}","${email.replace(/"/g, '""')}","${phone.replace(/"/g, '""')}","${message.replace(/"/g, '""')}"\n`;
    const updatedCsvData = existingData + newCsvLine;

    // 4. Update the file on Google Drive stably using async/await
    await drive.files.update({
      fileId: existingFileId,
      resource: { name: 'form_data.csv' },
      media: {
        mimeType: 'text/csv',
        body: updatedCsvData,
      },
      fields: 'id',
    });

    console.log('Google Drive CSV updated successfully.');

    // 5. Optional: Send Email alert if configured
    if (process.env.SEND_EMAIL_ALERTS === 'true') {
      await transporter.sendMail({
        from: `"Website Form" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: 'New Commercial Contact Form Submission',
        html: `<p>You received a new message:</p><ul><li><b>Name:</b> ${name}</li><li><b>Email:</b> ${email}</li><li><b>Message:</b> ${message}</li></ul>`
      });
    }

    return res.status(200).json({
      message: 'Form submission processed and saved successfully across all layers.',
    });

  } catch (error) {
    console.error('Critical Strategy Error:', error);
    return res.status(500).json({ error: 'Internal server error processing submission.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  server.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

server.listen(port, () => {
  console.log(`Commercial Server operating on port ${port}`);
});