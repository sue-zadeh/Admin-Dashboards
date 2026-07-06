const express = require('express');
const { join } = require('path');
const server = express();
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer');
require('dotenv').config();

// Knex config wired up for MySQL
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

// Google Drive API Setup
const { google } = require('googleapis');
const googleEmail = process.env.GOOGLE_CLIENT_EMAIL;
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
const existingFileId = process.env.GOOGLE_DRIVE_FILE_ID;

const jwtClient = new google.auth.JWT(
  googleEmail,
  null,
  googlePrivateKey,
  ['https://www.googleapis.com/auth/drive']
);
const drive = google.drive({ version: 'v3', auth: jwtClient });

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

server.use(express.json());
// Serve production assets from the frontend build
server.use(express.static(join(__dirname, '../frontend/dist')));

// Unified API Endpoint
server.post('/api/add-user', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    // 1. Save to MySQL
    await knex('submissions').insert({ name, email, phone, message });

    // 2. Sync to Google Drive CSV (Stable Text Fetch)
    let existingData = '';
    try {
      const driveResponse = await drive.files.get({
        fileId: existingFileId,
        alt: 'media',
      }, { responseType: 'text' });
      existingData = driveResponse.data;
    } catch (err) {
      existingData = '"Name","Email","Phone","Message"\n';
    }

    const clean = (val) => (val ? val.replace(/"/g, '""') : '');
    const newCsvLine = `"${clean(name)}","${clean(email)}","${clean(phone)}","${clean(message)}"\n`;
    
    await drive.files.update({
      fileId: existingFileId,
      resource: { name: 'form_data.csv' },
      media: { mimeType: 'text/csv', body: existingData + newCsvLine },
    });

    // 3. Email Alerts
    if (process.env.SEND_EMAIL_ALERTS === 'true') {
      await transporter.sendMail({
        from: `"Business Portal" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_ALERT_EMAIL,
        subject: 'New Contact Form Submission',
        html: `<h3>New Message</h3><ul><li><b>Name:</b> ${name}</li><li><b>Email:</b> ${email}</li><li><b>Message:</b> ${message}</li></ul>`
      });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal processing error.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  server.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/dist', 'index.html'));
  });
}

server.listen(port, () => console.log(`Backend live on port ${port}`));