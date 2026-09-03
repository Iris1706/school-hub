import { google } from 'googleapis';
import { Readable } from 'stream';

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

    // 檢查必要環境變數
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
      return Response.json(
        { error: '缺少環境變數: GOOGLE_SERVICE_ACCOUNT_KEY_BASE64' },
        { status: 500 }
      );
    }

    if (!process.env.Picture_Drive_Folder_ID) {
      return Response.json(
        { error: '缺少環境變數: Picture_Drive_Folder_ID' },
        { status: 500 }
      );
    }

    // 解碼 base64 的 service account key
    const decodedKey = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
      'base64'
    ).toString('utf-8');

    const credentials = JSON.parse(decodedKey);

    // 初始化 Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 讀取檔案
    const bytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(bytes);
    const filename = `${toROCYear(date)}_${schoolName}_${handler}.png`;

    // 上傳到 Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'image/png',
        parents: [process.env.Picture_Drive_Folder_ID],
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
    console.error('Upload error:', error.message);
    return Response.json(
      { error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}
