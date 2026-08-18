import { google } from 'googleapis';

function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName') || 'Pawn';
    const type = searchParams.get('type') || 'completed';

    const sheets = getSheetsClient();

    // 決定要讀取的欄位範圍
    let range;
    if (type === 'completed') {
      range = 'A2:H'; // 已完修：第 2 行是標題，第 3 行開始是資料
    } else if (type === 'inProgress') {
      range = 'J2:P'; // 處理中：第 2 行是標題，第 3 行開始是資料
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.Repair_SHEET_ID,
      range: `${sheetName}!${range}`,
    });

    const values = response.data.values || [];

    // 第一行是標題
    const headers = values[0] || [];
    // 剩餘的是資料
    const rows = values.slice(1);

    return Response.json({
      success: true,
      headers,
      rows,
      sheetName,
      type,
    });
  } catch (error) {
    console.error('讀取 Sheet 失敗:', error.message);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
