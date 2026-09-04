// app/api/maintenance-upload/route.js
import { google } from 'googleapis';
import { Readable } from 'stream';
import { cookies } from 'next/headers';

// 轉換西元年為民國年
function toROCYear(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rocYear = year - 1911;
  return `${rocYear}${month}${day}`;
}

// 用 refresh token 獲取新的 access token
async function getAccessToken(refreshToken) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('無法刷新 token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
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

    // 檢查環境變數
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return Response.json(
        { error: '缺少 Google OAuth 設定' },
        { status: 500 }
      );
    }

    if (!process.env.Picture_Drive_Folder_ID) {
      return Response.json(
        { error: '缺少環境變數: Picture_Drive_Folder_ID' },
        { status: 500 }
      );
    }

    // 從 cookie 中取得 refresh token
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!refreshToken) {
      return Response.json(
        { error: '未授權，請先登入', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 取得 access token
    const accessToken = await getAccessToken(refreshToken);

    // 初始化 Google Auth（使用 OAuth token）
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ access_token: accessToken });

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
    console.error('Upload error:', error);

    // 檢查是否是授權錯誤
    if (error.message.includes('Unauthorized')) {
      return Response.json(
        { error: '授權已過期，請重新登入', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    return Response.json(
      { error: error.message || '上傳失敗' },
      { status: 500 }
    );
  }
}
