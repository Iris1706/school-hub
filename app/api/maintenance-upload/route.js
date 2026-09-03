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

// 轉換西元年為民國年
function toROCYear(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rocYear = year - 1911;
  return `${rocYear}${month}${day}`;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const schoolName = formData.get('schoolName');
    const date = formData.get('date');
    const handler = formData.get('handler');

    if (!file || !schoolName || !date || !handler) {
      return Response.json({ error: '缺少必要欄位' }, { status: 400 });
    }

    // 讀取檔案為 Buffer
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    const filename = `${toROCYear(date)}_${schoolName}_${handler}.png`;

    // 上傳到 Google Drive
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

    return Response.json({
      success: true,
      fileId: response.data.id,
      filename: filename,
      webViewLink: response.data.webViewLink,
    });
  } catch (error) {
    console.error('Maintenance upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
