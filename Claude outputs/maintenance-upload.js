// pages/api/maintenance-upload.js
// This is a template for uploading maintenance records to Google Drive
// You need to set up Google authentication credentials first

import { google } from 'googleapis';
import { Readable } from 'stream';

const drive = google.drive({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  }),
});

// Convert Western year to ROC (Taiwan) year
function toROCYear(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rocYear = year - 1911;
  return `${rocYear}${month}${day}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, schoolName, date, handler } = req.body;

    if (!file || !schoolName || !date || !handler) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    // Decode base64 file
    const fileBuffer = Buffer.from(file.split(',')[1], 'base64');
    const filename = `${toROCYear(date)}_${schoolName}_${handler}.png`;

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'image/png',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: 'image/png',
        body: Readable.from(fileBuffer),
      },
    });

    return res.status(200).json({
      success: true,
      fileId: response.data.id,
      filename: filename,
      webViewLink: response.data.webViewLink,
    });
  } catch (error) {
    console.error('Maintenance upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
